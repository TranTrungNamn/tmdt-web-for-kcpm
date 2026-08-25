const cartProduct = {
  id: 'bva-cart-product',
  name: 'BVA Cart Product',
  price: 500000,
  image:
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
  category: 'Test',
  description: 'Frontend BVA Cart Product',
  specs: [],
  stock: 100,
  badge: 'NORMAL',
};

function stabilizeAnimations() {
  cy.document().then((doc) => {
    const style = doc.createElement('style');

    style.innerHTML = `
      .animate-fade-in {
        opacity: 1 !important;
        transform: none !important;
        animation: none !important;
      }

      *, *::before, *::after {
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        animation-duration: 0s !important;
        animation-delay: 0s !important;
      }
    `;

    doc.head.appendChild(style);
  });
}

function prepareCart(quantity: number) {
  cy.intercept('GET', '**/api/products*', {
    statusCode: 200,
    body: {
      success: true,
      products: [],
    },
  });

  cy.visit('/', {
    onBeforeLoad(win) {
      win.localStorage.removeItem('techvie_token');

      win.localStorage.setItem(
        'techvie_cart',
        JSON.stringify([
          {
            product: cartProduct,
            quantity,
          },
        ]),
      );
    },
  });

  stabilizeAnimations();

  cy.get('button[title="Giỏ hàng TechVie"]')
    .should('exist')
    .click();

  cy.contains('h2', 'Giỏ hàng')
    .closest('aside')
    .should('exist')
    .as('cartPanel');
}

function mockAdmin(stock: number) {
  const adminProduct = {
    id: 'test-product-bva-admin',
    _id: 'test-product-bva-admin',
    name: 'Test Product Updated',
    price: 1800000,
    image:
      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
    category: 'laptop',
    description: 'Frontend Admin BVA Product',
    specs: [],
    colors: [],
    stock,
    badge: 'NORMAL',
  };

  cy.intercept('POST', '**/api/auth/login', {
    statusCode: 200,
    body: {
      success: true,
      token: 'fake-admin-token',
    },
  }).as('adminLogin');

  cy.intercept('GET', '**/api/auth/profile', {
    statusCode: 200,
    body: {
      success: true,
      user: {
        _id: 'admin-bva-id',
        username: 'ADMINISTRATOR',
        email: 'admin@techvie.com',
        phone: '0901234567',
        address: 'TechVie',
        role: 'admin',
        vipStatus: 'Premium',
        auth_provider: 'credentials',
        isEmailVerified: true,
        created_at: '2026-01-01T00:00:00.000Z',
      },
    },
  }).as('adminProfile');

  cy.intercept('GET', '**/api/products*', {
    statusCode: 200,
    body: {
      success: true,
      products: [adminProduct],
    },
  }).as('products');

  cy.intercept('GET', '**/api/users*', {
    statusCode: 200,
    body: {
      success: true,
      users: [],
    },
  });

  cy.visit('/login');

  stabilizeAnimations();

  cy.get('input[placeholder="email@example.com hoặc username"]')
    .should('exist')
    .clear()
    .type('admin@techvie.com');

  cy.get('input[type="password"]')
    .should('exist')
    .clear()
    .type('admin123');

  cy.contains('button', 'ĐĂNG NHẬP NGAY')
    .should('exist')
    .click();

  cy.wait('@adminLogin');

  cy.url().should('include', '/admin');

  stabilizeAnimations();

  cy.contains('button', 'Kho hàng / Tồn')
    .should('exist')
    .click();

  cy.url().should('include', '/admin/stock');

  stabilizeAnimations();

  cy.contains('tr', 'Test Product Updated')
    .should('exist')
    .as('productRow');
}

describe('TechVie Frontend Robust BVA', () => {
  context('Cart - FR-CART-01', () => {
    it('TC-BVA-CART-001 | quantity giảm từ 1 xuống 0 thì sản phẩm bị xóa', () => {
      prepareCart(1);

      cy.get('@cartPanel').within(() => {
        cy.contains('(1 sản phẩm đã được chọn)')
          .should('exist');

        cy.contains('BVA Cart Product')
          .should('exist');

        cy.contains('500.000₫')
          .should('exist');

        cy.get('svg.lucide-minus')
          .first()
          .parent('button')
          .click();

        cy.contains('Giỏ hàng rỗng')
          .should('exist');

        cy.contains('(0 sản phẩm đã được chọn)')
          .should('exist');
      });
    });

    it('TC-BVA-CART-002 | quantity = 1 vẫn tồn tại trong Cart', () => {
      prepareCart(1);

      cy.get('@cartPanel').within(() => {
        cy.contains('(1 sản phẩm đã được chọn)')
          .should('exist');

        cy.contains('BVA Cart Product')
          .should('exist');

        cy.contains('500.000₫')
          .should('exist');

        cy.get('svg.lucide-minus')
          .should('exist');

        cy.get('svg.lucide-plus')
          .should('exist');
      });
    });

    it('TC-BVA-CART-003 | quantity = 2 và có thể giảm về 1', () => {
      prepareCart(2);

      cy.get('@cartPanel').within(() => {
        cy.contains('(2 sản phẩm đã được chọn)')
          .should('exist');

        cy.contains('BVA Cart Product')
          .should('exist');

        cy.contains('1.000.000₫')
          .should('exist');

        cy.get('svg.lucide-minus')
          .first()
          .parent('button')
          .click();

        cy.contains('(1 sản phẩm đã được chọn)')
          .should('exist');

        cy.contains('BVA Cart Product')
          .should('exist');

        cy.contains('500.000₫')
          .should('exist');
      });
    });
  });

  context('Admin Stock - FR-ADM-01', () => {
    it('TC-BVA-ADM-001 | stock = 4 hiển thị Cần nhập kho', () => {
      mockAdmin(4);

      cy.get('@productRow').within(() => {
        cy.contains('4 chiếc')
          .should('exist');

        cy.contains('Cần nhập kho')
          .should('exist');

        cy.contains('Bình thường')
          .should('not.exist');
      });
    });

    it('TC-BVA-ADM-002 | stock = 5 vẫn hiển thị Cần nhập kho', () => {
      mockAdmin(5);

      cy.get('@productRow').within(() => {
        cy.contains('5 chiếc')
          .should('exist');

        cy.contains('Cần nhập kho')
          .should('exist');

        cy.contains('Bình thường')
          .should('not.exist');
      });
    });

    it('TC-BVA-ADM-003 | stock = 6 chuyển sang Bình thường', () => {
      mockAdmin(6);

      cy.get('@productRow').within(() => {
        cy.contains('6 chiếc')
          .should('exist');

        cy.contains('Bình thường')
          .should('exist');

        cy.contains('Cần nhập kho')
          .should('not.exist');
      });
    });
  });
});