describe("Module 1.1: Authentication - Đăng nhập (Login)", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("TC_FE_AUTH_001A: Đăng nhập bằng cách Click nút 'ĐĂNG NHẬP NGAY'", () => {
    // 1. Click icon User trên Header để vào /login
    cy.get('a[title="Tài khoản TechVie ID"]').first().click({ force: true });
    cy.url().should("include", "/login");

    // 2. Nhập thông tin tài khoản hợp lệ
    cy.get('input[placeholder*="email@example.com"], input[type="text"]').first().clear().type("customer@techvie.com");
    cy.get('input[type="password"]').first().clear().type("customer123");

    // 3. Thao tác Click trực tiếp vào nút Submit
    cy.get('button[type="submit"]').click({ force: true, scrollBehavior: false });

    // 4. Xác nhận chuyển hướng thành công
    cy.url({ timeout: 10000 }).should("not.include", "/login");
  });

  it("TC_FE_AUTH_001B: Đăng nhập bằng phím {Enter} trên bàn phím (Keyboard Accessibility)", () => {
    cy.visit("/login");

    // 1. Nhập email
    cy.get('input[placeholder*="email@example.com"], input[type="text"]').first().clear().type("customer@techvie.com");

    // 2. Nhập password và nhấn phím Enter ngay trên ô input
    cy.get('input[type="password"]').first().clear().type("customer123{enter}");

    // 3. Hệ thống tự động submit form và chuyển hướng thành công
    cy.url({ timeout: 10000 }).should("not.include", "/login");
  });

  it("TC_FE_AUTH_001C: Mở Login bằng cách Hover vào icon User -> Hiện Popup Mini -> Click Đăng Nhập", () => {
    // 1. Rê chuột (Hover) vào vùng icon User để kích hoạt popup mini
    cy.get('a[title="Tài khoản TechVie ID"]').first().trigger("mouseover").parent().trigger("mouseenter");

    // 2. Click vào nút "ĐĂNG NHẬP" xuất hiện trong Popup Mini
    cy.contains("a", /Đăng Nhập/i).click({ force: true });
    cy.url().should("include", "/login");

    // 3. Nhập thông tin và Đăng nhập
    cy.get('input[placeholder*="email@example.com"], input[type="text"]').first().clear().type("customer@techvie.com");
    cy.get('input[type="password"]').first().clear().type("customer123{enter}");

    // 4. Chuyển hướng thành công
    cy.url({ timeout: 10000 }).should("not.include", "/login");
  });

  it("TC_FE_AUTH_001D: Kiểm tra nút bấm Đăng nhập bằng Google (Social Login UI & Trigger)", () => {
    cy.visit("/login");

    // Xác nhận nút Google hiển thị trên form và có thể click được
    cy.contains("button", /Google/i).should("be.visible").click({ force: true });
  });

  it("TC_FE_AUTH_001E: Điều hướng quay về Trang Chủ từ trang Đăng nhập (Back to Home Navigation)", () => {
    cy.visit("/login");

    // Click vào nút "Trở lại Trang chủ"
    cy.contains(/Trở lại Trang chủ|Trang chủ/i).click({ force: true });

    // Xác nhận đã chuyển hướng về trang chủ
    cy.url({ timeout: 8000 }).should("satisfy", (url: string) => {
      return url === "http://localhost:3000/" || !url.includes("/login");
    });
  });

  it("TC_FE_AUTH_001F: Kiểm tra tương tác Checkbox 'Ghi nhớ tôi' (Remember Me)", () => {
    cy.visit("/login");

    // 1. Xác nhận mặc định checkbox đã được tích sẵn
    cy.get('input[type="checkbox"]').should("be.checked");

    // 2. Click bỏ chọn -> Trạng thái đổi thành not.checked
    cy.get('input[type="checkbox"]').uncheck({ force: true }).should("not.be.checked");

    // 3. Click chọn lại -> Trạng thái đổi thành checked
    cy.get('input[type="checkbox"]').check({ force: true }).should("be.checked");
  });

  it("TC_FE_AUTH_001G: Toggle Ẩn / Hiện mật khẩu bằng icon con mắt", () => {
    cy.visit("/login");

    // 1. Nhập mật khẩu (Mặc định type="password")
    cy.get('input[type="password"]').first().type("SecretPassword123@");

    // 2. Click icon con mắt -> Đổi sang type="text"
    cy.get('button[type="button"]').find('svg').first().parent().click({ force: true });
    cy.get('input[value="SecretPassword123@"]').should("have.attr", "type", "text");

    // 3. Click lại -> Ẩn mật khẩu (trở về type="password")
    cy.get('button[type="button"]').find('svg').first().parent().click({ force: true });
    cy.get('input[value="SecretPassword123@"]').should("have.attr", "type", "password");
  });

  it("TC_FE_AUTH_001H: Chuyển hướng sang giao diện Quên mật khẩu", () => {
    cy.visit("/login");

    // Click vào link "Quên mật khẩu?"
    cy.contains(/Quên mật khẩu/i).click({ force: true });

    // Xác nhận giao diện Quên mật khẩu xuất hiện
    cy.contains(/Khôi phục|Đặt lại|Email/i, { timeout: 8000 }).should("exist");
  });

  it("TC_FE_AUTH_002: Đăng nhập thất bại khi sai mật khẩu -> Hiển thị cảnh báo", () => {
    cy.visit("/login");

    // 1. Nhập email đúng nhưng mật khẩu sai
    cy.get('input[placeholder*="email@example.com"], input[type="text"]').first().clear().type("customer@techvie.com");
    cy.get('input[type="password"]').first().clear().type("WrongPassword999@{enter}");

    // 2. Hiển thị thông báo lỗi và vẫn ở trang login
    cy.contains(/Sai thông tin|không chính xác|Lỗi/i, { timeout: 8000 }).should("exist");
    cy.url().should("include", "/login");
  });
});
