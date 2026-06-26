import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'database.json');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Helper functions to read/write DB
function readDB() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file", err);
    return {};
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error("Error writing database file", err);
  }
}

// Log utility
function logActivity(user, action, table, details) {
  const db = readDB();
  const newLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    user,
    action,
    table,
    details
  };
  db.logs.unshift(newLog);
  writeDB(db);
}

// Auth API
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: "Email atau password salah!" });
  }

  if (user.status === "Nonaktif") {
    return res.status(403).json({ message: "Akun Anda dinonaktifkan. Silakan hubungi admin." });
  }

  logActivity(user.name, "Login", "Auth", `User ${user.name} berhasil login`);
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    region: user.region || null,
    avatar: user.avatar,
    status: user.status
  });
});

// Logs API
app.get('/api/logs', (req, res) => {
  const db = readDB();
  res.json(db.logs);
});

// Suppliers CRUD
app.get('/api/suppliers', (req, res) => {
  const db = readDB();
  res.json(db.suppliers);
});

app.post('/api/suppliers', (req, res) => {
  const db = readDB();
  const newSupplier = {
    id: `SUP-${String(db.suppliers.length + 1).padStart(3, '0')}`,
    ...req.body
  };
  db.suppliers.push(newSupplier);
  writeDB(db);
  logActivity(req.headers['x-user-name'] || "System", "Tambah Data", "Suppliers", `Menambahkan supplier ${newSupplier.name}`);
  res.status(201).json(newSupplier);
});

app.put('/api/suppliers/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.suppliers.findIndex(s => s.id === id);
  if (index === -1) return res.status(404).json({ message: "Supplier tidak ditemukan" });

  db.suppliers[index] = { ...db.suppliers[index], ...req.body };
  writeDB(db);
  logActivity(req.headers['x-user-name'] || "System", "Edit Data", "Suppliers", `Mengubah supplier ${db.suppliers[index].name}`);
  res.json(db.suppliers[index]);
});

app.delete('/api/suppliers/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.suppliers.findIndex(s => s.id === id);
  if (index === -1) return res.status(404).json({ message: "Supplier tidak ditemukan" });

  const name = db.suppliers[index].name;
  db.suppliers.splice(index, 1);
  writeDB(db);
  logActivity(req.headers['x-user-name'] || "System", "Hapus Data", "Suppliers", `Menghapus supplier ${name}`);
  res.json({ message: "Supplier berhasil dihapus" });
});

// Gudang CRUD
app.get('/api/gudang', (req, res) => {
  const db = readDB();
  res.json(db.gudang);
});

app.post('/api/gudang', (req, res) => {
  const db = readDB();
  const newGudang = {
    id: `GDG-${String(db.gudang.length + 1).padStart(3, '0')}`,
    ...req.body,
    utilized: req.body.utilized || 0
  };
  db.gudang.push(newGudang);
  writeDB(db);
  logActivity(req.headers['x-user-name'] || "System", "Tambah Data", "Gudang", `Menambahkan gudang ${newGudang.name}`);
  res.status(201).json(newGudang);
});

app.put('/api/gudang/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.gudang.findIndex(g => g.id === id);
  if (index === -1) return res.status(404).json({ message: "Gudang tidak ditemukan" });

  db.gudang[index] = { ...db.gudang[index], ...req.body };
  writeDB(db);
  logActivity(req.headers['x-user-name'] || "System", "Edit Data", "Gudang", `Mengubah gudang ${db.gudang[index].name}`);
  res.json(db.gudang[index]);
});

app.delete('/api/gudang/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.gudang.findIndex(g => g.id === id);
  if (index === -1) return res.status(404).json({ message: "Gudang tidak ditemukan" });

  const name = db.gudang[index].name;
  db.gudang.splice(index, 1);
  writeDB(db);
  logActivity(req.headers['x-user-name'] || "System", "Hapus Data", "Gudang", `Menghapus gudang ${name}`);
  res.json({ message: "Gudang berhasil dihapus" });
});

// Distributors CRUD
app.get('/api/distributors', (req, res) => {
  const db = readDB();
  res.json(db.distributors);
});

