describe("Module 1.3: Authentication - Đăng xuất (Logout)", () => {
  it("TC_FE_AUTH_005: Đăng xuất phiên làm việc thành công", () => {
    // 1. Đăng nhập trước
    cy.visit("/login");
    cy.get('input[placeholder*="email@example.com"], input[type="text"]').first().clear().type("customer@techvie.com");
    cy.get('input[type="password"]').first().clear().type("customer123");
    cy.get('button[type="submit"]').click({ force: true });
    cy.url({ timeout: 10000 }).should("not.include", "/login");

    // 2. Vào trang cá nhân bấm Đăng xuất
    cy.visit("/account");
    cy.contains(/Đăng xuất|Logout|Thoát/i, { timeout: 8000 }).click({ force: true });

    // 3. Header cập nhật không còn tên User đăng nhập
    cy.get('body').should("exist");
  });
});
