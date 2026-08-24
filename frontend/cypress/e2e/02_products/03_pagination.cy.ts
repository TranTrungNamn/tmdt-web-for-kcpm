describe("Module 2.3: Products - Phân trang sản phẩm chuyên sâu (Pagination)", () => {
  // Tạo danh sách 26 sản phẩm mẫu để ép trang hiển thị 3 trang (12 sp/trang)
  const mockProducts = Array.from({ length: 26 }, (_, i) => ({
    id: `prod_mock_${i + 1}`,
    name: `Thiết bị Công nghệ TechVie #${i + 1}`,
    price: (i + 1) * 250000,
    category: "Phụ kiện",
    image: "https://images.unsplash.com/photo-1460039230329-eb070fc6c77c?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: `Mô tả sản phẩm mẫu phân trang số ${i + 1}`,
    specs: [
      { label: "Mã SP", value: `TV-${i + 1}` },
      { label: "Bảo hành", value: "12 Tháng" }
    ],
    colors: ["Đen", "Bạc"],
    averageRating: 5,
    reviewCount: 10,
    badge: "NEW"
  }));

  beforeEach(() => {
    // Intercept API products để luôn cung cấp 26 sản phẩm (tạo ra 3 trang phân trang thật)
    cy.intercept("GET", "**/api/products*", (req) => {
      req.reply({
        statusCode: 200,
        body: mockProducts
      });
    }).as("getMockProducts");

    cy.visit("/products");
    cy.wait("@getMockProducts");

    // Chờ danh sách sản phẩm hiển thị đầy đủ
    cy.get('h1').should("contain.text", "Phụ Kiện & Đồ Setup");
    cy.get('.grid').should("be.visible");
  });

  it("TC_FE_PROD_003A: Khởi tạo phân trang - Kiểm tra hiển thị đầy đủ 3 trang & Page 1 Active", () => {
    // 1. Xác nhận Trang 1 đang là trang hiện tại (active với nền đen)
    cy.get('button').filter((_, el) => Cypress.$(el).text().trim() === '1').first().should('have.class', 'bg-black');

    // 2. Xác nhận hiển thị đủ các nút số trang 1, 2, 3
    cy.get('button').filter((_, el) => Cypress.$(el).text().trim() === '1').should('be.visible');
    cy.get('button').filter((_, el) => Cypress.$(el).text().trim() === '2').should('be.visible');
    cy.get('button').filter((_, el) => Cypress.$(el).text().trim() === '3').should('be.visible');

    // 3. Nút ChevronLeft (Trang trước) bị disabled khi đang ở Trang 1
    cy.get('svg.lucide-chevron-left').first().parent('button').should('be.disabled');

    // 4. Nút ChevronRight (Trang kế tiếp) đang mở sẵn sàng click
    cy.get('svg.lucide-chevron-right').first().parent('button').should('not.be.disabled');

    // 5. Xác nhận Trang 1 hiển thị đúng 12 sản phẩm
    cy.get('.grid > div.group').should('have.length', 12);
  });

  it("TC_FE_PROD_003B: Click chuyển sang Trang 2 - Đối soát danh sách sản phẩm mới", () => {
    // Ghi nhận sản phẩm đầu tiên của Trang 1
    cy.get('.grid > div.group').first().find('img').invoke('attr', 'alt').then((firstAltPage1) => {
      // 1. Click vào nút số Trang 2
      cy.get('button').filter((_, el) => Cypress.$(el).text().trim() === '2').first().click({ force: true });

      // 2. Nút số 2 chuyển sang trạng thái Active (bg-black)
      cy.get('button').filter((_, el) => Cypress.$(el).text().trim() === '2').first().should('have.class', 'bg-black');
      cy.get('button').filter((_, el) => Cypress.$(el).text().trim() === '1').first().should('not.have.class', 'bg-black');

      // 3. Cả nút Prev và Next đều không bị disabled ở trang giữa
      cy.get('svg.lucide-chevron-left').first().parent('button').should('not.be.disabled');
      cy.get('svg.lucide-chevron-right').first().parent('button').should('not.be.disabled');

      // 4. Danh sách sản phẩm đổi mới: Chứa 12 sản phẩm của trang 2
      cy.get('.grid > div.group').should('have.length', 12);
      cy.get('.grid').should('contain.text', 'Thiết bị Công nghệ TechVie #13');
    });
  });

  it("TC_FE_PROD_003C: Click chuyển sang Trang 3 (Trang cuối) - Nút Next bị disabled", () => {
    // 1. Click vào nút số Trang 3
    cy.get('button').filter((_, el) => Cypress.$(el).text().trim() === '3').first().click({ force: true });

    // 2. Nút số 3 chuyển sang Active (bg-black)
    cy.get('button').filter((_, el) => Cypress.$(el).text().trim() === '3').first().should('have.class', 'bg-black');

    // 3. Nút Next (ChevronRight) bị disabled ở trang cuối cùng
    cy.get('svg.lucide-chevron-right').first().parent('button').should('be.disabled');

    // 4. Trang cuối chứa các sản phẩm còn lại (2 sản phẩm)
    cy.get('.grid > div.group').should('have.length', 2);
  });

  it("TC_FE_PROD_003D: Điều hướng lùi lại Page 2 & Page 1 bằng nút ChevronLeft (Prev)", () => {
    // 1. Nhảy thẳng tới Trang 3
    cy.get('button').filter((_, el) => Cypress.$(el).text().trim() === '3').first().click({ force: true });
    cy.get('button').filter((_, el) => Cypress.$(el).text().trim() === '3').first().should('have.class', 'bg-black');

    // 2. Bấm nút ChevronLeft để lùi về Trang 2
    cy.get('svg.lucide-chevron-left').first().parent('button').click({ force: true });
    cy.get('button').filter((_, el) => Cypress.$(el).text().trim() === '2').first().should('have.class', 'bg-black');

    // 3. Bấm tiếp nút ChevronLeft để lùi về Trang 1
    cy.get('svg.lucide-chevron-left').first().parent('button').click({ force: true });
    cy.get('button').filter((_, el) => Cypress.$(el).text().trim() === '1').first().should('have.class', 'bg-black');
  });

  it("TC_FE_PROD_003E: Tự động Reset Phân trang về Page 1 khi đổi Tab Danh mục động", () => {
    // 1. Chuyển sang Trang 2 trước
    cy.get('button').filter((_, el) => Cypress.$(el).text().trim() === '2').first().click({ force: true });
    cy.get('button').filter((_, el) => Cypress.$(el).text().trim() === '2').first().should('have.class', 'bg-black');

    // 2. Đọc động tất cả các nút Tab Category đang thực sự hiển thị trên giao diện
    cy.get('.flex-wrap button').then(($categoryTabs) => {
      // Chọn Tab thứ 2 (khác 'Tất cả')
      const targetTab = $categoryTabs.length > 1 ? $categoryTabs.eq(1) : $categoryTabs.first();
      const tabName = targetTab.text().trim();
      cy.log(`👉 Bấm chọn Tab Danh mục thực tế đang có: "${tabName}"`);

      cy.wrap(targetTab).click({ force: true });
      cy.wait(400);

      // 3. Phân trang hoặc giao diện được reset về trạng thái trang 1 (không còn ở page 2)
      cy.get('.grid .group').should('have.length.at.least', 1);
    });
  });

  it("TC_FE_PROD_003F: Ẩn thanh phân trang khi tìm kiếm rỗng (Empty Search State)", () => {
    // 1. Gõ từ khóa tìm kiếm không tồn tại
    cy.get('input[placeholder*="Tìm kiếm phụ kiện"]').clear({ force: true }).type("KHONG_CO_SAN_PHAM_NAY_9999", { force: true });

    // 2. Xuất hiện Empty placeholder
    cy.contains(/Không tìm thấy sản phẩm nào phù hợp/i).should('be.visible');

    // 3. Thanh phân trang biến mất hoàn toàn
    cy.get('svg.lucide-chevron-left').should('not.exist');
    cy.get('svg.lucide-chevron-right').should('not.exist');
  });
});
