# PROMPT GỘP BACKEND - DỰ ÁN VIETSHOP E-COMMERCE

## TỔNG QUAN HỆ THỐNG

### Frontend Base URL
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```
Tất cả API endpoints đều prefixed với `/api/`

### Các Role người dùng
- `admin` → điều hướng về `/admin`
- `staff` → điều hướng về `/staff`
- `user` (khách hàng) → điều hướng về `/account`

---

## PHẦN 1: AUTHENTICATION (Đã có - cần verify)

### 1.1. Đăng nhập ✅
```typescript
// FE gọi: POST /api/auth/login
// Body: { email: string, password: string }
// Response:
{
  "token": "jwt_token_string",
  "user": {
    "user_id": "uuid",
    "email": "user@example.com",
    "full_name": "Nguyễn Văn A",
    "phone": "0901234567",
    "role": "user | admin | staff",
    "avatar_url": "https://..."
  }
}
```

### 1.2. Đăng ký ❌ (CHƯA CÓ)
```typescript
// FE gọi: POST /api/auth/register
// Body:
{
  "email": string,          // required, unique
  "password": string,        // required, min 8 chars
  "full_name": string,       // required
  "phone": string,           // optional
  "avatar_url": string       // optional
}
// Response: giống LoginResponse (token + user)
```

### 1.3. Social Login (Google/Facebook) ❌ (CHƯA CÓ)
```typescript
// Google: GET /api/auth/google
// Facebook: GET /api/auth/facebook
// Backend redirect về FE với token
// FE expect: { token, user } giống login

// Hoặc FE gọi OAuth token exchange:
// POST /api/auth/social/callback
// Body: { provider: "google" | "facebook", token: string }
```

---

## PHẦN 2: PRODUCTS (Sản phẩm)

### 2.1. Lấy danh sách sản phẩm ✅
```typescript
// FE gọi: GET /api/products
// Query params:
{
  page?: number,          // default 1
  limit?: number,         // default 20
  category_id?: string,
  brand_id?: string,
  featured?: boolean,
  best_seller?: boolean,
  new_arrival?: boolean,
  q?: string,             // 🔴 SEARCH - cần implement
  sort?: "newest" | "price_asc" | "price_desc" | "rating" | "sold"
}
// Response:
{
  "products": [Product],
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  }
}
```

### 2.2. Lấy chi tiết sản phẩm ✅
```typescript
// FE gọi: GET /api/products/:id
// Response: ProductDetail
{
  "product_id": "uuid",
  "name": string,
  "slug": string,
  "sku": string,
  "short_description": string,
  "description": string,
  "price": number,
  "compare_price": number,
  "status": "active" | "draft" | "out_of_stock",
  "featured": boolean,
  "best_seller": boolean,
  "new_arrival": boolean,
  "view_count": number,
  "cost_price": number,
  "weight": number,
  "dimensions": string,
  "meta_title": string,
  "meta_description": string,
  "meta_keywords": string,
  "published_at": string,
  "categories": { category_id, name, slug },
  "brands": { brand_id, name, slug, logo_url },
  "product_images": [
    { "image_id": string, "image_url": string, "alt_text": string, "display_order": number, "is_primary": boolean }
  ],
  "product_variants": [
    {
      "variant_id": string,
      "sku": string,
      "name": string,
      "option1_name": string,    // vd: "Màu sắc"
      "option1_value": string,   // vd: "Titan Đen"
      "option2_name": string,    // vd: "Dung lượng"
      "option2_value": string,   // vd: "256GB"
      "price": number,
      "compare_price": number,
      "cost_price": number,
      "stock_quantity": number,
      "image_url": string,
      "is_active": boolean
    }
  ],
  "product_reviews": [ProductReview]
}
```

### 2.3. Lấy danh mục ✅
```typescript
// FE gọi: GET /api/categories
// Response:
[
  { "category_id": "uuid", "name": "Điện thoại", "slug": "dien-thoai" },
  { "category_id": "uuid", "name": "Laptop", "slug": "laptop" }
]
```

### 2.4. Lấy thương hiệu ❌ (CHƯA CÓ - cần implement)
```typescript
// FE gọi: GET /api/brands
// FE dùng để filter sản phẩm theo brand (Admin/Products sidebar)
// Response:
[
  {
    "brand_id": "uuid",
    "name": "Apple",
    "slug": "apple",
    "logo_url": "https://..."
  }
]
```

### 2.5. Tìm kiếm sản phẩm ❌ (CHƯA CÓ - cần implement)
```typescript
// FE gọi: GET /api/products?q=<search_term>
// FE dùng:
  - Header search trong StorefrontLayout
  - Search trong Product/List (query param ?q=...)
// Response: giống getProducts nhưng filtered theo tên, mô tả
```

### 2.6. Đánh giá sản phẩm (Reviews) ❌ (CHƯA CÓ - cần implement)
```typescript
// FE gọi: POST /api/products/:id/reviews
// Body:
{
  "rating": number,        // 1-5
  "title": string,
  "comment": string,
  "images": string[]       // URL array
}
// Header: Authorization: Bearer <token>

