Sistem Manajemen Tugas (To-Do List)

Proyek ini adalah implementasi arsitektur **Microservices** untuk aplikasi manajemen tugas. Aplikasi dibangun menggunakan Node.js, Express, MySQL, dan dikemas menggunakan Docker.

## 🏗️ Arsitektur Sistem

Aplikasi ini terdiri dari 4 layanan utama yang saling terhubung dalam jaringan Docker (`app-network`):

1.  **Auth Service** (Port 3001): Menangani registrasi, login, dan autentikasi berbasis JWT.
2.  **Todo Service** (Port 3002): Menangani CRUD tugas (Create, Read, Update, Delete).
3.  **Gateway / Frontend** (Port 80/8080): Menggunakan Nginx sebagai Reverse Proxy dan melayani file statis HTML/CSS/JS.
4.  **Database** (MySQL 8.0): Menyimpan data user (`user_db`) dan data tugas (`todo_db`).

## 🚀 Cara Menjalankan Aplikasi

Prasyarat: Pastikan **Docker** dan **Docker Compose** sudah terinstall.

1.  **Clone atau Download** repository ini.
2.  Buka terminal di folder root proyek.
3.  Jalankan perintah berikut:
    ```bash
    sudo docker-compose up --build -d
    ```
4.  Tunggu hingga semua container berjalan (Status: Up).
5.  Akses aplikasi melalui browser:
    👉 **http://localhost:8080**

## 🔑 Akun Demo

Anda dapat mendaftar akun baru, atau menggunakan akun Admin default (jika sudah di-generate):
- **Username:** `admin`
- **Password:** `admin123`

## 📚 Dokumentasi API Endpoint

Berikut adalah daftar endpoint yang tersedia di backend. Semua request melalui Gateway.

### Auth Service
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `POST` | `/auth/register` | Mendaftar akun baru (Default role: User) |
| `POST` | `/auth/login` | Login dan mendapatkan Token JWT |
| `GET` | `/auth/users` | (Auth) Melihat daftar semua pengguna |
| `PUT` | `/auth/update` | (Auth) Mengganti username/password |

### Todo Service
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/todos` | (Auth) Melihat semua tugas |
| `POST` | `/todos` | (Auth) Menambah tugas baru |
| `PUT` | `/todos/:id` | (Auth) Update status tugas (User: Milik sendiri, Admin: Semua) |
| `DELETE`| `/todos/:id` | (Auth) Hapus tugas (User: Milik sendiri, Admin: Semua) |

## 🛠️ Teknologi yang Digunakan

- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Frontend:** HTML5, CSS3 (Dark Mode + Poppins), Vanilla JS
- **Gateway:** Nginx
- **Containerization:** Docker & Docker Compose
- **Security:** Bcrypt (Hashing), JSON Web Token (JWT)

---
*Dibuat untuk memenuhi Tugas Besar Mata Kuliah Microservices.*
