describe("Module 2.4: Products - Chi tiết sản phẩm (Product Detail) & Điều hướng Header", () => {
  it("TC_FE_PROD_004A: [Home Page & Click Outside] Mở Product Detail từ Home & Thoát bằng cách click ra ngoài Backdrop", () => {
    // 1. Truy cập Trang chủ Home
    cy.visit("/");
    cy.get('header').should('be.visible');

    // 2. Cuộn xuống khu vực 'SẢN PHẨM NỔI BẬT' trên Home
    cy.contains(/SẢN PHẨM NỔI BẬT/i).scrollIntoView();
    cy.wait(600);

    // 3. Click vào Card sản phẩm đầu tiên được treo trên Home
    cy.contains(/Góc Setup Trendy & Tiện Ích/i).parents('section').find('.group').first().click({ force: true });

    // 4. Modal chi tiết sản phẩm hiển thị nổi bật trên Home
    cy.get('button[title*="Đóng"]').should('be.visible');
    cy.contains('button', /Thêm vào giỏ|MUA NGAY/i).should('be.visible');

    // 5. [CLICK OUTSIDE TEST] Click vào vùng nền đen mờ ngoài Backdrop để đóng Modal
    cy.get('.animate-fade-in, .bg-black\\/50').first().click('topLeft', { force: true });
    cy.wait(400);

    // 6. Modal biến mất hoàn toàn
    cy.get('button[title*="Đóng"]').should('not.exist');
  });

  it("TC_FE_PROD_004B: [Header Navigation] Điều hướng sang trang Sản phẩm bằng Header Link", () => {
    // 1. Bắt đầu từ Trang chủ
    cy.visit("/");

    // 2. Click vào mục 'SẢN PHẨM' trên thanh Header
    cy.get('header nav, header').contains('button, a', /Sản phẩm/i).first().click({ force: true });

    // 3. Kiểm tra URL chuyển hướng sang /products
    cy.url().should('include', '/products');

    // 4. Trang danh mục sản phẩm hiển thị đầy đủ tiêu đề và lưới sản phẩm
    cy.get('h1').should('contain.text', 'Phụ Kiện & Đồ Setup');
    cy.get('.grid').should('be.visible');
  });

  it("TC_FE_PROD_004C: [Products Page & Button Close] Mở Modal trên /products, Chọn biến thể Màu & Đóng bằng nút X", () => {
    // 1. Truy cập trang /products
    cy.visit("/products");
    cy.get('.grid .group').should('have.length.at.least', 1);

    // 2. Click vào ảnh của 1 sản phẩm trên trang
    cy.get('.grid .group').first().find('img').first().click({ force: true });

    // 3. Modal chi tiết sản phẩm hiển thị
    cy.get('button[title*="Đóng"]').should('be.visible');
    cy.contains('button', /Thêm vào giỏ|MUA NGAY/i).should('be.visible');

    // 4. Nếu sản phẩm có nhiều màu, click chọn biến thể màu sắc khác trong khu vực "Chọn màu sắc"
    cy.get('body').then(($body) => {
      const colorSection = $body.find(':contains("Chọn màu sắc:")').last().parent();
      const colorBtns = colorSection.find('button');

      if (colorBtns.length > 1) {
        const secondColor = colorBtns.eq(1);
        const secondColorName = secondColor.text().trim();
        cy.log(`🎨 Chọn màu thứ hai: "${secondColorName}"`);

        cy.wrap(secondColor).click({ force: true });
        cy.wrap(secondColor).should('have.class', 'bg-black');
      }
    });

    // 5. Đóng modal bằng Nút Floating Close (X)
    cy.get('button[title*="Đóng"]').click({ force: true });
    cy.get('button[title*="Đóng"]').should('not.exist');
  });

  it("TC_FE_PROD_004D: [Lightbox Zoom] Phóng to ảnh sản phẩm và thoát Lightbox bằng Escape", () => {
    cy.visit("/products");
    cy.get('.grid .group').should('have.length.at.least', 1);
    cy.get('.grid .group').first().find('img').first().click({ force: true });
    cy.get('button[title*="Đóng"]').should('be.visible');

    // Click vào ảnh trong modal để mở chế độ phóng to Lightbox
    cy.get('body').find('div.cursor-zoom-in img').eq(0).then(($img) => {
      cy.wrap($img).click({ force: true });
    });
    cy.wait(400);

    // Thoát phóng to bằng phím Escape
    cy.get('body').type('{esc}');

    // Đóng modal chi tiết
    cy.get('button[title*="Đóng"]').click({ force: true });
    cy.get('button[title*="Đóng"]').should('not.exist');
  });

  it("TC_FE_PROD_004E: [Add to Cart from Modal] Thêm sản phẩm vào giỏ hàng trực tiếp từ Modal Chi tiết", () => {
    cy.visit("/products");
    cy.get('.grid .group').should('have.length.at.least', 1);
    cy.get('.grid .group').first().find('img').first().click({ force: true });
    cy.get('button[title*="Đóng"]').should('be.visible');

    // Bấm nút 'Thêm vào giỏ' (icon ShoppingCart)
    cy.get('div[class*="z-[100]"]').find('button:has(svg.lucide-shopping-cart)').first().click({ force: true });

    // Đóng modal chi tiết
    cy.get('button[title*="Đóng"]').click({ force: true });
    cy.get('button[title*="Đóng"]').should('not.exist');

    // Đóng ngăn kéo giỏ hàng nếu đang mở
    cy.get('body').then(($body) => {
      const closeCartBtn = $body.find('button[title*="Đóng giỏ"], button:has(svg.lucide-x)');
      if (closeCartBtn.length > 0) {
        cy.wrap(closeCartBtn.first()).click({ force: true });
      }
    });

    // Sau khi đóng modal và giỏ hàng, Header hiển thị rõ ràng
    cy.get('h1').should('contain.text', 'Phụ Kiện & Đồ Setup');
  });

  it("TC_FE_PROD_004F: [Buy Now Flow] Bấm 'MUA NGAY' trong Modal -> Chuyển thẳng sang Checkout và Không bị giỏ hàng đè lên Form", () => {
    // 1. Mở trang sản phẩm và click vào sản phẩm đầu tiên
    cy.visit("/products");
    cy.get('.grid .group').should('have.length.at.least', 1);
    cy.get('.grid .group').first().find('img').first().click({ force: true });

    // 2. Chờ Modal hiển thị
    cy.get('button[title*="Đóng"]').should('be.visible');

    // 3. Click nút 'MUA NGAY'
    cy.contains('button', /MUA NGAY/i).click({ force: true });

    // 4. Kiểm tra URL chuyển thẳng sang trang /checkout
    cy.url().should('include', '/checkout');

    // 5. Kiểm tra Form thanh toán hiển thị rõ ràng và KHÔNG bị Side Panel giỏ hàng che khuất
    cy.contains(/Thông Tin Khách Hàng Giao Nhận|Phương Thức Thanh Toán/i).should('be.visible');
    cy.get('input[placeholder="Nguyễn Văn A"]').should('be.visible');
    cy.get('input[placeholder="0912 345 678"]').should('be.visible');
  });
});