// FE gọi: GET /api/products/:id/reviews
// Response:
[
  {
    "review_id": "uuid",
    "product_id": "uuid",
    "user_id": "uuid",
    "order_id": "uuid",
    "rating": number,
    "title": string,
    "comment": string,
    "images": string[],
    "is_verified_purchase": boolean,
    "is_approved": boolean,
    "helpful_count": number,
    "created_at": string,
    "users": {
      "user_id": "uuid",
      "full_name": "Nguyễn Văn A",
      "avatar_url": "https://..."
    }
  }
]

// FE gọi: POST /api/products/:id/reviews/:reviewId/helpful
// Header: Authorization: Bearer <token>
```

---

## PHẦN 3: CART (Giỏ hàng)

### 3.1. Lấy giỏ hàng ✅
```typescript
// FE gọi: GET /api/cart
// Header: Authorization: Bearer <token> (user đã login)
Guest user: dùng session_id
// Response:
{
  "cart_id": "uuid",
  "user_id": "uuid",
  "session_id": string | null,
  "created_at": string,
  "updated_at": string,
  "cart_items": [
    {
      "cart_item_id": "uuid",
      "cart_id": "uuid",
      "product_id": "uuid",
      "variant_id": "uuid",
      "quantity": number,
      "price": number,
      "created_at": string,
      "updated_at": string,
      "products": {
        "product_id": "uuid",
        "name": string,
        "slug": string,
        "price": number,
        "compare_price": number,
        "product_images": [{ "image_id": string, "image_url": string, "is_primary": boolean }]
      },
      "product_variants": {
        "variant_id": "uuid",
        "name": string,          // vd: "256GB - Titan Đen"
        "price": number,
        "compare_price": number,
        "stock_quantity": number
      }
    }
  ]
}
```

### 3.2. Thêm vào giỏ hàng ✅
```typescript
// FE gọi: POST /api/cart
// Header: Authorization: Bearer <token>
// Body:
{
  "product_id": string,
  "variant_id": string,    // optional - nếu sản phẩm có biến thể
  "quantity": number
}
// Response: Cart (full cart sau khi thêm)
```

### 3.3. Cập nhật số lượng ✅
```typescript
// FE gọi: PUT /api/cart/:cartItemId
// Header: Authorization: Bearer <token>
// Body: { quantity: number }
// Response: Cart
```

### 3.4. Xóa sản phẩm khỏi giỏ hàng ✅
```typescript
// FE gọi: DELETE /api/cart/:cartItemId
// Header: Authorization: Bearer <token>
// Response: Cart
```

### 3.5. Xóa toàn bộ giỏ hàng ✅
```typescript
// FE gọi: DELETE /api/cart
// Header: Authorization: Bearer <token>
// Response: Cart (empty)
```

---

## PHẦN 4: ORDERS (Đơn hàng)

### 4.1. Đặt hàng ✅
```typescript
// FE gọi: POST /api/orders
// Header: Authorization: Bearer <token>
// Body:
{
  "customer_name": string,
  "customer_email": string,
  "customer_phone": string,
  "shipping_address_line1": string,
  "shipping_address_line2": string | null,
  "shipping_city": string,
  "shipping_district": string,
  "shipping_ward": string,
  "shipping_postal_code": string,
  "shipping_country": string,
  "billing_address_line1": string,
  "billing_address_line2": string | null,
  "billing_city": string,
  "billing_district": string,
  "billing_ward": string,
  "billing_postal_code": string,
  "billing_country": string,
  "payment_method": string,   // "cod" | "bank" | "momo" | "vnpay" | "paypal"
  "shipping_method": string,  // "standard" | "express" | "same_day"
  "coupon_code": string,
  "notes": string
}
// Response:
{
  "order_id": "uuid",
  "order_number": "DH20240001",
  ...Order object
}
```

### 4.2. Mua ngay ✅
```typescript
// FE gọi: POST /api/orders/buy-now
// Header: Authorization: Bearer <token>
// Body: giống placeOrder + thêm { product_id, variant_id, quantity }
// Response: Order
```

### 4.3. Lấy danh sách đơn hàng ✅
```typescript
// FE gọi: GET /api/orders
// Header: Authorization: Bearer <token>
// Query:
{
  page?: number,
  limit?: number,
  status?: string   // "pending" | "processing" | "shipped" | "delivered" | "cancelled"
}
// Response:
{
  "orders": [
    {
      "order_id": "uuid",
      "order_number": "DH20240001",
      "user_id": "uuid",
      "status": "pending" | "processing" | "shipped" | "delivered" | "cancelled",
      "payment_status": "paid" | "unpaid" | "refunded",
      "shipping_status": "not_shipped" | "shipped" | "delivered",
      "customer_email": string,
      "customer_phone": string,
      "customer_name": string,
      ...shipping/billing addresses,
      "subtotal": number,
      "shipping_fee": number,
      "tax_amount": number,
      "discount_amount": number,
      "total_amount": number,
      "coupon_code": string,
      "payment_method": string,
      "shipping_method": string,
      "notes": string,
      "internal_notes": string | null,
      "tracking_number": string | null,
      "shipped_at": string | null,
      "delivered_at": string | null,
      "cancelled_at": string | null,
      "cancellation_reason": string | null,
      "created_at": string,
      "updated_at": string,
      "order_items": [
        {
          "order_item_id": "uuid",
          "order_id": "uuid",
          "product_id": "uuid",
          "variant_id": "uuid",
          "product_name": string,
          "variant_name": string,
          "sku": string,
          "quantity": number,
          "unit_price": number,
          "total_price": number,
          "created_at": string
        }
      ]
    }
  ],
  "pagination": { page, limit, total, totalPages }
}
```

### 4.4. Lấy chi tiết đơn hàng ✅
```typescript
// FE gọi: GET /api/orders/:orderId
// Header: Authorization: Bearer <token>
// Response: Order (full detail)
```

### 4.5. Hủy đơn hàng ✅
```typescript
// FE gọi: POST /api/orders/:orderId/cancel
// Header: Authorization: Bearer <token>
// Body: { reason: string }
// Response: Order
```

### 4.6. Lấy phương thức vận chuyển ✅
```typescript
// FE gọi: GET /api/orders/shipping-methods
// Response:
{
  "shipping_methods": [
    {
      "id": "standard",
      "label": "Tiêu chuẩn",
      "courier": "GHN",
      "eta": "3-5 ngày",
      "price": 30000,
      "date": "19-21/01/2024"
    },
    {
      "id": "express",
      "label": "Nhanh",
      "courier": "GHTK",
      "eta": "1-2 ngày",
      "price": 60000
    },
    {
      "id": "same_day",
      "label": "Hỏa tốc",
      "courier": "Grab Express",
      "eta": "Hôm nay",
      "price": 120000
    }
  ]
}
```

### 4.7. Lấy phương thức thanh toán ✅
```typescript
// FE gọi: GET /api/orders/payment-methods
// Response:
{
  "payment_methods": [
    { "id": "cod", "label": "Thanh toán khi nhận hàng (COD)" },
    { "id": "bank", "label": "Chuyển khoản ngân hàng" },
    { "id": "momo", "label": "Ví MoMo" },
    { "id": "vnpay", "label": "VNPay QR" },
    { "id": "paypal", "label": "PayPal" }
  ]
}
```

### 4.8. Lấy tùy chọn checkout ✅
```typescript
// FE gọi: GET /api/orders/checkout-options
// Response:
{
  "shipping_methods": [...],
  "payment_methods": [...]
}
```

### 4.9. Theo dõi đơn hàng ❌ (CHƯA CÓ)
```typescript
// FE gọi: GET /api/orders/:orderId/track
// Header: Authorization: Bearer <token>
// FE dùng để hiển thị trạng thái giao hàng chi tiết trong Chat Widget và Account
// Response:
{
  "order_id": "uuid",
  "order_number": "DH20240001",
  "status": string,
  "tracking_number": string | null,
  "timeline": [
    {
      "status": "ordered",
      "label": "Đã đặt hàng",
      "timestamp": "2024-01-15T10:30:00Z",
      "note": string
    },
    {
      "status": "confirmed",
      "label": "Đã xác nhận",
      "timestamp": "2024-01-15T11:00:00Z"
    },
    {
      "status": "shipped",
      "label": "Đã giao cho đơn vị vận chuyển",
      "timestamp": "2024-01-16T08:00:00Z",
      "tracking_number": "GHN123456"
    },
    {
      "status": "delivering",
      "label": "Đang giao hàng",
      "timestamp": "2024-01-17T14:00:00Z"
    }
  ]
}
```

### 4.10. Lấy danh sách đơn hàng (Admin/Staff) ❌ (CHƯA CÓ)
```typescript
// FE gọi: GET /api/admin/orders
// Header: Authorization: Bearer <token> (role: admin | staff)
// Query:
{
  page?: number,
  limit?: number,
  status?: string,
  search?: string,        // tìm theo order_number, customer_name
  date_from?: string,     // ISO date
  date_to?: string,
  payment_status?: string
}
// Response: giống getOrders nhưng KHÔNG giới hạn theo user_id
```

### 4.11. Cập nhật trạng thái đơn hàng (Admin/Staff) ❌ (CHƯA CÓ)
```typescript
// FE gọi: PATCH /api/admin/orders/:orderId
// Header: Authorization: Bearer <token> (role: admin | staff)
// Body:
{
  "status": string,           // "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  "payment_status": string,   // "unpaid" | "paid" | "refunded"
  "shipping_status": string,  // "not_shipped" | "shipped" | "delivered"
  "tracking_number": string,
  "internal_notes": string,
  "shipped_at": string,
  "delivered_at": string
}
// Response: Order
```

### 4.12. Xuất đơn hàng Excel (Admin) ❌ (CHƯA CÓ)
```typescript
// FE gọi: GET /api/admin/orders/export
// Query: giống getAdminOrders
// Response: file Excel (.xlsx) hoặc JSON array nếu không export file
```

---

## PHẦN 5: PROFILE (Tài khoản người dùng)

### 5.1. Lấy thông tin profile ✅
```typescript
// FE gọi: GET /api/profile
// Header: Authorization: Bearer <token>
// Response:
{
  "user_id": "uuid",
  "email": string,
  "full_name": string,
  "phone": string,
  "role": string,
  "avatar_url": string,
  "status": string,
  "email_verified": boolean,
  "last_login": string | null,
  "created_at": string,
  "updated_at": string,
  "user_addresses": [Address]
}
```

### 5.2. Cập nhật profile ✅
```typescript
// FE gọi: PATCH /api/profile
// Header: Authorization: Bearer <token>
// Body:
{
  "full_name": string,
  "phone": string,
  "avatar_url": string
}
// Response: Profile
```

### 5.3. Tạo profile (đăng ký) ❌ (CÓ thể gộp vào auth/register hoặc tách riêng)
```typescript
// FE gọi: POST /api/profile
// Header: Authorization: Bearer <token>
// Body:
{
  "email": string,
  "password": string,
  "full_name": string,
  "phone": string,
  "avatar_url": string
}
```

### 5.4. Xóa tài khoản ❌ (CHƯA CÓ)
```typescript
// FE gọi: DELETE /api/profile
// Header: Authorization: Bearer <token>
// Response: { message: string }
```

### 5.5. Đổi mật khẩu ❌ (CHƯA CÓ)
```typescript
// FE gọi: PATCH /api/profile/password
// Header: Authorization: Bearer <token>
// Body:
{
  "current_password": string,
  "new_password": string   // min 8 chars
}
// Response: { message: string }
```

### 5.6. Lấy danh sách địa chỉ ✅
```typescript
// FE gọi: GET /api/profile/addresses
// Header: Authorization: Bearer <token>
// Response:
[
  {
    "address_id": "uuid",
    "user_id": "uuid",
    "address_type": "home" | "office",
    "full_name": string,
    "phone": string,
    "address_line1": string,
    "address_line2": string | null,
    "city": string,
    "district": string | null,
    "ward": string | null,
    "postal_code": string | null,
    "country": string,
    "is_default": boolean,
    "created_at": string,
    "updated_at": string
  }
]
```

### 5.7. Thêm địa chỉ ✅
```typescript
// FE gọi: POST /api/profile/addresses
// Header: Authorization: Bearer <token>
// Body:
{
  "address_type": "home" | "office",
  "full_name": string,
  "phone": string,
  "address_line1": string,
  "address_line2": string | null,
  "city": string,
  "district": string,
  "ward": string,
  "postal_code": string,
  "country": string,
  "is_default": boolean
}
// Response: Address
```

### 5.8. Cập nhật địa chỉ ✅
```typescript
// FE gọi: PATCH /api/profile/addresses/:addressId
// Header: Authorization: Bearer <token>
// Body: giống createAddress
// Response: Address
```

### 5.9. Xóa địa chỉ ✅
```typescript
// FE gọi: DELETE /api/profile/addresses/:addressId
// Header: Authorization: Bearer <token>
// Response: { message: string }
```

### 5.10. Thống kê tài khoản (Account Overview) ❌ (CHƯA CÓ)
```typescript
// FE gọi: GET /api/profile/stats
// Header: Authorization: Bearer <token>
// FE dùng để hiển thị overview: totalOrders, pendingOrders, totalSpent, totalReviews
// Response:
{
  "total_orders": number,
  "pending_orders": number,    // status: pending | processing
  "total_spent": number,      // tổng tiền đã mua
  "total_reviews": number      // số đánh giá đã viết
}
```

---

## PHẦN 6: COUPONS / KHUYẾN MÃI

### 6.1. Áp dụng mã giảm giá ❌ (CHƯA CÓ)
```typescript
// FE gọi: POST /api/coupons/validate
// Header: Authorization: Bearer <token>
// Body:
{
  "coupon_code": string,
  "cart_total": number   // để tính giảm theo %
}
// FE dùng trong Cart screen (hiện tại hardcode "SALE10" = 10%)
// Response:
{
  "valid": boolean,
  "coupon_code": string,
  "discount_type": "percentage" | "fixed",
  "discount_value": number,
  "min_order_amount": number,
  "max_discount": number,
  "message": string
}
// Khi valid: FE hiển thị giảm giá, cộng vào order khi checkout
```

### 6.2. Lấy danh sách coupon của user ❌ (CHƯA CÓ)
```typescript
// FE gọi: GET /api/profile/coupons
// Header: Authorization: Bearer <token>
// FE dùng trong Account > Voucher
// Response:
[
  {
    "coupon_id": "uuid",
    "code": string,
    "title": string,
    "description": string,
    "discount_type": "percentage" | "fixed",
    "discount_value": number,
    "min_order_amount": number,
    "max_discount": number,
    "expires_at": string,
    "is_used": boolean
  }
]
```

---

## PHẦN 7: NOTIFICATIONS (Thông báo)

### 7.1. Lấy danh sách thông báo ❌ (CHƯA CÓ)
```typescript
// FE gọi: GET /api/notifications
// Header: Authorization: Bearer <token>
// FE dùng trong Account > Notifications
// Response:
{
  "notifications": [
    {
      "notification_id": "uuid",
      "user_id": "uuid",
      "type": "order" | "promotion" | "system",
      "title": string,
      "message": string,
      "is_read": boolean,
      "data": {
        "order_id": "uuid",
        "order_number": "DH20240001"
      },
      "created_at": string
    }
  ],
  "pagination": { page, limit, total, totalPages }
}
```

### 7.2. Đánh dấu đã đọc ❌ (CHƯA CÓ)
```typescript
// FE gọi: PATCH /api/notifications/:id/read
// Header: Authorization: Bearer <token>

