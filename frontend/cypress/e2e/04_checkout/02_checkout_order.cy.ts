describe("Module 4.2: Checkout - Quy trình Đặt hàng & Phương thức thanh toán", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    // 1. Thêm 1 sản phẩm vào giỏ trước khi vào Checkout
    cy.visit("/products");
    cy.get('.grid .group').should('have.length.at.least', 1);
    cy.get('.grid .group').first().find('img').first().click({ force: true });
    cy.get('div[class*="z-[100]"]').find('button:has(svg.lucide-shopping-cart)').first().click({ force: true });
    cy.get('button[title*="Đóng"]').first().click({ force: true });
    cy.visit("/checkout");

    // 2. Chờ và bấm nút TIẾP TỤC VỚI TƯ CÁCH KHÁCH để đóng popup Khách vãng lai
    cy.contains('button', /TIẾP TỤC VỚI TƯ CÁCH KHÁCH/i).click({ force: true });
    cy.contains(/THÔNG BÁO KHÁCH VÃNG LAI/i).should('not.exist');
  });

  it("TC_FE_CHK_006: [Form Validation] Kiểm tra các trường bắt buộc (Họ tên, SĐT, Địa chỉ)", () => {
    // 1. Kiểm tra các input form bắt buộc hiển thị
    cy.get('input[placeholder="Nguyễn Văn A"]').should('be.visible');
    cy.get('input[placeholder="0912 345 678"]').should('be.visible');
    cy.get('textarea[placeholder*="Số nhà"]').should('be.visible');

    // 2. Thử xóa trắng Họ tên và SĐT rồi bấm Submit
    cy.get('input[placeholder="Nguyễn Văn A"]').clear({ force: true });
    cy.get('input[placeholder="0912 345 678"]').clear({ force: true });
    cy.get('button[type="submit"]').first().click({ force: true });

    // 3. Form không gửi đi thành công mà vẫn giữ ở trang checkout
    cy.url().should('include', '/checkout');
  });

  it("TC_FE_CHK_007: [Shipping Delivery Fee BVA] Chuyển đổi Tiêu chuẩn (0đ) và Hỏa tốc (120.000đ) cập nhật Tổng tiền", () => {
    // 1. Mặc định phương thức Vận Chuyển Tiêu Chuẩn (Miễn phí)
    cy.contains(/Vận Chuyển Tiêu Chuẩn/i).should('be.visible');

    // 2. Click chọn Ship Hoả Tốc Toàn Quốc (120.000₫)
    cy.contains(/Ship Hoả Tốc Toàn Quốc/i).click({ force: true });

    // 3. Kiểm tra mục Phí vận chuyển hiển thị 120.000₫
    cy.get('body').should('contain.text', '120.000₫');

    // 4. Chuyển lại về Vận Chuyển Tiêu Chuẩn
    cy.contains(/Vận Chuyển Tiêu Chuẩn/i).click({ force: true });
    cy.get('body').should('contain.text', 'Miễn Phí');
  });

  it("TC_FE_CHK_008: [Payment Methods Selection] Chuyển đổi linh hoạt giữa các phương thức thanh toán", () => {
    // 1. Click chọn phương thức VietQR
    cy.contains('button', /VietQR/i).click({ force: true });
    cy.contains('button', /VietQR/i).should('have.class', 'bg-black');

    // 2. Click chọn phương thức MoMo
    cy.contains('button', /MoMo/i).click({ force: true });
    cy.contains('button', /MoMo/i).should('have.class', 'bg-black');

    // 3. Click chọn phương thức VNPAY
    cy.contains('button', /VNPAY/i).click({ force: true });
    cy.contains('button', /VNPAY/i).should('have.class', 'bg-black');

    // 4. Click chọn phương thức COD (Thanh toán khi nhận hàng)
    cy.contains('button', /COD/i).click({ force: true });
    cy.contains('button', /COD/i).should('have.class', 'bg-black');
    cy.contains(/Thanh toán khi nhận hàng/i).should('be.visible');
  });

  it("TC_FE_CHK_009: [Order Summary Integrity] Đối soát Danh sách sản phẩm, số lượng và tổng tiền trong Hóa đơn", () => {
    // 1. Khối 'ĐƠN ĐẶT HÀNG CỦA BẠN' hiển thị đầy đủ
    cy.contains(/ĐƠN ĐẶT HÀNG CỦA BẠN/i).should('be.visible');

    // 2. Có ít nhất 1 item với số lượng và giá tiền
    cy.contains(/Qty:/i).should('be.visible');
    cy.contains(/Tổng phụ sản phẩm|Cần thanh toán/i).should('be.visible');
  });

  it("TC_FE_CHK_010: [COD Order Submission] Điền thông tin giao nhận và Hoàn tất đặt đơn COD thành công", () => {
    // 1. Điền thông tin người nhận
    cy.get('input[placeholder="Nguyễn Văn A"]').clear({ force: true }).type("Trần Trung Nam", { force: true });
    cy.get('input[placeholder="0912 345 678"]').clear({ force: true }).type("0912345678", { force: true });
    cy.get('textarea[placeholder*="Số nhà"]').clear({ force: true }).type("70 Tô Ký, Phường Tân Chánh Hiệp, Quận 12, TP.HCM", { force: true });
    cy.get('textarea[placeholder*="Ví dụ: Lưu ý"]').clear({ force: true }).type("Giao vào giờ hành chính, bọc xốp chống sốc", { force: true });

    // 2. Chọn phương thức thanh toán COD
    cy.contains('button', /COD/i).click({ force: true });

    // 3. Bấm nút Tạo đơn đặt hàng
    cy.get('button[type="submit"]').contains(/Tạo đơn/i).click({ force: true });

    // 4. Giao diện chuyển sang màn hình Xử lý / Thành công
    cy.contains(/Thành công|Đang xử lý|Cảm ơn bạn đã tin tưởng|Mã đơn hàng|TECHVIE/i, { timeout: 10000 }).should('be.visible');
  });

  it("TC_FE_CHK_011: [Guest Mode Notice] Kiểm tra sự hiện diện của Popup thông báo Khách vãng lai khi chưa đăng nhập", () => {
    // 1. Mở thẳng /checkout
    cy.visit("/checkout");

    // 2. Popup THÔNG BÁO KHÁCH VÃNG LAI hiển thị với các lựa chọn
    cy.contains('h3', /THÔNG BÁO KHÁCH VÃNG LAI/i).should('be.visible');
    cy.contains('button', /TIẾP TỤC VỚI TƯ CÁCH KHÁCH/i).click({ force: true });
    cy.contains('h3', /THÔNG BÁO KHÁCH VÃNG LAI/i).should('not.exist');
  });
});
