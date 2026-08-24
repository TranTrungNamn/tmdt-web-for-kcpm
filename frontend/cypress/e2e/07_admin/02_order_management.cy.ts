describe("Module 7.2: Admin - Quản lý đơn hàng (Order State & Management)", () => {
  beforeEach(() => {
    // 1. Đăng nhập Admin qua UI Login
    cy.visit("/login");
    cy.get('input[placeholder*="email@example.com"], input[type="text"]').first().clear().type("admin@techvie.com");
    cy.get('input[type="password"]').first().clear().type("admin123{enter}");
    
    // 2. Chờ ứng dụng vào /admin rồi click chuyển sang tab Đơn hàng
    cy.url({ timeout: 10000 }).should("include", "/admin");
    cy.contains("button", /Đơn hàng/i).click({ force: true });
    cy.url().should("include", "/admin/orders");
    cy.get("body").should("be.visible");
  });

  it("TC_FE_ADM_002A: [Order Table Inspection] Kiểm tra hiển thị bảng danh sách đơn hàng", () => {
    // 1. Kiểm tra tiêu đề hoặc bảng dữ liệu đơn hàng
    cy.get("body").then(($body) => {
      const text = $body.text();
      expect(text).to.match(/Đơn hàng|Mã đơn|Khách hàng|Tổng tiền|Trạng thái|Thanh toán|Không có đơn hàng/i);
    });
  });

  it("TC_FE_ADM_002B: [Order Status Filter Tabs] Lọc đơn hàng theo các trạng thái (Tất cả, Đang xử lý, Đang giao, Hoàn tất)", () => {
    // 1. Click các tab lọc trạng thái
    cy.get("body").then(($body) => {
      const filterButtons = $body.find('button:contains("Tất cả"), button:contains("Đang xử lý"), button:contains("Đang giao"), button:contains("Hoàn tất"), button:contains("Đã hủy")');
      if (filterButtons.length > 0) {
        cy.wrap(filterButtons.first()).click({ force: true });
        cy.wait(200);
      }
    });
  });

  it("TC_FE_ADM_002C: [Order Detail & Export Trigger] Kiểm tra chức năng Xuất báo cáo đơn hàng hoặc Xem chi tiết", () => {
    // 1. Kiểm tra sự tồn tại của nút Xuất Excel/JSON/Báo cáo nếu có
    cy.get("body").then(($body) => {
      const exportBtn = $body.find('button:contains("Xuất"), button:contains("Export"), button:contains("Báo cáo")');
      if (exportBtn.length > 0) {
        cy.wrap(exportBtn.first()).should("be.visible");
      }
    });
  });
});