// FE gọi: PATCH /api/notifications/read-all
// Header: Authorization: Bearer <token>
// Response: { message: string }
```

### 7.3. Số thông báo chưa đọc ❌ (CHƯA CÓ)
```typescript
// FE gọi: GET /api/notifications/unread-count
// Header: Authorization: Bearer <token>
// FE dùng để hiển thị badge trên icon Bell trong header
// Response: { count: number }
```

---

## PHẦN 8: WISHLIST / YÊU THÍCH ❌ (CHƯA CÓ)

```typescript
// FE gọi: GET /api/wishlist
// Header: Authorization: Bearer <token>
// FE dùng trong Product/Detail (nút tim ❤)

// FE gọi: POST /api/wishlist
// Body: { product_id: string, variant_id?: string }

// FE gọi: DELETE /api/wishlist/:productId
// Header: Authorization: Bearer <token>

// Response:
{
  "wishlist_id": "uuid",
  "user_id": "uuid",
  "items": [
    {
      "wishlist_item_id": "uuid",
      "product_id": "uuid",
      "variant_id": string | null,
      "created_at": string,
      "products": Product
    }
  ]
}
```

---

## PHẦN 9: AI CHATBOT

### 9.1. Gửi tin nhắn chatbot ❌ (CHƯA CÓ)
```typescript
// FE gọi: POST /api/chat
// Header: Authorization: Bearer <token> (optional - guest cũng chat được)
// Body:
{
  "message": string,
  "session_id": string,      // để maintain context
  "user_id": string | null,
  "context": {
    "last_order_id": string | null,
    "last_product_id": string | null,
    "intent": string | null
  }
}
// Response:
{
  "reply": string,
  "session_id": string,
  "intent": string,          // "product_inquiry" | "order_inquiry" | "return_policy" | ...
  "confidence": number,      // 0-1
  "suggestions": string[],   // ["Xem iPhone 15", "Kiểm tra đơn hàng"]
  "handoff": boolean,        // true = chuyển nhân viên
  "data": {
    "products": [Product],   // nếu intent = product
    "order": Order           // nếu intent = order
  }
}
```

### 9.2. Lấy lịch sử chat ❌ (CHƯA CÓ)
```typescript
// FE gọi: GET /api/chat/history
// Header: Authorization: Bearer <token>
// Query: { session_id: string, limit?: number }
// Response:
[
  {
    "message_id": "uuid",
    "session_id": "uuid",
    "sender": "user" | "bot" | "staff",
    "text": string,
    "intent": string | null,
    "created_at": string
  }
]
```

---

## PHẦN 10: ADMIN DASHBOARD STATISTICS ❌ (CHƯA CÓ)

```typescript
// FE gọi: GET /api/admin/dashboard
// Header: Authorization: Bearer <token> (role: admin)
// FE dùng để hiển thị KPI cards và charts
// Response:
{
  "kpis": {
    "today_revenue": number,
    "revenue_change_percent": number,
    "new_orders_today": number,
    "orders_change_percent": number,
    "total_users": number,
    "users_change_percent": number,
    "open_chats": number,
    "chats_change_percent": number
  },
  "revenue_7days": [
    { "day": "2024-01-15", "revenue": 45000000 },
    { "day": "2024-01-16", "revenue": 52000000 }
  ],
  "order_status_breakdown": [
    { "status": "delivered", "count": 245 },
    { "status": "shipped", "count": 67 },
    { "status": "processing", "count": 43 },
    { "status": "pending", "count": 28 },
    { "status": "cancelled", "count": 12 }
  ],
  "recent_orders": [Order],   // 5 đơn hàng mới nhất
  "open_conversations": [ConversationSummary]  // 5 chat đang mở
}
```

---

## PHẦN 11: ADMIN PRODUCTS MANAGEMENT ❌ (CHƯA CÓ)

```typescript
// 11.1. Tạo sản phẩm
// FE gọi: POST /api/admin/products
// Header: Authorization: Bearer <token> (role: admin)
// Body: ProductCreateRequest (đầy đủ fields)

