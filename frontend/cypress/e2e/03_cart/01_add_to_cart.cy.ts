describe("Module 3.1: Cart - Thêm vào giỏ & Quản lý Drawer giỏ hàng", () => {
  beforeEach(() => {
    // Xóa sạch giỏ hàng trong localStorage trước mỗi kịch bản test để đảm bảo tính độc lập
    cy.clearLocalStorage();
  });

  it("TC_FE_CART_001: [Add from Card] Thêm sản phẩm trực tiếp từ Card trên trang Sản phẩm", () => {
    // 1. Truy cập trang danh mục sản phẩm
    cy.visit("/products");
    cy.get('.grid .group').should('have.length.at.least', 1);

    // 2. Lấy thông tin Tên của sản phẩm đầu tiên
    cy.get('.grid .group').first().within(() => {
      cy.get('h3, h4').first().invoke('text').as('prodName');
    });

    // 3. Bấm nút Thêm vào giỏ trên Card
    cy.get('.grid .group').first().find('button.group\\/btn, button:has(svg.lucide-plus)').first().click({ force: true });

    // 4. Nếu sản phẩm có nhiều màu và mở modal, bấm Thêm vào giỏ trong modal
    cy.get('body').then(($body) => {
      if ($body.find('div[class*="z-[100]"]').length > 0) {
        cy.get('div[class*="z-[100]"]').find('button:has(svg.lucide-shopping-cart)').first().click({ force: true });
        cy.get('button[title*="Đóng"]').first().click({ force: true });
      }
    });

    // 5. Panel giỏ hàng tự động trượt ra từ bên phải
    cy.get('aside').should('be.visible');
    cy.get('aside').contains('h2', /Giỏ hàng/i).should('be.visible');

    // 6. Kiểm tra item xuất hiện trong giỏ với đúng thông tin
    cy.get('@prodName').then((name) => {
      cy.get('aside').should('contain.text', (name as any).trim());
    });
  });

  it("TC_FE_CART_002: [Header Badge Counter] Badge số lượng trên Header tự động tăng khi thêm sản phẩm", () => {
    // 1. Truy cập trang chủ
    cy.visit("/");

    // 2. Cuộn xuống khu vực sản phẩm nổi bật
    cy.contains(/SẢN PHẨM NỔI BẬT/i).scrollIntoView();
    cy.wait(500);

    // 3. Thêm sản phẩm thứ nhất vào giỏ
    cy.contains(/Góc Setup Trendy & Tiện Ích/i).parents('section').find('.group').first().find('button.group\\/btn, button:has(svg.lucide-plus)').first().click({ force: true });

    // Nếu mở modal, bấm thêm vào giỏ trong modal
    cy.get('body').then(($body) => {
      if ($body.find('div[class*="z-[100]"]').length > 0) {
        cy.get('div[class*="z-[100]"]').find('button:has(svg.lucide-shopping-cart)').first().click({ force: true });
        cy.get('button[title*="Đóng"]').first().click({ force: true });
      }
    });

    // 4. Đóng ngăn kéo giỏ hàng
    cy.get('aside button:has(svg.lucide-x), button[title*="Đóng"]').first().click({ force: true });

    // Cuộn lên đầu trang để Header hiển thị trọn vẹn
    cy.scrollTo('top');
    cy.wait(300);

    // 5. Kiểm tra Header hiển thị Badge số lượng ít nhất là 1
    cy.get('button[title*="Giỏ hàng"]').first().find('span').should('contain.text', '1');
  });

  it("TC_FE_CART_003: [Add with Color Variant] Thêm sản phẩm kèm biến thể màu sắc vào giỏ hàng", () => {
    // 1. Truy cập trang /products
    cy.visit("/products");
    cy.get('.grid .group').should('have.length.at.least', 1);

    // 2. Click vào ảnh sản phẩm để mở Modal chi tiết
    cy.get('.grid .group').first().find('img').first().click({ force: true });
    cy.get('button[title*="Đóng"]').should('be.visible');

    // 3. Chọn biến thể màu sắc thứ 2 nếu có
    cy.get('body').then(($body) => {
      const colorSection = $body.find(':contains("Chọn màu sắc:")').last().parent();
      const colorBtns = colorSection.find('button');

      if (colorBtns.length > 1) {
        const secondColor = colorBtns.eq(1);
        const colorName = secondColor.text().trim();
        cy.wrap(secondColor).click({ force: true });

        // Bấm Thêm vào giỏ
        cy.get('div[class*="z-[100]"]').find('button:has(svg.lucide-shopping-cart)').first().click({ force: true });

        // Đóng modal chi tiết
        cy.get('button[title*="Đóng"]').first().click({ force: true });

        // Mở Giỏ hàng kiểm tra Tag màu
        cy.get('button[title*="Giỏ hàng"]').first().click({ force: true });
        cy.get('aside').should('contain.text', colorName);
      } else {
        // Nếu không có nhiều màu, bấm thêm vào giỏ trực tiếp
        cy.get('div[class*="z-[100]"]').find('button:has(svg.lucide-shopping-cart)').first().click({ force: true });
        cy.get('button[title*="Đóng"]').first().click({ force: true });
      }
    });
  });

  it("TC_FE_CART_004: [Cart Drawer Close & Backdrop] Đóng giỏ hàng bằng nút X hoặc click Backdrop nền đen", () => {
    // 1. Mở trang chủ và bấm mở giỏ hàng trên Header
    cy.visit("/");
    cy.get('button[title*="Giỏ hàng"]').first().click({ force: true });

    // 2. Giỏ hàng trượt ra
    cy.get('aside').should('be.visible');

    // 3. Click nút X góc trên giỏ hàng để đóng
    cy.get('aside button:has(svg.lucide-x)').first().click({ force: true });
    cy.get('aside').should('not.exist');

    // 4. Mở lại giỏ hàng và test click vùng nền ngoài Backdrop
    cy.get('button[title*="Giỏ hàng"]').first().click({ force: true });
    cy.get('aside').should('be.visible');
    cy.get('.bg-black\\/40, .backdrop-blur-\\[6px\\]').first().click('topLeft', { force: true });
    cy.get('aside').should('not.exist');
  });

  it("TC_FE_CART_005: [Proceed to Checkout] Điều hướng từ Giỏ hàng sang trang Thanh toán Checkout", () => {
    // 1. Mở Modal và thêm 1 sản phẩm vào giỏ hàng
    cy.visit("/products");
    cy.get('.grid .group').first().find('img').first().click({ force: true });
    cy.get('div[class*="z-[100]"]').find('button:has(svg.lucide-shopping-cart)').first().click({ force: true });
    cy.get('button[title*="Đóng"]').first().click({ force: true });

    // 2. Mở Giỏ hàng
    cy.get('button[title*="Giỏ hàng"]').first().click({ force: true });
    cy.get('aside').should('be.visible');

    // 3. Bấm nút 'Thanh toán' trong panel giỏ hàng
    cy.get('aside').contains('button, a', /Thanh toán|Mua ngay|Tiến hành/i).first().click({ force: true });

    // 4. Kiểm tra chuyển hướng mượt sang /checkout và giỏ hàng tự đóng
    cy.url().should('include', '/checkout');
    cy.get('input[placeholder="Nguyễn Văn A"]').should('be.visible');
  });
});
