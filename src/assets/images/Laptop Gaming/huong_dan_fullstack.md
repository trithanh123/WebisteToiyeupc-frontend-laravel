# 📚 Hướng Dẫn Toàn Diện: Laravel + React.js + PostgreSQL
### Dựa trên Project thực tế: **ToiYeuPC** của bạn

---

## 🗺️ Kiến Trúc Tổng Quan (Big Picture)

```
┌─────────────────────────────────────────────────────────────────┐
│                     NGƯỜI DÙNG (Browser)                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP Request
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              FRONTEND: React.js (localhost:5173)                 │
│  • Vite + JSX                                                   │
│  • React Router DOM (điều hướng trang)                          │
│  • Context API (quản lý state toàn cục)                         │
│  • Fetch/Axios (gọi API)                                        │
└───────────────────────────┬─────────────────────────────────────┘
                            │ axios.get('http://localhost:8000/api/...')
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              BACKEND: Laravel PHP (localhost:8000)               │
│  ┌─────────┐   ┌────────────┐   ┌──────────┐   ┌───────────┐  │
│  │ routes/ │ → │ Controller │ → │  Model   │ → │ Database  │  │
│  │ api.php │   │ (Logic)    │   │(Eloquent)│   │(PostgreSQL│  │
│  └─────────┘   └────────────┘   └──────────┘   └───────────┘  │
│  • Sanctum (xác thực token)                                     │
│  • Middleware (bảo vệ route)                                    │
│  • Validation (kiểm tra dữ liệu)                                │
└─────────────────────────────────────────────────────────────────┘
                            │ SQL Query
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              DATABASE: PostgreSQL                                │
│  • Migrations (tạo/sửa bảng)                                   │
│  • Foreign Keys (ràng buộc khóa ngoại)                          │
│  • JSONB (lưu specifications linh hoạt)                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔴 PHẦN 1: PostgreSQL — Tầng Database

### 1.1 Migration là gì?

Migration = **"kịch bản tạo bảng"** bằng PHP thay vì viết SQL thô.

**Ví dụ thực tế từ project của bạn** — [2026_05_21_052839_create_san_pham_table.php](file:///d:/LuanVan/backend-toiyeupc/database/migrations/2026_05_21_052839_create_san_pham_table.php):

```php
Schema::create('san_pham', function (Blueprint $table) {
    $table->id('ID_SanPham');              // BIGINT PRIMARY KEY AUTO_INCREMENT
    $table->unsignedBigInteger('Ma_DanhMuc'); // Khóa ngoại → bảng danh_muc
    $table->string('MaSP', 100)->unique(); // VARCHAR(100) UNIQUE
    $table->string('TenSP', 255);          // VARCHAR(255)
    $table->bigInteger('Gia');             // BIGINT
    $table->string('Thumbail', 255)->nullable(); // Có thể NULL
    $table->text('Motasanpham')->nullable();
    $table->jsonb('specifications')->nullable(); // Kiểu JSONB của PostgreSQL!
    $table->timestamps(); // created_at, updated_at tự động
    
    // Ràng buộc khóa ngoại
    $table->foreign('Ma_DanhMuc')
          ->references('ID_DanhMuc')
          ->on('danh_muc')
          ->onDelete('cascade'); // Xóa danh mục → xóa luôn sản phẩm
});
```

> **Câu hỏi bảo vệ:** Tại sao dùng `jsonb` cho `specifications`?
> **Trả lời:** Vì mỗi loại sản phẩm có thông số khác nhau (laptop có RAM, CPU; điện thoại có pin, camera). Dùng JSONB lưu linh hoạt, không cần tạo 20 cột riêng.

### 1.2 Lệnh Migration quan trọng

```bash
# Chạy toàn bộ migration (tạo bảng)
php artisan migrate

# Rollback (xóa bảng, chạy lại)
php artisan migrate:fresh

# Xem trạng thái migration
php artisan migrate:status
```

### 1.3 Quan hệ giữa các bảng trong Project của bạn

```
nguoi_dung ──┐
             ├──< don_hang >──< chi_tiet_don_hang >── san_pham
             ├──< danh_gia >──────────────────────┘      │
             └──< diachi_nguoidung                        │
                                                          │