// 11.2. Cập nhật sản phẩm
// FE gọi: PUT /api/admin/products/:id
// Header: Authorization: Bearer <token>
// Body: ProductUpdateRequest

// 11.3. Xóa sản phẩm
// FE gọi: DELETE /api/admin/products/:id
// Header: Authorization: Bearer <token>
// Response: { message: string }

// 11.4. Upload ảnh sản phẩm
// FE gọi: POST /api/admin/products/:id/images
// Header: Authorization: Bearer <token>
// Body: FormData (file ảnh)
// Response: { image_id, image_url }

// 11.5. Xóa ảnh sản phẩm
// FE gọi: DELETE /api/admin/products/:id/images/:imageId
// Header: Authorization: Bearer <token>

// 11.6. Tạo biến thể
// FE gọi: POST /api/admin/products/:id/variants
// Body: VariantCreateRequest

// 11.7. Cập nhật biến thể
// FE gọi: PUT /api/admin/products/:id/variants/:variantId
// Body: VariantUpdateRequest

// 11.8. Xuất danh sách sản phẩm
// FE gọi: GET /api/admin/products/export
// Query: { category_id?, brand_id?, status? }
// Response: Excel file hoặc JSON
```

---

## PHẦN 12: ADMIN AI TRAINING DATA ❌ (CHƯA CÓ)

```typescript
// 12.1. Lấy danh sách Q&A training data
// FE gọi: GET /api/admin/ai-training
// Header: Authorization: Bearer <token>
// Query:
{
  page?: number,
  limit?: number,
  category?: string,        // "Thông tin sản phẩm" | "FAQ" | "Chính sách" | "Hướng dẫn"
  search?: string,
  active_only?: boolean
}
// Response:
{
  "data": [
    {
      "qa_id": "uuid",
      "category": "FAQ",
      "question": string,
      "answer": string,
      "keywords": string[],
      "intent": string,
      "is_active": boolean,
      "usage_count": number,
      "feedback_positive": number,
      "feedback_negative": number,
      "confidence_score": number,
      "created_at": string,
      "updated_at": string
    }
  ],
  "pagination": { page, limit, total, totalPages }
}

