describe("Module 7.1: Admin - Bảng điều khiển Quản trị (Dashboard & Sub-tabs)", () => {
  beforeEach(() => {
    // 1. Đăng nhập với tài khoản Admin trực tiếp qua UI Form (hệ thống tự redirect sang /admin)
    cy.visit("/login");
    cy.get('input[placeholder*="email@example.com"], input[type="text"]').first().clear().type("admin@techvie.com");
    cy.get('input[type="password"]').first().clear().type("admin123{enter}");
    
    // 2. Chờ ứng dụng tự động điều hướng sang /admin
    cy.url({ timeout: 10000 }).should("include", "/admin");
    cy.get("body").should("be.visible");
  });

  it("TC_FE_ADM_001A: [RBAC Admin Dashboard Access] Truy cập Dashboard với quyền Admin & Đối soát các thẻ thống kê", () => {
    // 1. Kiểm tra tiêu đề hoặc banner Admin Console trên Sidebar Desktop
    cy.get('aside h1').contains(/TECHVIE ADMIN/i).should("be.visible");

    // 2. Kiểm tra các thẻ thống kê tổng quan (Doanh thu, Đơn hàng, Tồn kho, v.v.)
    cy.get('.admin-stat-card, div:has(svg.lucide-dollar-sign)').should("have.length.at.least", 1);
  });

  it("TC_FE_ADM_001B: [Admin Sub-tab Navigation] Chuyển đổi linh hoạt qua toàn bộ 10 phân hệ trên Admin Sidebar", () => {
    // 1. Nhóm Báo cáo & Thống kê
    cy.contains("button", /Tổng quan/i).click({ force: true });
    cy.url().should("include", "/admin/overview");

    // 2. Nhóm Cửa hàng & Kho hàng
    cy.contains("button", /Danh mục SP/i).click({ force: true });
    cy.url().should("include", "/admin/categories");

    cy.contains("button", /Sản phẩm/i).click({ force: true });
    cy.url().should("include", "/admin/products");

    cy.contains("button", /Kho hàng/i).click({ force: true });
    cy.url().should("include", "/admin/stock");

    cy.contains("button", /Đơn hàng/i).click({ force: true });
    cy.url().should("include", "/admin/orders");

    cy.contains("button", /Thanh toán/i).click({ force: true });
    cy.url().should("include", "/admin/payments");

    // 3. Nhóm Chăm sóc & Chiến dịch
    cy.contains("button", /Phản hồi KH/i).click({ force: true });
    cy.url().should("include", "/admin/messages");

    cy.contains("button", /Khuyến mãi/i).click({ force: true });
    cy.url().should("include", "/admin/promos");

    cy.contains("button", /Đánh giá SP/i).click({ force: true });
    cy.url().should("include", "/admin/reviews");

    // 4. Nhóm Hệ thống
    cy.contains("button", /Thành viên/i).click({ force: true });
    cy.url().should("include", "/admin/users");

    // 5. Quay về Tổng quan
    cy.contains("button", /Tổng quan/i).click({ force: true });
    cy.url().should("include", "/admin/overview");

    // 6. Kiểm tra nút Điều hướng quay về Trang chủ TechVie ở chân Sidebar
    cy.contains("button", /Trang chủ TechVie/i).should("be.visible");
  });

  it("TC_FE_ADM_001C: [Dark/Light Mode Theme Toggle] Chuyển đổi giao diện Sáng / Tối trong Admin", () => {
    // 1. Tìm nút chuyển đổi Dark Mode (Sun/Moon icon button trên sidebar)
    cy.get('button[title*="chế độ"]').first().then(($btn) => {
      if ($btn.length > 0) {
        cy.wrap($btn).click({ force: true });
        cy.wait(300);
        cy.wrap($btn).click({ force: true });
        cy.wait(300);
        cy.wrap($btn).click({ force: true });
      }
    });
  });
});



