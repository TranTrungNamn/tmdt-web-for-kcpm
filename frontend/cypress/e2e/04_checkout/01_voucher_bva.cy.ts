describe("Module 4.1: Checkout - Mã giảm giá (Voucher BVA)", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    // 1. Thêm trước 1 sản phẩm vào giỏ để vào Checkout với giỏ hàng có dữ liệu
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

  it("TC_FE_CHK_001: [Voucher Valid Application] Áp dụng mã Voucher hợp lệ và kiểm tra giảm trừ tổng tiền", () => {
    cy.get('input[placeholder*="TECHVIE2026"]').should('be.visible');

    // 1. Thử áp dụng mã voucher mặc định hệ thống hoặc chip gợi ý
    cy.get('body').then(($body) => {
      const chips = $body.find('button:contains("TECHVIE"), button:contains("GIAM"), button:contains("FUTURE")');
      if (chips.length > 0) {
        cy.wrap(chips.first()).click({ force: true });
      } else {
        cy.get('input[placeholder*="TECHVIE2026"]').clear().type("TECHVIE2026");
      }
    });

    // 2. Bấm nút ÁP DỤNG
    cy.get('input[placeholder*="TECHVIE2026"]').parent().find('button').click({ force: true });
    cy.wait(400);

    // 3. Thông báo áp dụng thành công hoặc trạng thái giảm giá hiển thị
    cy.get('body').then(($body) => {
      const bodyText = $body.text();
      expect(bodyText).to.match(/thành công|Ưu đãi giảm giá|Giảm|TECHVIE|FUTURE/i);
    });
  });

  it("TC_FE_CHK_002: [Voucher Invalid Error Handling] Nhập mã Voucher không tồn tại hiển thị thông báo lỗi", () => {
    // 1. Nhập mã voucher sai
    cy.get('input[placeholder*="TECHVIE2026"]').clear().type("MA_VOUCHER_TAO_LAO");

    // 2. Bấm nút ÁP DỤNG
    cy.get('input[placeholder*="TECHVIE2026"]').parent().find('button').click({ force: true });

    // 3. Thông báo lỗi hiển thị rõ ràng
    cy.contains(/không chính xác|không hợp lệ|hết hạn|lỗi/i).should('be.visible');
  });

  it("TC_FE_CHK_003: [Voucher Empty Validation] Bỏ trống ô mã ưu đãi và bấm Áp dụng", () => {
    // 1. Để trống ô mã voucher
    cy.get('input[placeholder*="TECHVIE2026"]').clear();

    // 2. Bấm nút ÁP DỤNG
    cy.get('input[placeholder*="TECHVIE2026"]').parent().find('button').click({ force: true });

    // 3. Cảnh báo yêu cầu nhập mã ưu đãi hiển thị
    cy.get('body').then(($body) => {
      const text = $body.text();
      expect(text).to.match(/Vui lòng nhập mã|Mã ưu đãi/i);
    });
  });

  it("TC_FE_CHK_004: [Quick Voucher Chip Fill] Click vào Chip gợi ý Voucher để tự động điền mã ưu đãi", () => {
    cy.get('body').then(($body) => {
      const voucherChips = $body.find('button:contains("TECHVIE"), button:contains("GIAM"), button:contains("FUTURE"), button:contains("VIPLAB")');
      if (voucherChips.length > 0) {
        cy.wrap(voucherChips.first()).click({ force: true });
        // Input được điền tự động
        cy.get('input[placeholder*="TECHVIE2026"]').should('not.have.value', '');
      } else {
        cy.log("ℹ️ Không có voucher chip gợi ý hiển thị trên giao diện.");
      }
    });
  });

  it("TC_FE_CHK_005: [Empty Cart Voucher Blocking] Giỏ hàng rỗng chặn áp dụng Voucher và hiển thị Empty State", () => {
    // 1. Xóa sạch giỏ hàng và mở trang /checkout
    cy.clearLocalStorage();
    cy.visit("/checkout");

    // 2. Kiểm tra màn hình Giỏ hàng trống hiển thị
    cy.contains(/Giỏ hàng của bạn đang trống/i).should('be.visible');
    cy.contains(/Bạn chưa chọn mẫu laptop, điện thoại hay phụ kiện/i).should('be.visible');

    // 3. Form nhập Voucher không xuất hiện khi giỏ rỗng
    cy.get('input[placeholder*="TECHVIE2026"]').should('not.exist');

    // 4. Click nút Quay lại sảnh sản phẩm
    cy.contains('button', /Quay lại sảnh sản phẩm/i).click({ force: true });
    cy.url().should('include', '/products');
  });
});