// 12.2. Tạo Q&A entry
// FE gọi: POST /api/admin/ai-training
// Header: Authorization: Bearer <token>
// Body:
{
  "category": string,
  "question": string,
  "answer": string,
  "keywords": string[],
  "intent": string,
  "is_active": boolean
}

// 12.3. Cập nhật Q&A entry
// FE gọi: PUT /api/admin/ai-training/:id
// Header: Authorization: Bearer <token>
// Body: giống create

// 12.4. Xóa Q&A entry
// FE gọi: DELETE /api/admin/ai-training/:id
// Header: Authorization: Bearer <token>

// 12.5. Import CSV
// FE gọi: POST /api/admin/ai-training/import
// Body: FormData (file CSV)
// Response: { imported: number, errors: [] }

// 12.6. Export
// FE gọi: GET /api/admin/ai-training/export
// Response: CSV file

// 12.7. AI Performance metrics
// FE gọi: GET /api/admin/ai-training/metrics
// Response:
{
  "total_questions": number,
  "avg_accuracy": number,
  "top_intents": [{ "intent": string, "count": number }],
  "low_confidence_logs": [
    {
      "question": string,
      "predicted_intent": string,
      "confidence_score": number,
      "created_at": string
    }
  ],
  "feedback_trend_7days": [
    { "day": "2024-01-15", "positive": 45, "negative": 3 }
  ]
}
```

---

## PHẦN 13: ADMIN CHAT CONSOLE (Staff/Admin Chat Management) ❌ (CHƯA CÓ)

```typescript
// 13.1. Lấy danh sách hội thoại
// FE gọi: GET /api/admin/conversations
// Header: Authorization: Bearer <token> (role: admin | staff)
// Query:
{
  page?: number,
  limit?: number,
  status?: "open" | "waiting" | "bot" | "closed",
  priority?: "urgent" | "high" | "normal",
  assigned_to?: string,      // staff_id
  search?: string
}
// Response:
{
  "conversations": [
    {
      "conversation_id": "uuid",
      "customer": {
        "user_id": "uuid",
        "full_name": string,
        "email": string,
        "phone": string,
        "avatar_url": string
      },
      "status": "open" | "waiting" | "bot" | "closed",
      "priority": "urgent" | "high" | "normal",
      "assigned_to": string | null,  // staff_id
      "assigned_staff_name": string | null,
      "last_message": string,
      "last_message_at": string,
      "unread_count": number,
      "intent": string,
      "sentiment_score": number,
      "tags": string[],
      "created_at": string
    }
  ],
  "pagination": { page, limit, total, totalPages }
}

