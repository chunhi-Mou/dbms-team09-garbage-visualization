# WebGIS Trực Quan Hóa Điểm Rác (Nhóm 09)

## 1. Giới thiệu dự án

Đây là dự án WebGIS dùng để trực quan hóa dữ liệu không gian trong khu vực KCN Quang Hưng, bao gồm các lớp:

- Ranh giới (`bounds`)
- Tòa nhà (`building`)
- Đường (`road`)
- Đường hướng dẫn (`instruction-generated`)
- Điểm rác (`garbadge`)

Ứng dụng hiển thị bản đồ, cho phép bật/tắt lớp dữ liệu, xem thuộc tính đối tượng và xem metadata của CSDL.

Thành viên nhóm 9:
1. Phùng Thu Hương - B23DCVT201
2. Chu Tuyết Nhi - B23DCCE075
3. Lê Như Quỳnh - B23DCCE081

## 2. Công nghệ sử dụng

### Backend

- Node.js (CommonJS)
- Express `4.21.2`
- `pg` `8.13.1` để kết nối PostgreSQL
- `dotenv` `16.4.5` để nạp biến môi trường

### Cơ sở dữ liệu

- PostgreSQL
- PostGIS (dùng các hàm không gian như `ST_AsGeoJSON`, `ST_Transform`, `ST_SetSRID`, `ST_Translate`)

### Frontend

- HTML/CSS/JavaScript thuần
- Leaflet `1.9.4` (CDN) để hiển thị bản đồ
- OpenStreetMap tile layer

## 3. Kiến trúc của project

Dự án theo kiến trúc tách lớp kiểu Router -> Controller -> Model -> Database.

### Luồng xử lý chính

1. Trình duyệt gọi API (ví dụ: `/api/road`).
2. `routes/api.js` định tuyến tới controller tương ứng.
3. Controller gọi model để lấy dữ liệu.
4. Model truy vấn PostgreSQL/PostGIS, chuyển dữ liệu hình học sang GeoJSON.
5. Frontend nhận GeoJSON và render lên Leaflet map.

### Cấu trúc thư mục

```text
.
|-- config/
|   |-- db.js                # Cấu hình kết nối PostgreSQL
|-- routes/
|   |-- api.js               # Định nghĩa các API /api/*
|-- controllers/             # Xử lý request/response cho từng layer
|-- models/                  # Truy vấn DB và trả dữ liệu GeoJSON/metadata
|-- public/
|   |-- index.html           # Giao diện chính
|   |-- css/style.css        # Giao diện
|   `-- js/                  # API client, map, layer, UI
|-- server.js                # Điểm khởi chạy server Express
`-- .env                     # Biến môi trường local
```

### API chính

- `GET /health`: Kiểm tra server sống.
- `GET /api/bounds`
- `GET /api/building`
- `GET /api/road`
- `GET /api/instruction-generated`
- `GET /api/garbadge`
- `GET /api/meta`: Metadata bảng/lớp trong CSDL.

## 4. Cách khởi động project

### Bước 1: Mở terminal tại thư mục gốc dự án

Chạy lệnh trong terminal (PowerShell/CMD):

```bash
cd d:\Projects\dbms-team09-garbage-visualization
```

### Bước 2: Cài thư viện

Chạy ngay tại thư mục gốc dự án:

```bash
npm install
```

### Bước 3: Điền cấu hình vào file `.env`

Điền trong file `d:\Projects\dbms-team09-garbage-visualization\.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=spatial_garbage
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD
```

Giải thích chỗ cần điền:

- `DB_HOST`, `DB_PORT`: địa chỉ PostgreSQL.
- `DB_NAME`: tên database chứa dữ liệu không gian.
- `DB_USER`, `DB_PASSWORD`: tài khoản đăng nhập PostgreSQL.
- `PORT`: cổng chạy web server.

### Bước 4: Khởi tạo server

Chạy tại thư mục gốc dự án:

```bash
npm.cmd run start
```

Sau khi chạy thành công:

- Trang web: `http://localhost:3000`
- Health check: `http://localhost:3000/health`

## 5. Tổng kết lại những gì đã làm

- Xây dựng backend Express để phục vụ dữ liệu GeoJSON từ PostgreSQL/PostGIS.
- Tổ chức mã nguồn theo từng lớp `route/controller/model`, dễ mở rộng API.
- Tạo giao diện bản đồ Leaflet để hiển thị nhiều lớp dữ liệu không gian.
- Hỗ trợ bật/tắt layer, xem thông tin thuộc tính đối tượng, và xem metadata CSDL.
- Hoàn thiện quy trình chạy local bằng `.env` + lệnh `npm`.
