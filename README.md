# CU PI STORE

Website mua bán, thu mua xe máy cũ và dịch vụ đèn LED xe máy tại Biên Hòa.

## Tính năng

- Danh sách xe theo hãng, loại xe, phân khối và khoảng giá.
- Trang chi tiết xe với nhiều ảnh, mô tả và thông tin kỹ thuật.
- Danh mục dịch vụ đèn LED xe máy.
- Dashboard quản trị đăng nhập riêng để thêm, sửa và xóa nội dung.
- Giá công khai dạng `31trXXX` hoặc `Liên hệ`.
- Ảnh tải lên được tối ưu WebP, lưu riêng trên VPS và tự dọn khi thay hoặc xóa sản phẩm.
- Dữ liệu xe và dịch vụ được lưu bền vững trong MongoDB.

## Công nghệ

- TanStack Start, React, TypeScript và Tailwind CSS.
- Nitro Node Server.
- MongoDB.
- PM2 và Nginx trên Ubuntu.

## Chạy giao diện local

Yêu cầu Node.js 22.12+ và Bun.

```bash
bun install
bun run dev
```

## Chạy đầy đủ CMS local

Tạo `.env` từ `.env.example`, cấu hình MongoDB và tài khoản admin, sau đó:

```bash
bun run build
bun run start
```

## Triển khai Ubuntu

Xem [DEPLOY.md](./DEPLOY.md). Source đã có sẵn cấu hình PM2, Nginx mẫu, kiểm tra môi trường và script `deploy.sh`.

Không commit `.env`, mật khẩu, database dump hoặc thư mục `uploads` lên Git.