// 13.2. Lấy chi tiết hội thoại + messages
// FE gọi: GET /api/admin/conversations/:id
// Header: Authorization: Bearer <token>
// Response:
{
  "conversation": Conversation,
  "messages": [
    {
      "message_id": "uuid",
      "conversation_id": "uuid",
      "sender_type": "user" | "bot" | "staff",
      "sender_id": "uuid | null",
      "sender_name": string,
      "text": string,
      "created_at": string
    }
  ],
  "customer_orders": [Order],   // đơn hàng gần đây của khách
  "internal_notes": string
}

// 13.3. Gửi tin nhắn từ staff
// FE gọi: POST /api/admin/conversations/:id/messages
// Header: Authorization: Bearer <token>
// Body: { text: string }

// 13.4. Cập nhật hội thoại (gán staff, đổi priority, đóng)
// FE gọi: PATCH /api/admin/conversations/:id
// Header: Authorization: Bearer <token>
// Body:
{
  "assigned_to": string,
  "priority": "urgent" | "high" | "normal",
  "status": "open" | "waiting" | "closed",
  "tags": string[],
  "internal_notes": string
}

// 13.5. Lấy danh sách staff (để assign)
// FE gọi: GET /api/staff
// Header: Authorization: Bearer <token>
// Response:
[
  {
    "user_id": "uuid",
    "full_name": string,
    "role": "staff",
    "avatar_url": string,
    "is_online": boolean
  }
]

