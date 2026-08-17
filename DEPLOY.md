# Triển khai CU PI STORE trên Ubuntu

## 1. Chuẩn bị

- Node.js 22 LTS, Bun, Nginx, PM2 và MongoDB đang chạy.
- MongoDB chỉ bind vào localhost, không mở cổng 27017 ra Internet.
- Clone dự án vào `/home/deploy/apps/cupi-store`.

## 2. Biến môi trường

```bash
cd /home/deploy/apps/cupi-store
cp .env.example .env
npm run admin:hash
nano .env
chmod 600 .env
mkdir -p uploads
```

Dán bcrypt hash vừa tạo vào `ADMIN_PASSWORD_HASH`. Tạo `SESSION_SECRET` ngẫu nhiên tối thiểu 32 ký tự. Không commit `.env`.

## 3. Nginx và HTTPS

Sao chép `deploy/nginx.conf.example` vào `/etc/nginx/sites-available/cupi-store`, thay domain thật, bật site rồi kiểm tra Nginx. Sau khi DNS trỏ đúng, dùng Certbot để cấp HTTPS.

## 4. Deploy

```bash
cd /home/deploy/apps/cupi-store
chmod +x deploy.sh
./deploy.sh
```

Dashboard nằm ở `/dashboard`. Dữ liệu xe và dịch vụ lưu trong database `cupi_store`; ảnh WebP lưu ở thư mục `uploads` bên ngoài thư mục build.

Để chạy thử đầy đủ CMS tại local, tạo `.env`, chạy `bun run build` rồi `bun run start`. Chế độ `bun run dev` chỉ dùng chỉnh giao diện và không nạp các API production.

## 5. Backup bắt buộc

Backup đồng thời MongoDB và thư mục ảnh:

```bash
mongodump --uri="$MONGODB_URI" --archive=/path/to/backup/cupi-store.archive --gzip
tar -czf /path/to/backup/cupi-store-uploads.tar.gz -C /home/deploy/apps/cupi-store uploads
```

Phải thử phục hồi bản backup trên môi trường thử nghiệm trước khi mở website chính thức.
