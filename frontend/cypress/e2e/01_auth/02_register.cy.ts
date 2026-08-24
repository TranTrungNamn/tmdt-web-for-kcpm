describe("Module 1.2: Authentication - Đăng ký (Register)", () => {
  it("TC_FE_AUTH_003: Validation Form Đăng ký - Mật khẩu dưới mức tối thiểu (BVA Min- < 6)", () => {
    cy.visit("/register");

    cy.get('input[placeholder*="Nguyễn Văn A"], input[type="text"]').first().clear().type("Nguyễn Văn Test");
    cy.get('input[type="email"]').first().clear().type("testbva_new@techvie.com");
    cy.get('input[type="password"]').eq(0).clear().type("12345");
    cy.get('input[type="password"]').eq(1).clear().type("12345");

    cy.get('button[type="submit"]').click({ force: true });
    cy.contains(/tối thiểu|6 ký tự|ít nhất 6/i, { timeout: 6000 }).should("exist");
  });

  it("TC_FE_AUTH_004: Đăng ký tài khoản mới thành công -> Tự động đăng nhập", () => {
    const randomEmail = `user_${Date.now()}@techvie.com`;
    const randomName = `TechVie Member ${Math.floor(Math.random() * 1000)}`;

    cy.visit("/register");

    cy.get('input[placeholder*="Nguyễn Văn A"], input[type="text"]').first().clear().type(randomName);
    cy.get('input[type="email"]').first().clear().type(randomEmail);
    cy.get('input[type="password"]').eq(0).clear().type("Password123@");
    cy.get('input[type="password"]').eq(1).clear().type("Password123@");

    cy.get('button[type="submit"]').click({ force: true });
    cy.url({ timeout: 10000 }).should("include", "/account");
  });
});