danh_muc ───────────────────────────────────────────< san_pham
                                                          │
chi_nhanh ─────────────────────────< ton_kho_cuc_bo >─────┘
                                          │
san_pham ────< sanpham_serials (serial number từng máy)
```

---

## 🟠 PHẦN 2: Laravel — Tầng Backend

### 2.1 Cấu trúc thư mục Laravel

```
backend-toiyeupc/
├── app/
│   ├── Http/
│   │   └── Controllers/Api/    ← Nơi xử lý logic (ProductController, AuthController...)
│   └── Models/                 ← Đại diện cho bảng DB (san_pham.php, danh_muc.php...)
├── routes/
│   └── api.php                 ← Khai báo tất cả endpoint API
├── database/
│   ├── migrations/             ← Kịch bản tạo bảng
│   └── seeders/                ← Dữ liệu mẫu
└── .env                        ← Config: DB, mail, key...
```

### 2.2 Model (Eloquent ORM)

Model = **lớp PHP đại diện cho 1 bảng trong database**.

**Ví dụ thực tế** — [san_pham.php](file:///d:/LuanVan/backend-toiyeupc/app/Models/san_pham.php):

```php
class san_pham extends Model
{
    // 1. Tên bảng (nếu khác convention)
    protected $table = 'san_pham';
    protected $primaryKey = 'ID_SanPham';

    // 2. Các trường được phép ghi (Mass Assignment Protection)
    protected $fillable = ['Ma_DanhMuc', 'MaSP', 'TenSP', 'Gia', 'Thumbail', 'Motasanpham', 'specifications'];

    // 3. Ép kiểu tự động (Casts)
    protected $casts = [
        'specifications' => 'array', // JSONB → PHP Array tự động!
        'Gia' => 'integer',
    ];

    // 4. Mối quan hệ (Relationships)
    public function danhMuc()
    {
        return $this->belongsTo(danh_muc::class, 'Ma_DanhMuc', 'ID_DanhMuc');
        //                        Model cha          FK trong bảng này   PK bảng cha
    }

    public function tonKho()
    {
        return $this->hasMany(ton_kho_cuc_bo::class, 'MaSanPham', 'ID_SanPham');
    }
}
```

> **Câu hỏi bảo vệ:** `fillable` để làm gì?
> **Trả lời:** Bảo vệ chống tấn công **Mass Assignment**. Nếu không có fillable, hacker có thể gửi thêm field `Phanquyen=1` để tự phong admin. Chỉ những field trong `fillable` mới được `create()` hoặc `fill()` tự động.

### 2.3 Các kiểu quan hệ Eloquent trong project

| Quan hệ | Ví dụ trong project | Code |
|---------|---------------------|------|
| `belongsTo` | Sản phẩm thuộc 1 danh mục | `san_pham → danh_muc` |
| `hasMany` | 1 danh mục có nhiều sản phẩm | `danh_muc → san_pham[]` |
| `hasMany` | 1 sản phẩm ở nhiều kho | `san_pham → ton_kho_cuc_bo[]` |

### 2.4 Controller — Nơi xử lý Logic

Controller nhận Request từ Route → xử lý → trả về Response JSON.

**Ví dụ thực tế** — [ProductController.php](file:///d:/LuanVan/backend-toiyeupc/app/Http/Controllers/Api/ProductController.php):

```php
// GET /api/products
public function index(Request $request)
{
    // 1. Đọc query param từ URL: /api/products?branch_id=2
    $branchId = $request->query('branch_id');

    // 2. Eager Loading: lấy danhMuc cùng lúc, tránh N+1 Query
    $query = san_pham::with(['danhMuc:ID_DanhMuc,Ten_DanhMuc,slug']);

    // 3. Filter có điều kiện
    if ($branchId) {
        $query->whereHas('tonKho', function($q) use ($branchId) {
            $q->where('MaChiNhanh', $branchId)->where('Soluongtonkho', '>', 0);
        });
    }

    // 4. Lấy dữ liệu
    $products = $query->orderBy('ID_SanPham', 'desc')->get();

    // 5. Trả về JSON
    return response()->json([
        'status' => 'success',
        'total'  => $products->count(),
        'data'   => $products,
    ], 200); // HTTP 200 OK
}
```

> **Câu hỏi bảo vệ:** Eager Loading là gì? Tại sao dùng `with()`?
> **Trả lời:** Tránh **N+1 Query Problem**. Nếu không dùng `with()`, khi lấy 100 sản phẩm, Laravel sẽ chạy thêm 100 query riêng để lấy danh mục từng sản phẩm (= 101 query). Với `with('danhMuc')`, chỉ chạy 2 query tổng cộng.

### 2.5 Route — Khai báo Endpoint API

**Ví dụ thực tế** — [api.php](file:///d:/LuanVan/backend-toiyeupc/routes/api.php):

```php
// PUBLIC ROUTE: Ai cũng truy cập được
Route::get('/products', [ProductController::class, 'index']);
// → GET http://localhost:8000/api/products