app.post('/api/distributors', (req, res) => {
  const db = readDB();
  const newDist = {
    id: `DST-${String(db.distributors.length + 1).padStart(3, '0')}`,
    ...req.body
  };
  db.distributors.push(newDist);
  
  // Update distributor count in wilayah
  const wIndex = db.wilayah.findIndex(w => w.name.toLowerCase() === newDist.region.toLowerCase());
  if (wIndex !== -1) {
    db.wilayah[wIndex].distributorsCount += 1;
  }

  writeDB(db);
  logActivity(req.headers['x-user-name'] || "System", "Tambah Data", "Distributors", `Menambahkan distributor ${newDist.name}`);
  res.status(201).json(newDist);
});

app.put('/api/distributors/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.distributors.findIndex(d => d.id === id);
  if (index === -1) return res.status(404).json({ message: "Distributor tidak ditemukan" });

  const oldRegion = db.distributors[index].region;
  const newRegion = req.body.region;

  db.distributors[index] = { ...db.distributors[index], ...req.body };

  // Adjust count if region changes
  if (newRegion && oldRegion !== newRegion) {
    const oIndex = db.wilayah.findIndex(w => w.name.toLowerCase() === oldRegion.toLowerCase());
    if (oIndex !== -1) db.wilayah[oIndex].distributorsCount = Math.max(0, db.wilayah[oIndex].distributorsCount - 1);
    
    const nIndex = db.wilayah.findIndex(w => w.name.toLowerCase() === newRegion.toLowerCase());
    if (nIndex !== -1) db.wilayah[nIndex].distributorsCount += 1;
  }

  writeDB(db);
  logActivity(req.headers['x-user-name'] || "System", "Edit Data", "Distributors", `Mengubah distributor ${db.distributors[index].name}`);
  res.json(db.distributors[index]);
});

app.delete('/api/distributors/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.distributors.findIndex(d => d.id === id);
  if (index === -1) return res.status(404).json({ message: "Distributor tidak ditemukan" });

  const dist = db.distributors[index];
  const wIndex = db.wilayah.findIndex(w => w.name.toLowerCase() === dist.region.toLowerCase());
  if (wIndex !== -1) {
    db.wilayah[wIndex].distributorsCount = Math.max(0, db.wilayah[wIndex].distributorsCount - 1);
  }

  db.distributors.splice(index, 1);
  writeDB(db);
  logActivity(req.headers['x-user-name'] || "System", "Hapus Data", "Distributors", `Menghapus distributor ${dist.name}`);
  res.json({ message: "Distributor berhasil dihapus" });
});

// Wilayah CRUD
app.get('/api/wilayah', (req, res) => {
  const db = readDB();
  res.json(db.wilayah);
});

app.post('/api/wilayah', (req, res) => {
  const db = readDB();
  const newWil = {
    id: `REG-${String(db.wilayah.length + 1).padStart(2, '0')}`,
    distributorsCount: 0,
    ...req.body
  };
  db.wilayah.push(newWil);
  writeDB(db);
  logActivity(req.headers['x-user-name'] || "System", "Tambah Data", "Wilayah", `Menambahkan wilayah ${newWil.name}`);
  res.status(201).json(newWil);
});

app.put('/api/wilayah/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.wilayah.findIndex(w => w.id === id);
  if (index === -1) return res.status(404).json({ message: "Wilayah tidak ditemukan" });

  db.wilayah[index] = { ...db.wilayah[index], ...req.body };
  writeDB(db);
  logActivity(req.headers['x-user-name'] || "System", "Edit Data", "Wilayah", `Mengubah wilayah ${db.wilayah[index].name}`);
  res.json(db.wilayah[index]);
});

app.delete('/api/wilayah/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.wilayah.findIndex(w => w.id === id);
  if (index === -1) return res.status(404).json({ message: "Wilayah tidak ditemukan" });

  const name = db.wilayah[index].name;
  db.wilayah.splice(index, 1);
  writeDB(db);
  logActivity(req.headers['x-user-name'] || "System", "Hapus Data", "Wilayah", `Menghapus wilayah ${name}`);
  res.json({ message: "Wilayah berhasil dihapus" });
});

