# 📚 Knowledge Management App

Web app nhập liệu để quản lý kiến thức / ghi chú.
**Frontend:** Next.js (deploy lên Vercel) · **Backend:** Supabase (Postgres).

Mỗi ghi chú gồm: tiêu đề, chủ đề, tags, nội dung. Có thêm / sửa / xóa / tìm kiếm.

---

## 1. Tạo backend trên Supabase

1. Vào https://supabase.com → đăng nhập → **New project**.
2. Đặt tên project, chọn region gần (VD: Southeast Asia – Singapore), đặt mật khẩu database, bấm **Create**.
3. Đợi project khởi tạo (~1-2 phút).
4. Mở **SQL Editor** (thanh trái) → **New query** → dán toàn bộ nội dung file
   `supabase/schema.sql` → bấm **Run**. Bảng `notes` sẽ được tạo.
5. Mở **Project Settings → API**, ghi lại 2 giá trị:
   - **Project URL** → dùng cho `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → dùng cho `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 2. Chạy thử ở máy (tùy chọn)

Cần cài [Node.js](https://nodejs.org) (bản 18 trở lên).

```bash
cd knowledge-app
npm install

# tạo file .env.local từ mẫu rồi điền 2 key ở bước 1
cp .env.local.example .env.local   # Windows: copy .env.local.example .env.local

npm run dev
```

Mở http://localhost:3000 để nhập liệu thử.

---

## 3. Đẩy frontend lên Vercel

### Cách A — qua GitHub (khuyến nghị)

1. Tạo repo trên GitHub, đẩy thư mục `knowledge-app` lên:
   ```bash
   cd knowledge-app
   git init
   git add .
   git commit -m "Knowledge management app"
   git branch -M main
   git remote add origin https://github.com/<tài-khoản>/<repo>.git
   git push -u origin main
   ```
2. Vào https://vercel.com → **Add New → Project** → **Import** repo vừa tạo.
3. Ở mục **Environment Variables**, thêm 2 biến (lấy từ bước 1):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Bấm **Deploy**. Sau ~1 phút sẽ có link dạng `https://<tên>.vercel.app`.

### Cách B — qua Vercel CLI

```bash
npm i -g vercel
cd knowledge-app
vercel            # làm theo hướng dẫn, đăng nhập
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel --prod
```

---

## 4. Cấu trúc thư mục

```
knowledge-app/
├─ app/
│  ├─ layout.js          # Layout gốc
│  ├─ page.js            # Trang chính: form nhập + danh sách
│  └─ globals.css        # Giao diện
├─ lib/
│  └─ supabaseClient.js  # Kết nối Supabase
├─ supabase/
│  └─ schema.sql         # SQL tạo bảng + policy
├─ .env.local.example    # Mẫu biến môi trường
├─ package.json
└─ README.md
```

---

## Lưu ý bảo mật

Policy mặc định trong `schema.sql` cho phép **bất kỳ ai có anon key** đọc/ghi dữ liệu
— phù hợp cho app cá nhân, nhập liệu nhanh. Nếu cần đăng nhập theo người dùng,
hãy bật **Supabase Authentication** và sửa lại các policy để giới hạn theo `auth.uid()`.