// 13.6. Lấy quick replies mẫu
// FE gọi: GET /api/admin/quick-replies
// Header: Authorization: Bearer <token>
// Response:
[
  { "id": "uuid", "text": string, "category": string }
]
```

---

## PHẦN 14: ADMIN ORDER STATUS MANAGEMENT ❌ (CHƯA CÓ)

```typescript
// FE gọi: GET /api/orders/status-options
// Response: các status options cho admin filter
{
  "statuses": [
    { "value": "pending", "label": "Chờ xác nhận", "color": "amber" },
    { "value": "processing", "label": "Đang xử lý", "color": "blue" },
    { "value": "shipped", "label": "Đang giao", "color": "indigo" },
    { "value": "delivered", "label": "Đã giao", "color": "green" },
    { "value": "cancelled", "label": "Đã hủy", "color": "red" }
  ]
}
```

---

## PHẦN 15: PAYMENT GATEWAY ❌ (CHƯA CÓ)

Khi user chọn payment_method = "momo" | "vnpay" | "paypal" | "bank":

```typescript
// FE gọi: POST /api/payments/create-payment-url
// Header: Authorization: Bearer <token>
// Body:
{
  "order_id": string,
  "payment_method": "momo" | "vnpay" | "paypal" | "bank_transfer",
  "return_url": string   // FE redirect sau khi thanh toán xong
}
// Response:
{
  "payment_url": string,   // URL redirect sang MoMo/VNPay/PayPal
  "order_id": string,
  "transaction_id": string
}

// FE gọi: GET /api/payments/callback
// Backend verify signature, update order payment_status = "paid"
// Redirect về FE /checkout?success=true hoặc ?success=false
```

---

## MAPPING TRẠNG THÁI

```typescript
// Order status mapping
const ORDER_STATUS_MAP = {
  FE_send: "pending",        // Chờ xử lý
  BE_confirm: "processing", // Đang xử lý
  BE_ship: "shipped",        // Đang giao
  BE_deliver: "delivered",   // Đã giao
  BE_cancel: "cancelled",    // Đã hủy
  user_cancel: "cancelled"
};

// Product status mapping
const PRODUCT_STATUS_MAP = {
  "active": "Đang bán",
  "draft": "Nháp",
  "out_of_stock": "Hết hàng",
  "inactive": "Ngừng bán"
};