// PROTECTED ROUTE: Phải có token mới vào được
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::get('/products', [ProductController::class, 'index']);
    // → GET http://localhost:8000/api/admin/products (cần Bearer Token)
    
    Route::post('/products', [ProductController::class, 'store']);
    // → POST http://localhost:8000/api/admin/products
    
    Route::put('/products/{id}', [ProductController::class, 'update']);
    // → PUT http://localhost:8000/api/admin/products/5
    
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    // → DELETE http://localhost:8000/api/admin/products/5
});
```

### 2.6 Authentication với Laravel Sanctum

**Flow đăng nhập** — [AuthController.php](file:///d:/LuanVan/backend-toiyeupc/app/Http/Controllers/Api/AuthController.php):

```
Client gửi: POST /api/login { email, password }
     ↓
AuthController::login() kiểm tra:
  1. Tìm user theo email hoặc SDT
  2. Hash::check(password nhập, password đã hash trong DB)
  3. Nếu đúng → tạo Sanctum Token
  4. Trả về { token: "abc123..." }
     ↓
Client lưu token vào localStorage
     ↓
Mọi request tiếp theo: Header Authorization: Bearer abc123...
     ↓
Middleware 'auth:sanctum' tự xác thực token
```

```php
// Tạo token
$token = $user->createToken('ToiYeuPCToken')->plainTextToken;

// Frontend nhận token, lưu vào localStorage
// Sau đó gửi kèm mọi request:
// Authorization: Bearer {token}
```

### 2.7 Validation — Kiểm tra dữ liệu đầu vào

```php
$validator = Validator::make($request->all(), [
    'Ma_DanhMuc' => 'required|integer|exists:danh_muc,ID_DanhMuc',
    //               bắt buộc  kiểu số  phải tồn tại trong bảng danh_muc
    'MaSP'       => 'required|string|max:255|unique:san_pham,MaSP',
    //               bắt buộc  chuỗi  tối đa 255  duy nhất trong bảng san_pham
    'Gia'        => 'required|integer|min:0',
]);

if ($validator->fails()) {
    return response()->json([
        'status' => 'error',
        'errors' => $validator->errors(), // Trả lỗi chi tiết về frontend
    ], 422); // HTTP 422 Unprocessable Entity
}
```

### 2.8 HTTP Status Code — Phải thuộc lòng

| Code | Ý nghĩa | Khi nào dùng trong project |
|------|---------|---------------------------|
| `200` | OK | Lấy/cập nhật thành công |
| `201` | Created | Tạo mới thành công (POST) |
| `400` | Bad Request | Dữ liệu sai format |
| `401` | Unauthorized | Chưa đăng nhập / Token hết hạn |
| `403` | Forbidden | Đã đăng nhập nhưng không có quyền |
| `404` | Not Found | Không tìm thấy resource |
| `422` | Unprocessable | Validation fail |
| `500` | Server Error | Lỗi code backend |

---

## 🟡 PHẦN 3: React.js — Tầng Frontend

### 3.1 Cấu trúc thư mục Frontend

```
frontend-Toiyeupc/src/
├── pages/
│   ├── clients/          ← Trang cho khách hàng (homePage, productPage...)
│   ├── admin/            ← Trang quản trị
│   └── staff/            ← Trang nhân viên
├── components/           ← Component tái sử dụng (Modal, Button...)
├── context/              ← State toàn cục (CartContext)
├── hooks/                ← Custom hooks
├── utils/                ← Helper functions, constants (route names)
├── router.jsx            ← Khai báo routing
└── App.jsx               ← Root component
```

### 3.2 React Router DOM — Điều hướng trang

**Thực tế project** — [router.jsx](file:///d:/LuanVan/frontend-Toiyeupc/src/router.jsx):

```jsx
// router.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

