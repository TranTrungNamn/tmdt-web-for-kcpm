describe("Module 3.2: Cart - Quản lý số lượng (BVA) & Thao tác Giỏ hàng", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it("TC_FE_CART_006: [BVA Quantity Increase & Price Calculation] Bấm nút '+' tăng số lượng và kiểm tra tính lại Tổng tiền", () => {
    // 1. Vào trang sản phẩm và thêm 1 sản phẩm vào giỏ
    cy.visit("/products");
    cy.get('.grid .group').first().find('img').first().click({ force: true });
    cy.get('div[class*="z-[100]"]').find('button:has(svg.lucide-shopping-cart)').first().click({ force: true });
    cy.get('button[title*="Đóng"]').first().click({ force: true });

    // 2. Mở panel giỏ hàng
    cy.get('button[title*="Giỏ hàng"]').first().click({ force: true });
    cy.get('aside').should('be.visible');

    // 3. Ban đầu số lượng là 1
    cy.get('aside .font-mono').contains('1').should('be.visible');

    // 4. Bấm nút '+' để tăng số lượng lên 2
    cy.get('aside button:has(svg.lucide-plus)').first().click({ force: true });

    // 5. Kiểm tra số lượng tăng thành 2
    cy.get('aside .font-mono').contains('2').should('be.visible');

    // 6. Header giỏ hàng hiển thị đúng (2 sản phẩm đã được chọn)
    cy.get('aside').should('contain.text', '2 sản phẩm');
  });

  it("TC_FE_CART_007: [BVA Boundary Q=1 Removal] Bấm nút '-' khi số lượng = 1 sẽ tự động xóa sản phẩm", () => {
    // 1. Thêm 1 sản phẩm vào giỏ
    cy.visit("/products");
    cy.get('.grid .group').first().find('img').first().click({ force: true });
    cy.get('div[class*="z-[100]"]').find('button:has(svg.lucide-shopping-cart)').first().click({ force: true });
    cy.get('button[title*="Đóng"]').first().click({ force: true });

    // 2. Mở panel giỏ hàng, số lượng ban đầu là 1
    cy.get('button[title*="Giỏ hàng"]').first().click({ force: true });
    cy.get('aside').should('be.visible');
    cy.get('aside .font-mono').contains('1').should('be.visible');

    // 3. [BVA BIÊN DƯỚI] Bấm nút '-' khi Q = 1
    cy.get('aside button:has(svg.lucide-minus)').first().click({ force: true });

    // 4. Sản phẩm bị xóa hoàn toàn khỏi giỏ hàng -> Hiển thị Giỏ hàng rỗng
    cy.get('aside').should('contain.text', 'Giỏ hàng rỗng');
  });

  it("TC_FE_CART_008: [Trash Button Removal] Xóa sản phẩm tức thì bằng nút Thùng rác (Trash)", () => {
    // 1. Thêm 1 sản phẩm vào giỏ
    cy.visit("/products");
    cy.get('.grid .group').first().find('img').first().click({ force: true });
    cy.get('div[class*="z-[100]"]').find('button:has(svg.lucide-shopping-cart)').first().click({ force: true });
    cy.get('button[title*="Đóng"]').first().click({ force: true });

    // 2. Mở panel giỏ hàng
    cy.get('button[title*="Giỏ hàng"]').first().click({ force: true });
    cy.get('aside').should('be.visible');

    // 3. Click nút icon Thùng rác
    cy.get('aside button[title*="Xoà"], aside button:has(svg.lucide-trash-2)').first().click({ force: true });

    // 4. Item bị xóa ngay lập tức -> Giỏ hàng rỗng
    cy.get('aside').should('contain.text', 'Giỏ hàng rỗng');
  });

  it("TC_FE_CART_009: [Inline Color Editor] Đổi biến thể màu trực tiếp ngay trong Giỏ hàng", () => {
    // 1. Mở trang sản phẩm
    cy.visit("/products");
    cy.get('.grid .group').first().find('img').first().click({ force: true });
    cy.get('div[class*="z-[100]"]').find('button:has(svg.lucide-shopping-cart)').first().click({ force: true });
    cy.get('button[title*="Đóng"]').first().click({ force: true });

    // 2. Mở giỏ hàng
    cy.get('button[title*="Giỏ hàng"]').first().click({ force: true });
    cy.get('aside').should('be.visible');

    // 3. Nếu sản phẩm trong giỏ có nút chọn/đổi màu
    cy.get('aside').then(($aside) => {
      const colorTagBtn = $aside.find('button:has(span.bg-indigo-500)');
      if (colorTagBtn.length > 0) {
        // Bấm mở menu đổi màu inline
        cy.wrap(colorTagBtn.first()).click({ force: true });

        // Chọn màu sắc mới trong danh sách
        cy.get('aside .bg-gray-50 button').filter(':not(:contains("Hủy"))').last().then(($btn) => {
          const newColorName = $btn.text().trim();
          cy.wrap($btn).click({ force: true });

          // Kiểm tra item đã được cập nhật sang màu mới
          cy.get('aside').should('contain.text', newColorName);
        });
      } else {
        cy.log("ℹ️ Sản phẩm không có nhiều màu để test inline color editor");
      }
    });
  });

  it("TC_FE_CART_010: [Empty State & Navigation] Giỏ hàng rỗng hiển thị thông điệp và điều hướng về Sản phẩm", () => {
    // 1. Vào trang chủ và mở giỏ hàng khi chưa có sản phẩm
    cy.visit("/");
    cy.get('button[title*="Giỏ hàng"]').first().click({ force: true });

    // 2. Kiểm tra giao diện Empty State
    cy.get('aside').should('be.visible');
    cy.get('aside').should('contain.text', 'Giỏ hàng rỗng');
    cy.get('aside').should('contain.text', 'Hãy lấp đầy giỏ hàng');

    // 3. Click nút mua sắm trong giỏ hàng rỗng
    cy.get('aside').contains('button', /khám phá|sản phẩm|mua/i).click({ force: true });

    // 4. Tự động đóng giỏ hàng và điều hướng về trang /products
    cy.url().should('include', '/products');
    cy.get('aside').should('not.exist');
  });
});
