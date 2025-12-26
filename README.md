# 📝 Sistem Manajemen Tugas — Arsitektur Microservices

Dokumen ini menjelaskan cara kerja dan langkah deployment aplikasi To‑Do berbasis microservices. Ditulis ringkas dan mudah dipahami, fokus pada setup di lingkungan cloud ) menggunakan Docker.

## Ringkasan Arsitektur

Aplikasi terbagi menjadi beberapa layanan yang saling terpisah dan berjalan di jaringan Docker (mis. `app-network`):

- Auth Service (port 3001): pendaftaran, login, dan otorisasi (JWT).
- Todo Service (port 3002): operasi data tugas (CRUD).
- Gateway / Frontend (port 8080): Nginx sebagai reverse proxy dan penyaji file statis.
- Database: MySQL 8.0 dengan dua database terpisah `user_db` dan `todo_db`.

---

## Deployment di Azure — Ringkas

Untuk VM dengan RAM terbatas (contoh: 1 GiB), MySQL bisa gagal saat inisialisasi. Ikuti langkah singkat ini untuk stabilitas dan deployment.

### 1) Tambah Swap 2GB (untuk stabilitas MySQL)

Jalankan perintah berikut di VM (Linux):

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
free -m
```

Jika `fallocate` tidak tersedia, gunakan:

```bash
sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
```

### 2) Jalankan layanan dengan Docker Compose

Pastikan file `docker-compose.yml` ada lalu jalankan:

```bash
sudo docker compose up --build -d
```

Jika menggunakan versi lama: `sudo docker-compose up --build -d`.

### 3) Buka port di Azure

Di Azure Portal, tambahkan aturan pada NSG/Network settings VM supaya:

- Port 8080 (TCP) — akses aplikasi/UI
- Port 22 (TCP) — akses SSH

Batasi sumber IP jika perlu untuk keamanan.

### 4) Akses aplikasi

Buka: http://20.2.91.31:8080/

---

## Akun Demo & Hak Akses

- Default demo: Username `admin`, Password `admin123`.

Untuk mengubah role menjadi admin lewat database:

1) Masuk ke MySQL pada kontainer:

```bash
sudo docker exec -it <mysql_container> mysql -u root -p
```

2) Jalankan SQL:

```sql
USE user_db;
UPDATE users SET role = 'admin' WHERE username = 'admin';
SELECT * FROM users;
```

Ganti `<mysql_container>` dengan nama kontainer yang terlihat di `docker ps`.

---

## API — Endpoints Utama

Semua request masuk lewat Gateway (port 8080) lalu diteruskan ke layanan yang sesuai.

Auth Service

| Method | Endpoint | Kegunaan |
| --- | --- | --- |
| POST | /auth/register | Daftar akun baru (role: user) |
| POST | /auth/login | Login dan dapatkan JWT |
| GET  | /auth/users | Daftar pengguna (Admin saja) |
| PUT  | /auth/update | Perbarui profil pengguna |

Todo Service

| Method | Endpoint | Kegunaan |
| --- | --- | --- |
| GET    | /todos | Ambil daftar tugas pengguna |
| POST   | /todos | Tambah tugas baru |
| PUT    | /todos/:id | Update tugas berdasarkan ID |
| DELETE | /todos/:id | Hapus tugas berdasarkan ID |

---

## Teknologi Utama

- Node.js & Express (backend)
- MySQL 8.0 (database)
- Nginx (gateway / reverse proxy)
- Docker & Docker Compose (containerization)
- Bcrypt & JWT (keamanan)
- Infrastruktur: Microsoft Azure

---

## Membersihkan Resource di Azure

Hapus Resource Group setelah selesai untuk menghemat biaya:

```bash
az group delete --name rg-hands-on --yes --no-wait
```

---