const RouterCustom = () => (
    <BrowserRouter>
        <Routes>
            {/* Khi URL = "/" → render HomePage */}
            <Route path="/" element={<HomePage />} />
            
            {/* Khi URL = "/san-pham/5" → render ProductDetailPage */}
            <Route path="/san-pham/:id" element={<ProductDetailPage />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            
            {/* Bắt tất cả URL không khớp → về Home */}
            <Route path="*" element={<HomePage />} />
        </Routes>
    </BrowserRouter>
);
```

> **Câu hỏi bảo vệ:** React Router hoạt động thế nào?
> **Trả lời:** Đây là **Client-Side Routing**. Thay vì server trả về trang mới mỗi lần click link, React Router chặn navigation, đổi component hiển thị mà KHÔNG reload trang. URL thay đổi bằng History API của trình duyệt.

### 3.3 Gọi API từ React đến Laravel

**Pattern chuẩn trong project:**

```jsx
import { useState, useEffect } from 'react';

function ProductPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Gọi API khi component mount
        const fetchProducts = async () => {
            try {
                const token = localStorage.getItem('token'); // Lấy token đã lưu
                
                const response = await fetch('http://localhost:8000/api/products', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });
                
                const data = await response.json();
                
                if (data.status === 'success') {
                    setProducts(data.data);
                }
            } catch (err) {
                setError('Không thể tải sản phẩm');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []); // [] = chỉ chạy 1 lần khi component mount

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div>{error}</div>;
    
    return (
        <ul>
            {products.map(product => (
                <li key={product.ID_SanPham}>{product.TenSP}</li>
            ))}
        </ul>
    );
}
```

### 3.4 Context API — State toàn cục

**Tại sao cần Context?** Vì `CartContext` trong project của bạn cần chia sẻ giỏ hàng giữa NHIỀU component không liên quan.

```jsx
// context/CartContext.jsx
import { createContext, useState, useContext } from 'react';

export const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);

    const openModal = (product) => {
        setCurrentProduct(product);
        setIsModalOpen(true);
    };
    
    const closeModal = () => setIsModalOpen(false);

    return (
        // Bọc toàn bộ app → mọi component con đều truy cập được
        <CartContext.Provider value={{ cart, isModalOpen, currentProduct, openModal, closeModal }}>
            {children}
        </CartContext.Provider>
    );
}

// Dùng trong bất kỳ component nào:
// const { cart, openModal } = useContext(CartContext);
```

**Thực tế trong router.jsx của bạn:**
```jsx
// router.jsx - GlobalModalWrapper dùng CartContext
const GlobalModalWrapper = () => {
    const { isModalOpen, currentProduct, closeModal } = useContext(CartContext);
    return (
        <AddToCartModal 
            isOpen={isModalOpen} 
            onClose={closeModal} 
            product={currentProduct}
        />
    );
};
```

### 3.5 useState và useEffect — 2 Hook quan trọng nhất

```jsx
// useState: Quản lý state cục bộ trong component
const [count, setCount] = useState(0);
// count = giá trị hiện tại
// setCount = hàm để cập nhật (gọi setCount → React re-render)

// useEffect: Chạy side effects (gọi API, subscribe, timer...)
useEffect(() => {
    // Code chạy SAU khi render
    fetchData();
    
    return () => {
        // Cleanup (chạy khi component unmount)
    };
}, [dependency]); 
// [] → chỉ chạy 1 lần (khi mount)
// [id] → chạy lại mỗi khi id thay đổi
// không truyền → chạy sau mỗi lần render
```

---

## 🟢 PHẦN 4: Luồng Dữ Liệu End-to-End (Ví dụ thực tế)

### Ví dụ: Người dùng xem trang sản phẩm

```
1. USER truy cập: http://localhost:5173/san-pham
   ↓