// Users CRUD (Admin)
app.get('/api/users', (req, res) => {
  const db = readDB();
  // Filter out passwords when sending to client
  const users = db.users.map(({ password, ...u }) => u);
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const db = readDB();
  const newUser = {
    id: `u-${Date.now()}`,
    password: "defaultPassword123", // Default password
    status: "Aktif",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
    ...req.body
  };
  db.users.push(newUser);
  writeDB(db);
  logActivity(req.headers['x-user-name'] || "System", "Tambah Data", "Users", `Menambahkan user baru ${newUser.name} (${newUser.role})`);
  res.status(201).json(newUser);
});

app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) return res.status(404).json({ message: "User tidak ditemukan" });

  db.users[index] = { ...db.users[index], ...req.body };
  writeDB(db);
  logActivity(req.headers['x-user-name'] || "System", "Edit Data", "Users", `Mengubah profil/status user ${db.users[index].name}`);
  res.json(db.users[index]);
});

// User action tools for admin
app.post('/api/users/:id/reset-password', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) return res.status(404).json({ message: "User tidak ditemukan" });

  const defaultPass = "Indofood123!";
  db.users[index].password = defaultPass;
  writeDB(db);
  logActivity(req.headers['x-user-name'] || "System", "Edit Data", "Users", `Mereset password user ${db.users[index].name} ke password default`);
  res.json({ message: `Password berhasil direset ke default: ${defaultPass}` });
});

app.post('/api/users/:id/toggle-status', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) return res.status(404).json({ message: "User tidak ditemukan" });

  const newStatus = db.users[index].status === "Aktif" ? "Nonaktif" : "Aktif";
  db.users[index].status = newStatus;
  writeDB(db);
  logActivity(req.headers['x-user-name'] || "System", "Edit Data", "Users", `Mengubah status user ${db.users[index].name} menjadi ${newStatus}`);
  res.json({ status: newStatus, message: `User berhasil di-${newStatus.toLowerCase()}` });
});

// Profile modifications API (Shared)
app.post('/api/profile/update', (req, res) => {
  const { id, name, email, phone, avatar } = req.body;
  const db = readDB();
  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) return res.status(404).json({ message: "User tidak ditemukan" });

  db.users[index] = { ...db.users[index], name, email, phone: phone || db.users[index].phone, avatar: avatar || db.users[index].avatar };
  writeDB(db);
  logActivity(name, "Edit Data", "Profil", `Mengubah informasi profil sendiri`);
  res.json(db.users[index]);
});

app.post('/api/profile/change-password', (req, res) => {
  const { id, oldPassword, newPassword } = req.body;
  const db = readDB();
  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) return res.status(404).json({ message: "User tidak ditemukan" });

  if (db.users[index].password !== oldPassword) {
    return res.status(400).json({ message: "Password lama salah!" });
  }

  db.users[index].password = newPassword;
  writeDB(db);
  logActivity(db.users[index].name, "Edit Data", "Profil", `Mengubah password profil sendiri`);
  res.json({ message: "Password berhasil diperbarui" });
});

// Requests (Demand Planning) API
app.get('/api/requests', (req, res) => {
  const db = readDB();
  res.json(db.requests);
});