// Chat conversation status
const CHAT_STATUS_MAP = {
  "open": "Đang mở",       // staff đang chat
  "waiting": "Chờ",          // chờ staff
  "bot": "Bot",              // AI đang xử lý
  "closed": "Đã đóng"
};
```

---

## CÁC ENDPOINT ĐÃ CÓ & CẦN VERIFY

| # | Method | Endpoint | Status | Mô tả |
|---|--------|----------|--------|--------|
| 1 | POST | /api/auth/login | ✅ Có | Đăng nhập |
| 2 | POST | /api/auth/register | ❌ Chưa | Đăng ký |
| 3 | GET | /api/auth/google | ❌ Chưa | Google OAuth |
| 4 | GET | /api/auth/facebook | ❌ Chưa | Facebook OAuth |
| 5 | GET | /api/products | ✅ Có | Danh sách SP |
| 6 | GET | /api/products/:id | ✅ Có | Chi tiết SP |
| 7 | GET | /api/categories | ✅ Có | Danh mục |
| 8 | GET | /api/brands | ❌ Chưa | Thương hiệu |
| 9 | GET | /api/products/search | ❌ Chưa | Tìm kiếm |
| 10 | POST | /api/products/:id/reviews | ❌ Chưa | Thêm đánh giá |
| 11 | GET | /api/products/:id/reviews | ❌ Chưa | Lấy đánh giá |
| 12 | GET | /api/cart | ✅ Có | Lấy giỏ hàng |
| 13 | POST | /api/cart | ✅ Có | Thêm vào giỏ |
| 14 | PUT | /api/cart/:itemId | ✅ Có | Cập nhật số lượng |
| 15 | DELETE | /api/cart/:itemId | ✅ Có | Xóa khỏi giỏ |
| 16 | DELETE | /api/cart | ✅ Có | Xóa giỏ hàng |
| 17 | POST | /api/orders | ✅ Có | Đặt hàng |
| 18 | POST | /api/orders/buy-now | ✅ Có | Mua ngay |
| 19 | GET | /api/orders | ✅ Có | DS đơn hàng (user) |
| 20 | GET | /api/orders/:id | ✅ Có | Chi tiết đơn |
| 21 | POST | /api/orders/:id/cancel | ✅ Có | Hủy đơn |
| 22 | GET | /api/orders/:id/track | ❌ Chưa | Theo dõi đơn |
| 23 | GET | /api/orders/shipping-methods | ✅ Có | Phương thức vận chuyển |
| 24 | GET | /api/orders/payment-methods | ✅ Có | Phương thức thanh toán |
| 25 | GET | /api/orders/checkout-options | ✅ Có | Tùy chọn checkout |
| 26 | GET | /api/admin/orders | ❌ Chưa | DS đơn (admin) |
| 27 | PATCH | /api/admin/orders/:id | ❌ Chưa | Cập nhật đơn |
| 28 | GET | /api/admin/orders/export | ❌ Chưa | Export Excel |
| 29 | GET | /api/admin/dashboard | ❌ Chưa | Dashboard stats |
| 30 | GET | /api/profile | ✅ Có | Thông tin profile |
| 31 | PATCH | /api/profile | ✅ Có | Cập nhật profile |
| 32 | DELETE | /api/profile | ❌ Chưa | Xóa tài khoản |
| 33 | PATCH | /api/profile/password | ❌ Chưa | Đổi mật khẩu |
| 34 | GET | /api/profile/stats | ❌ Chưa | Thống kê TK |
| 35 | GET | /api/profile/addresses | ✅ Có | DS địa chỉ |
| 36 | POST | /api/profile/addresses | ✅ Có | Thêm địa chỉ |
| 37 | PATCH | /api/profile/addresses/:id | ✅ Có | Cập nhật địa chỉ |
| 38 | DELETE | /api/profile/addresses/:id | ✅ Có | Xóa địa chỉ |
| 39 | GET | /api/notifications | ❌ Chưa | Thông báo |
| 40 | PATCH | /api/notifications/:id/read | ❌ Chưa | Đánh dấu đã đọc |
| 41 | PATCH | /api/notifications/read-all | ❌ Chưa | Đọc tất cả |
| 42 | GET | /api/notifications/unread-count | ❌ Chưa | Số TB chưa đọc |
| 43 | GET | /api/wishlist | ❌ Chưa | DS yêu thích |
| 44 | POST | /api/wishlist | ❌ Chưa | Thêm yêu thích |
| 45 | DELETE | /api/wishlist/:productId | ❌ Chưa | Xóa yêu thích |
| 46 | POST | /api/coupons/validate | ❌ Chưa | Áp mã giảm giá |
| 47 | GET | /api/coupons (profile) | ❌ Chưa | Coupon của user |
| 48 | POST | /api/chat | ❌ ChƯa | Chat AI |
| 49 | GET | /api/chat/history | ❌ Chưa | Lịch sử chat |
| 50 | GET | /api/admin/conversations | ❌ Chưa | DS hội thoại |
| 51 | GET | /api/admin/conversations/:id | ❌ Chưa | Chi tiết hội thoại |
| 52 | POST | /api/admin/conversations/:id/messages | ❌ Chưa | Gửi tin nhắn staff |
| 53 | PATCH | /api/admin/conversations/:id | ❌ Chưa | Cập nhật hội thoại |
| 54 | GET | /api/staff | ❌ Chưa | DS nhân viên |
| 55 | GET | /api/admin/ai-training | ❌ Chưa | Q&A training data |
| 56 | POST | /api/admin/ai-training | ❌ Chưa | Tạo Q&A |
| 57 | PUT | /api/admin/ai-training/:id | ❌ Chưa | Cập nhật Q&A |
| 58 | DELETE | /api/admin/ai-training/:id | ❌ Chưa | Xóa Q&A |
| 59 | POST | /api/admin/ai-training/import | ❌ Chưa | Import CSV |
| 60 | GET | /api/admin/ai-training/export | ❌ Chưa | Export CSV |
| 61 | GET | /api/admin/ai-training/metrics | ❌ ChƯa | AI metrics |
| 62 | POST | /api/admin/products | ❌ Chưa | Tạo sản phẩm |
| 63 | PUT | /api/admin/products/:id | ❌ Chưa | Cập nhật SP |
| 64 | DELETE | /api/admin/products/:id | ❌ Chưa | Xóa sản phẩm |
| 65 | POST | /api/payments/create-payment-url | ❌ Chưa | Tạo payment URL |
| 66 | GET | /api/orders/status-options | ❌ Chưa | Status options |

---

## LƯU Ý QUAN TRỌNG

### JWT Authentication
- Tất cả endpoints cần auth đều dùng `Authorization: Bearer <token>` trong header
- Token được lưu trong localStorage key `token`
- User info lưu trong localStorage key `user` (JSON string)
- Khi 401: Frontend tự redirect về /login

### Error Response Format
```typescript
{
  "error": string,        // error message
  "message": string,       // human-readable
  "code": string          // optional error code
}
```

### Pagination Format
```typescript
{
  page: number,
  limit: number,
  total: number,
  totalPages: number
}
```

### Date Format
- Tất cả dates trả về theo ISO 8601: `"2024-01-15T10:30:00Z"`
- FE hiển thị format: `new Date(dateString).toLocaleDateString("vi-VN")`