2. React Router → render <ProductPage /> component
   ↓
3. useEffect chạy → gọi fetch('http://localhost:8000/api/products')
   ↓
4. Laravel nhận request tại route: GET /api/products
   → Khớp với: Route::get('/products', [ProductController::class, 'index'])
   ↓
5. ProductController::index() chạy:
   → san_pham::with(['danhMuc'])->get()
   ↓
6. Eloquent ORM chuyển thành SQL:
   SELECT * FROM san_pham
   LEFT JOIN danh_muc ON san_pham.Ma_DanhMuc = danh_muc.ID_DanhMuc
   ↓
7. PostgreSQL thực thi, trả về rows
   ↓
8. Eloquent map dữ liệu → PHP objects → JSON
   ↓
9. Laravel trả về: { "status": "success", "data": [...] }
   ↓
10. React nhận JSON → setProducts(data.data) → re-render
    ↓
11. Component hiển thị danh sách sản phẩm
```

### Ví dụ: Admin thêm sản phẩm mới

```
1. Admin điền form → click "Lưu"
   ↓
2. React gọi: POST /api/admin/products
   Headers: { Authorization: "Bearer abc123..." }
   Body: { MaSP: "SP001", TenSP: "Laptop Dell", Gia: 15000000 }
   ↓
3. Laravel nhận → middleware 'auth:sanctum' kiểm tra token
   → Token hợp lệ? → cho đi tiếp | Token sai? → 401 Unauthorized
   ↓
4. Route khớp: Route::post('/products', [ProductController::class, 'store'])
   ↓
5. ProductController::store():
   → checkAdmin() → Phanquyen == 1? → OK | Không? → 403 Forbidden
   → Validator::make() → Dữ liệu hợp lệ?
   → san_pham::create([...]) → INSERT INTO san_pham ...
   ↓
6. PostgreSQL lưu record mới
   ↓
7. Trả về: { "status": "success", "data": { ID_SanPham: 50, ... } } HTTP 201
   ↓
8. React nhận → cập nhật danh sách sản phẩm (thêm product mới vào state)
```

---

## 🔵 PHẦN 5: CORS — Tại Sao Frontend Gọi Được Backend?

**Vấn đề:** Frontend chạy ở `localhost:5173`, Backend ở `localhost:8000` → **khác origin** → trình duyệt chặn!

**Giải pháp:** Cấu hình CORS trong Laravel:

```php
// config/cors.php (hoặc bootstrap/app.php)
'allowed_origins' => ['http://localhost:5173'],
'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
'allowed_headers' => ['Content-Type', 'Authorization'],
```

> **Câu hỏi bảo vệ:** CORS là gì?
> **Trả lời:** Cross-Origin Resource Sharing. Cơ chế bảo mật trình duyệt ngăn website A gọi API của website B mà không được phép. Laravel cần cấu hình để cho phép frontend (localhost:5173) gọi backend (localhost:8000).

---

## 🟣 PHẦN 6: Các Lệnh Hay Dùng

### Laravel (Backend)

```bash
# Khởi động server
php artisan serve                    # → localhost:8000

# Tạo migration mới
php artisan make:migration create_xxx_table

# Tạo Model mới
php artisan make:model TenModel

# Tạo Controller mới
php artisan make:controller Api/TenController

# Chạy migration
php artisan migrate
php artisan migrate:fresh --seed    # Xóa sạch + chạy lại + thêm dữ liệu mẫu

# Xem tất cả routes
php artisan route:list

# Kiểm tra config
php artisan config:clear
php artisan cache:clear
```

### React (Frontend)

```bash
# Khởi động dev server
npm run dev                          # → localhost:5173

# Cài package mới
npm install axios
npm install react-router-dom

