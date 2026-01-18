# 🚀 Hướng Dẫn Deploy Frontend Lên Vercel

## 📋 Mục Lục

1. [Yêu Cầu Trước Khi Deploy](#yêu-cầu-trước-khi-deploy)
2. [Chuẩn Bị Dự Án](#chuẩn-bị-dự-án)
3. [Cách 1: Deploy Qua Vercel Dashboard (Khuyến nghị)](#cách-1-deploy-qua-vercel-dashboard-khuyến-nghị)
4. [Cách 2: Deploy Qua Vercel CLI](#cách-2-deploy-qua-vercel-cli)
5. [Cấu Hình Environment Variables](#cấu-hình-environment-variables)
6. [Xử Lý Lỗi Thường Gặp](#xử-lý-lỗi-thường-gặp)
7. [Kiểm Tra Sau Khi Deploy](#kiểm-tra-sau-khi-deploy)

---

## 🔧 Yêu Cầu Trước Khi Deploy

### Công cụ cần có:

- ✅ **Node.js** phiên bản 18.x trở lên
- ✅ **Git** đã được cài đặt
- ✅ **Tài khoản Vercel** (đăng ký miễn phí tại [vercel.com](https://vercel.com))
- ✅ **Repository trên GitHub/GitLab/Bitbucket**

### Kiểm tra phiên bản Node.js:

```bash
node -v
# Cần >= 18.x
```

---

## 📁 Chuẩn Bị Dự Án

### 1. Kiểm tra build local

Trước khi deploy, hãy đảm bảo dự án build thành công:

```bash
# Cài đặt dependencies
npm install

# Build dự án
npm run build

# Preview build (tùy chọn)
npm run preview
```

### 2. Các file quan trọng đã được cấu hình

| File             | Mục đích                                           |
| ---------------- | -------------------------------------------------- |
| `vercel.json`    | Cấu hình routing cho SPA (Single Page Application) |
| `.env.example`   | Mẫu environment variables                          |
| `vite.config.ts` | Cấu hình Vite build                                |

### 3. Đẩy code lên Git

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

---

## 🖥️ Cách 1: Deploy Qua Vercel Dashboard (Khuyến nghị)

### Bước 1: Đăng nhập Vercel

1. Truy cập [vercel.com](https://vercel.com)
2. Đăng nhập bằng GitHub/GitLab/Bitbucket

### Bước 2: Import Project

1. Click **"Add New..."** → **"Project"**
2. Chọn repository **frontend** từ danh sách
3. Click **"Import"**

### Bước 3: Cấu hình Project

Vercel sẽ tự động nhận diện dự án Vite. Kiểm tra các thông số:

| Cài đặt              | Giá trị                                     |
| -------------------- | ------------------------------------------- |
| **Framework Preset** | Vite                                        |
| **Build Command**    | `npm run build` hoặc `tsc -b && vite build` |
| **Output Directory** | `dist`                                      |
| **Install Command**  | `npm install`                               |

### Bước 4: Thêm Environment Variables

Trước khi deploy, thêm các biến môi trường:

1. Expand phần **"Environment Variables"**
2. Thêm các biến sau:

| Name           | Value                              | Environment |
| -------------- | ---------------------------------- | ----------- |
| `VITE_API_URL` | `https://your-backend-api.com/api` | Production  |

> ⚠️ **Quan trọng:** Thay `https://your-backend-api.com/api` bằng URL thực của backend API

### Bước 5: Deploy

Click **"Deploy"** và chờ quá trình hoàn tất (thường 1-3 phút)

---

## 💻 Cách 2: Deploy Qua Vercel CLI

### Bước 1: Cài đặt Vercel CLI

```bash
npm install -g vercel
```

### Bước 2: Đăng nhập

```bash
vercel login
```

Chọn phương thức đăng nhập (GitHub, GitLab, Email...)

### Bước 3: Deploy

```bash
# Di chuyển đến thư mục dự án
cd d:\microservice_project\frontend

# Deploy (lần đầu sẽ có setup wizard)
vercel
```

### Bước 4: Trả lời các câu hỏi setup

```
? Set up and deploy "frontend"? [Y/n] Y
? Which scope do you want to deploy to? [Your Account]
? Link to existing project? [y/N] N
? What's your project's name? classmate-frontend
? In which directory is your code located? ./
? Want to modify these settings? [y/N] N
```

### Bước 5: Thêm Environment Variables

```bash
# Thêm biến môi trường production
vercel env add VITE_API_URL
# Nhập giá trị: https://your-backend-api.com/api
# Chọn: Production, Preview, Development

# Deploy lại với biến môi trường mới
vercel --prod
```

---

## 🔐 Cấu Hình Environment Variables

### Các biến môi trường cần thiết:

| Biến           | Mô tả                                           | Ví dụ                         |
| -------------- | ----------------------------------------------- | ----------------------------- |
| `VITE_API_URL` | URL của Backend API (production)                | `https://api.example.com/api` |
| `VITE_DEV_URL` | URL API cho development (không cần trên Vercel) | `http://localhost:8080/api`   |

### Cách thêm qua Vercel Dashboard:

1. Vào **Project Settings** → **Environment Variables**
2. Thêm biến với các giá trị tương ứng
3. Chọn môi trường áp dụng (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** để áp dụng thay đổi

### Lưu ý quan trọng:

> ⚠️ Với Vite, các biến môi trường phải bắt đầu bằng `VITE_` để được expose ra client-side code.

---

## ❌ Xử Lý Lỗi Thường Gặp

### Lỗi 1: 404 khi refresh trang

**Nguyên nhân:** React Router sử dụng client-side routing

**Giải pháp:** File `vercel.json` đã được cấu hình với rewrites:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

### Lỗi 2: Build failed - TypeScript errors

**Giải pháp:**

```bash
# Kiểm tra lỗi TypeScript local
npm run build

# Sửa các lỗi trước khi push
```

### Lỗi 3: API calls không hoạt động

**Nguyên nhân:**

- Thiếu environment variable
- CORS chưa được cấu hình ở backend

**Giải pháp:**

1. Kiểm tra `VITE_API_URL` đã được set đúng
2. Cấu hình CORS ở backend cho phép domain Vercel

### Lỗi 4: Module not found

**Giải pháp:**

```bash
# Xóa node_modules và cài lại
rm -rf node_modules
npm install
```

### Lỗi 5: Environment variables không hoạt động

**Giải pháp:**

1. Đảm bảo biến bắt đầu với `VITE_`
2. **Redeploy** sau khi thêm/sửa biến môi trường

---

## ✅ Kiểm Tra Sau Khi Deploy

### Checklist:

- [ ] Trang chủ load thành công
- [ ] Routing hoạt động (chuyển trang, refresh không bị 404)
- [ ] Đăng nhập/Đăng ký hoạt động
- [ ] API calls trả về dữ liệu đúng
- [ ] Responsive trên mobile

### Kiểm tra logs:

1. Vào **Project** → **Deployments**
2. Click vào deployment cụ thể
3. Xem **Function Logs** hoặc **Build Logs**

---

## 🔗 Cấu Hình Domain Tùy Chỉnh (Tùy chọn)

### Thêm custom domain:

1. Vào **Project Settings** → **Domains**
2. Nhập domain của bạn (vd: `classmate.yourdomain.com`)
3. Cấu hình DNS theo hướng dẫn của Vercel

### DNS Settings:

| Type  | Name | Value                |
| ----- | ---- | -------------------- |
| CNAME | www  | cname.vercel-dns.com |
| A     | @    | 76.76.21.21          |

---

## 📞 Hỗ Trợ

- **Vercel Documentation:** [vercel.com/docs](https://vercel.com/docs)
- **Vite Deployment Guide:** [vite.dev/guide/static-deploy](https://vite.dev/guide/static-deploy)

---

## 📝 Tóm Tắt Lệnh

```bash
# Build local
npm run build

# Deploy với Vercel CLI
vercel

# Deploy production
vercel --prod

# Xem logs
vercel logs

# Liệt kê deployments
vercel ls
```

---

**Chúc bạn deploy thành công! 🎉**