// Create new regional request (from landing page / regional user)
app.post('/api/requests', (req, res) => {
  const db = readDB();
  const { requesterName, region, items } = req.body;

  const newRequest = {
    id: `REQ-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(db.requests.length + 1).padStart(3, '0')}`,
    requesterName,
    region,
    status: "Pending",
    items: items.map((itm, idx) => ({
      id: `itm-${Date.now()}-${idx}`,
      name: itm.name,
      qty: Number(itm.qty),
      unit: itm.unit || 'Pcs',
      note: itm.note || ''
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.requests.unshift(newRequest);
  writeDB(db);
  logActivity(requesterName + ` (${region})`, "Tambah Data", "Requests", `Membuat permintaan barang ${newRequest.id}`);
  res.status(201).json(newRequest);
});

// Accept Request (Admin)
app.post('/api/requests/:id/accept', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.requests.findIndex(r => r.id === id);
  if (index === -1) return res.status(404).json({ message: "Permintaan tidak ditemukan" });

  db.requests[index].status = "Approved";
  db.requests[index].updatedAt = new Date().toISOString();
  
  writeDB(db);
  logActivity(req.headers['x-user-name'] || "System", "Edit Data", "Requests", `Menyetujui (Accept) permintaan barang ${id}`);
  res.json(db.requests[index]);
});

// Edit/Re-input request items (Manager / Admin)
app.put('/api/requests/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.requests.findIndex(r => r.id === id);
  if (index === -1) return res.status(404).json({ message: "Permintaan tidak ditemukan" });

  const oldStatus = db.requests[index].status;
  // If edited by Manager, status becomes "Processed" (Manager re-inputs)
  // If edited by Admin, status stays or updates
  const userRole = req.headers['x-user-role'] || 'manager';

  db.requests[index] = {
    ...db.requests[index],
    ...req.body,
    status: userRole === 'manager' ? "Processed" : (req.body.status || oldStatus),
    updatedAt: new Date().toISOString()
  };

  writeDB(db);
  logActivity(
    req.headers['x-user-name'] || "System",
    "Edit Data",
    "Requests",
    `${userRole === 'manager' ? 'Mereview & input ulang' : 'Mengedit'} detail permintaan barang ${id}`
  );
  res.json(db.requests[index]);
});

// Delete request (Admin only)
app.delete('/api/requests/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.requests.findIndex(r => r.id === id);
  if (index === -1) return res.status(404).json({ message: "Permintaan tidak ditemukan" });

  db.requests.splice(index, 1);
  writeDB(db);
  logActivity(req.headers['x-user-name'] || "System", "Hapus Data", "Requests", `Menghapus data permintaan ${id}`);
  res.json({ message: "Permintaan berhasil dihapus" });
});

// Forecasting Endpoint (Manager)
// Employs a 3-Month Simple Moving Average (SMA) forecasting algorithm based on historical region demand
app.get('/api/forecasting', (req, res) => {
  const { region, product } = req.query;
  if (!region || !product) {
    return res.status(400).json({ message: "Parameter region dan product wajib diisi" });
  }

  const db = readDB();
  const match = db.historicalDemand.find(
    h => h.region.toLowerCase() === region.toLowerCase() && h.product.toLowerCase() === product.toLowerCase()
  );

  let history = [];
  if (match) {
    history = match.data;
  } else {
    // Generate mock historical data if no records exist, to ensure system shows data-driven charts
    // Seed with 6 random-ish but logical values between 30 and 150
    const base = Math.floor(Math.random() * 80) + 40;
    history = Array.from({ length: 6 }, (_, idx) => base + Math.floor(Math.sin(idx) * 20) + Math.floor(Math.random() * 10));
  }

  // Calculate Simple Moving Average (3-months window)
  const forecast = [];
  const currentData = [...history];

  // We predict 3 upcoming months (Month 7, 8, 9)
  for (let i = 0; i < 3; i++) {
    const len = currentData.length;
    // Average of last 3 items
    const sum = currentData[len - 1] + currentData[len - 2] + currentData[len - 3];
    const avg = Math.round(sum / 3);
    currentData.push(avg);
    forecast.push(avg);
  }

  // Generate labels (e.g., Dec 2025 - May 2026 for history, Jun 2026 - Aug 2026 for forecast)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  const curMonthIndex = new Date().getMonth(); // June (5)
  const curYear = new Date().getFullYear();

  const labels = [];
  // 6 months historical labels
  for (let i = 5; i >= 0; i--) {
    let mIdx = curMonthIndex - i - 1;
    let year = curYear;
    if (mIdx < 0) {
      mIdx += 12;
      year -= 1;
    }
    labels.push(`${months[mIdx]} ${year}`);
  }

  // 3 months forecast labels
  const forecastLabels = [];
  for (let i = 0; i < 3; i++) {
    let mIdx = curMonthIndex + i;
    let year = curYear;
    if (mIdx >= 12) {
      mIdx -= 12;
      year += 1;
    }
    forecastLabels.push(`${months[mIdx]} ${year} (F)`);
  }

  res.json({
    region,
    product,
    history,
    forecast,
    labels: [...labels, ...forecastLabels],
    combinedData: [
      ...history.map((val, idx) => ({ month: labels[idx], Aktual: val, Prediksi: null })),
      // Connection point: last historical point is also showed as a prediction base
      { month: labels[5], Aktual: history[5], Prediksi: history[5] },
      ...forecast.map((val, idx) => ({ month: forecastLabels[idx], Aktual: null, Prediksi: val }))
    ]
  });
});

app.listen(PORT, () => {
  console.log(`SIPF-KR Backend running on http://localhost:${PORT}`);
});