# Build production
npm run build
```

---

## 🎯 PHẦN 7: Câu Hỏi Bảo Vệ Luận Văn Thường Gặp

### ❓ 1. Tại sao chọn Laravel thay vì Node.js/Express?

> Laravel có sẵn Eloquent ORM, Sanctum auth, Validation, Migration — giúp phát triển nhanh hơn. Cú pháp PHP rõ ràng, tài liệu chính thức đầy đủ. Phù hợp với đề tài thương mại điện tử cần nhiều tính năng sẵn có.

### ❓ 2. Tại sao chọn PostgreSQL thay vì MySQL?

> PostgreSQL hỗ trợ kiểu dữ liệu **JSONB** (dùng cho `specifications` của sản phẩm), hỗ trợ **pgvector** (dự kiến AI vector search). PostgreSQL cũng mạnh hơn về transactions, kiểu dữ liệu phong phú và hiệu năng với dữ liệu phức tạp.

### ❓ 3. Giải thích flow Authentication trong project?

> 1. Client POST `/api/login` với email+password  
> 2. Laravel dùng `Hash::check()` so sánh password với hash trong DB  
> 3. Nếu đúng, tạo **Sanctum Personal Access Token** lưu vào bảng `personal_access_tokens`  
> 4. Trả token về client, client lưu vào `localStorage`  
> 5. Mọi request sau gửi kèm `Authorization: Bearer {token}` trong header  
> 6. Middleware `auth:sanctum` tự động xác thực token

### ❓ 4. N+1 Query Problem là gì? Project giải quyết thế nào?

> N+1 Problem: Nếu lấy 100 sản phẩm, mỗi sản phẩm lại chạy 1 query để lấy danh mục → tổng 101 query.  
> Giải pháp: Dùng **Eager Loading** với `san_pham::with(['danhMuc'])` → chỉ 2 query:  
> - Query 1: `SELECT * FROM san_pham`  
> - Query 2: `SELECT * FROM danh_muc WHERE ID_DanhMuc IN (1, 2, 3...)`

### ❓ 5. Component và Props trong React là gì?

> Component = hàm JavaScript trả về JSX (HTML-like).  
> Props = tham số truyền vào component (như parameter của hàm).  
> Ví dụ: `<AddToCartModal isOpen={true} product={product} onClose={closeModal} />`  
> → `isOpen`, `product`, `onClose` là props truyền từ component cha xuống con.

### ❓ 6. Tại sao dùng Context API thay vì truyền props?

> **Prop drilling problem:** Nếu CartContext cần dùng ở 5 level sâu, phải truyền props qua 5 lớp component trung gian không cần dùng.  
> **Context API** tạo "kênh" toàn cục, component ở bất kỳ đâu cũng `useContext()` để lấy data trực tiếp.

### ❓ 7. Phân biệt GET, POST, PUT, DELETE?

| Method | Dùng khi | Trong project |
|--------|---------|--------------|
| GET | Lấy dữ liệu (không thay đổi) | Lấy danh sách sản phẩm, xem chi tiết |
| POST | Tạo mới resource | Đăng ký, đăng nhập, thêm sản phẩm |
| PUT | Cập nhật toàn bộ resource | Sửa thông tin sản phẩm |
| DELETE | Xóa resource | Xóa sản phẩm, xóa user |

### ❓ 8. JSONB trong PostgreSQL khác JSON thế nào?

> - **JSON**: Lưu dạng text thuần, mỗi lần đọc phải parse lại  
> - **JSONB**: Lưu dạng nhị phân đã parse sẵn, hỗ trợ **đánh index**, tìm kiếm nhanh hơn  
> Project dùng JSONB cho `specifications` để có thể query như: `WHERE specifications->>'ram' = '16GB'`

---

## 📋 Tóm Tắt Nhanh (Học Thuộc Lòng)

```
Laravel = Framework PHP → Xử lý API, Auth, Validation, DB
React   = Library JS   → Xây dựng UI, Quản lý state
PostgreSQL = Database  → Lưu trữ dữ liệu, JSONB, Relations

Luồng cơ bản:
React → HTTP Request → Laravel Route → Controller → Eloquent Model → PostgreSQL
PostgreSQL → Data → Eloquent → JSON Response → React State → UI
```
