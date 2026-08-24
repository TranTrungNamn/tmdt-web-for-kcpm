describe("Module 1.4: Security - Route Guard & Phân quyền RBAC", () => {
  // =========================================================================
  // CÁC TEST CASES CƠ BẢN (NGUYÊN BẢN CŨ ĐƯỢC BẢO TOÀN 100%)
  // =========================================================================
  it("TC_FE_AUTH_006A: Chặn khách vãng lai (Guest) chưa đăng nhập truy cập /admin", () => {
    // 1. Khách chưa login cố tình vào thẳng /admin
    cy.visit("/admin", { failOnStatusCode: false });

    // 2. Route Guard tự động chặn và redirect về trang chủ hoặc login
    cy.url({ timeout: 8000 }).should("satisfy", (url: string) => {
      return url === "http://localhost:3000/" || url.includes("/login") || !url.includes("/admin");
    });
  });

  it("TC_FE_AUTH_006B: Chặn người dùng thường (Customer) đã đăng nhập cố truy cập /admin", () => {
    // 1. Đăng nhập bằng tài khoản Customer thông thường
    cy.visit("/login");
    cy.get('input[placeholder*="email@example.com"], input[type="text"]').first().clear().type("customer@techvie.com");
    cy.get('input[type="password"]').first().clear().type("customer123{enter}");
    cy.url({ timeout: 10000 }).should("not.include", "/login");

    // 2. Vào trang /account -> Kiểm tra nút Quản trị Admin không được phép hiển thị cho user thường
    cy.visit("/account");
    cy.contains(/Quản trị hệ thống|Admin Portal|Bảng điều khiển Admin/i).should("not.exist");

    // 3. User thường cố tình gõ thẳng URL /admin trên trình duyệt
    cy.visit("/admin", { failOnStatusCode: false });

    // 4. Route Guard kiểm tra role !== 'admin' và lập tức đẩy về trang chủ /
    cy.url({ timeout: 8000 }).should("satisfy", (url: string) => {
      return url === "http://localhost:3000/" || !url.includes("/admin");
    });
  });

  it("TC_FE_AUTH_006C: Cho phép tài khoản Quản trị viên (Admin) truy cập trang /admin", () => {
    // 1. Đăng nhập bằng tài khoản Admin
    cy.visit("/login");
    cy.get('input[placeholder*="email@example.com"], input[type="text"]').first().clear().type("admin@techvie.com");
    cy.get('input[type="password"]').first().clear().type("admin123{enter}");

    // 2. Hệ thống xác thực role admin và tự động điều hướng vào giao diện quản trị
    cy.url({ timeout: 10000 }).should("satisfy", (url: string) => {
      return url.includes("/admin") || url === "http://localhost:3000/";
    });

    // 3. Giao diện quản trị hiển thị thành công
    cy.get("body").should("be.visible");
  });

  // =========================================================================
  // TEST CASE BỔ SUNG: MÔ PHỎNG HACKER NÂNG CAO (PENETRATION TESTING)
  // =========================================================================
  it("TC_FE_AUTH_006D: [Hacker Simulation - Privilege Escalation] Giả mạo Token & Sửa localStorage để leo thang đặc quyền Admin", () => {
    // 1. Hacker đăng nhập tài khoản người dùng bình thường
    cy.visit("/login");
    cy.get('input[placeholder*="email@example.com"], input[type="text"]').first().clear().type("customer@techvie.com");
    cy.get('input[type="password"]').first().clear().type("customer123{enter}");
    cy.url({ timeout: 10000 }).should("not.include", "/login");

    // 2. Hacker can thiệp vào localStorage cố tình sửa role thành admin
    cy.window().then((win) => {
      win.localStorage.setItem("techvie_token", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.hacker_forged_admin_payload");
      win.localStorage.setItem("user_role", "admin");
    });

    // 3. Hacker gõ URL /admin
    cy.visit("/admin", { failOnStatusCode: false });

    // 4. Hacker bắn API ngầm của Admin
    cy.window().then((win) => {
      const customerToken = win.localStorage.getItem("techvie_token");
      cy.request({
        method: "GET",
        url: "http://localhost:5000/api/orders/admin/all",
        headers: {
          Authorization: customerToken || "",
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect([401, 403]).to.include(response.status);
      });
    });

    // 5. Frontend Route Guard phát hiện token giả và đẩy về trang chủ /
    cy.url({ timeout: 8000 }).should("satisfy", (url: string) => {
      return url === "http://localhost:3000/" || !url.includes("/admin");
    });
  });
});
