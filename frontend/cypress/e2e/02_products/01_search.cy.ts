describe("Module 2.1: Products - Tìm kiếm thời gian thực (Live Search Panel)", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("TC_FE_PROD_001A: Tìm kiếm từ khóa cố định ('Laptop') với Debounce 300ms", () => {
    // 1. Mở Search Side Panel từ Header
    cy.get('button[title="Tìm kiếm thiết bị"]').first().click({ force: true });

    // 2. Nhập từ khóa
    cy.get('aside input[type="text"]').first().clear().type("Laptop", { force: true });

    // 3. Chờ debounce 300ms và xác nhận có sản phẩm khớp từ khóa
    cy.wait(600);
    cy.get('body').should("contain.text", "Laptop");
  });

  it("TC_FE_PROD_001B: [Dynamic Random Data-Driven] Kéo toàn bộ sản phẩm từ DB và bốc ngẫu nhiên 1 tên để tìm kiếm", () => {
    // 1. Gửi request lấy toàn bộ danh sách sản phẩm thực tế từ Database
    cy.request("http://localhost:5000/api/products").then((res) => {
      expect(res.status).to.eq(200);
      const productList = Array.isArray(res.body) ? res.body : (res.body.products || []);
      expect(productList.length).to.be.greaterThan(0);

      // 2. Bốc ngẫu nhiên một sản phẩm trong danh sách
      const randomIndex = Math.floor(Math.random() * productList.length);
      const randomProduct = productList[randomIndex];
      const randomProductName = randomProduct.name || randomProduct.title;
      
      // Lấy từ khóa chính (2 từ đầu tiên để tìm kiếm bao quát)
      const searchKeyword = randomProductName.split(" ").slice(0, 2).join(" ");
      cy.log(`🎲 Bốc ngẫu nhiên sản phẩm: "${randomProductName}" -> Từ khóa tìm kiếm: "${searchKeyword}"`);

      // 3. Mở panel tìm kiếm và nhập từ khóa ngẫu nhiên
      cy.get('button[title="Tìm kiếm thiết bị"]').first().click({ force: true });
      cy.get('aside input[type="text"]').first().clear().type(searchKeyword, { force: true });

      // 4. Chờ debounce và xác nhận kết quả tìm kiếm hiển thị sản phẩm đó
      cy.wait(700);
      cy.get('aside').should("contain.text", searchKeyword);
    });
  });

  it("TC_FE_PROD_001C: Tìm kiếm từ khóa không tồn tại (Negative Search Case)", () => {
    // 1. Mở Search Side Panel
    cy.get('button[title="Tìm kiếm thiết bị"]').first().click({ force: true });

    // 2. Nhập từ khóa vô nghĩa / không tồn tại
    cy.get('aside input[type="text"]').first().clear().type("XYZ_NON_EXISTENT_PRODUCT_9999", { force: true });
    cy.wait(600);

    // 3. Xác nhận hiển thị thông báo không tìm thấy kết quả
    cy.get('aside').should("contain.text", "Không tìm thấy");
  });

  it("TC_FE_PROD_001D: Tương tác nhanh với mục 'Tìm kiếm phổ biến'", () => {
    // 1. Mở Search Side Panel khi chưa nhập từ khóa nào
    cy.get('button[title="Tìm kiếm thiết bị"]').first().click({ force: true });

    // 2. Xác nhận mục 'Tìm kiếm phổ biến' xuất hiện
    cy.contains(/Tìm kiếm phổ biến/i).should("be.visible");

    // 3. Click vào 1 gợi ý bất kỳ trong danh sách "Tìm kiếm phổ biến"
    cy.get('aside section').first().find('button').first().then(($btn) => {
      const keyword = $btn.text().trim();
      cy.wrap($btn).click({ force: true });

      // 4. Ô tìm kiếm tự động được điền từ khóa đó
      cy.get('aside input[type="text"]').should("have.value", keyword);
    });
  });

  it("TC_FE_PROD_001E: [User Isolation Test] Cô lập Lịch sử tìm kiếm riêng biệt giữa 2 tài khoản khác nhau", () => {
    // -----------------------------------------------------------------------
    // BƯỚC 1: Tài khoản A (Customer) đăng nhập và tìm kiếm từ khóa "BanPhimCo"
    // -----------------------------------------------------------------------
    cy.visit("/login");
    cy.get('input[placeholder*="email@example.com"], input[type="text"]').first().clear().type("customer@techvie.com");
    cy.get('input[type="password"]').first().clear().type("customer123{enter}");
    cy.url({ timeout: 10000 }).should("not.include", "/login");

    // Mở search panel và thực hiện tìm kiếm từ khóa riêng của A
    cy.get('button[title="Tìm kiếm thiết bị"]').first().click({ force: true });
    cy.get('aside input[type="text"]').first().clear().type("BanPhimCo{enter}", { force: true });
    cy.wait(600);

    // Đóng search panel và đăng xuất tài khoản A
    cy.get('aside button').find('svg.lucide-x').first().parent().click({ force: true });
    cy.visit("/account");
    cy.contains(/Đăng xuất/i).click({ force: true });

    // -----------------------------------------------------------------------
    // BƯỚC 2: Tài khoản B (FRAUTH04_ActiveUser) đăng nhập vào hệ thống
    // -----------------------------------------------------------------------
    cy.visit("/login");
    cy.get('input[placeholder*="email@example.com"], input[type="text"]').first().clear().type("frauth04_active@techvie.vn");
    cy.get('input[type="password"]').first().clear().type("Password123@{enter}");
    cy.url({ timeout: 10000 }).should("not.include", "/login");

    // -----------------------------------------------------------------------
    // BƯỚC 3: Kiểm tra tính Cô lập Dữ liệu (Data Isolation & Privacy)
    // -----------------------------------------------------------------------
    // Mở search panel của tài khoản B
    cy.get('button[title="Tìm kiếm thiết bị"]').first().click({ force: true });
    cy.contains(/Lịch sử tìm kiếm/i).should("be.visible");

    // Khẳng định: Lịch sử tìm kiếm của B KHÔNG ĐƯỢC CHỨA từ khóa "BanPhimCo" của tài khoản A
    cy.get('aside').should("not.contain.text", "BanPhimCo");
  });

  it("TC_FE_PROD_001F: Đóng Search Side Panel bằng nút 'X'", () => {
    // 1. Mở Search Panel
    cy.get('button[title="Tìm kiếm thiết bị"]').first().click({ force: true });
    cy.get('aside').should("be.visible");

    // 2. Click nút đóng (icon X)
    cy.get('aside button').find('svg.lucide-x').first().parent().click({ force: true });

    // 3. Panel đóng lại thành công
    cy.get('aside').should("not.exist");
  });
});
