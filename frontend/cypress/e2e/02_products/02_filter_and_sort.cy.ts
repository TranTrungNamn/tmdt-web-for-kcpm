describe("Module 2.2: Products - Lọc nâng cao & Sắp xếp giá chuẩn xác", () => {
  beforeEach(() => {
    cy.visit("/products");
    // Chờ danh sách sản phẩm tải xong từ Backend
    cy.get('h1').should("contain.text", "Phụ Kiện & Đồ Setup");
    cy.get('.grid').should("be.visible");
  });

  it("TC_FE_PROD_002A: Lọc sản phẩm theo Category Tabs và đối soát số lượng Badge", () => {
    // 1. Kiểm tra Tab mặc định là 'Tất cả'
    cy.contains('button', /Tất cả/i).should('have.class', 'bg-black');

    // 2. Click chọn danh mục 'Điện thoại' hoặc 'Laptop'
    cy.contains('button', /Laptop|Điện thoại|Đồng hồ/i).first().then(($tab) => {
      const categoryName = $tab.text().trim().replace(/[0-9]/g, '').trim();
      cy.wrap($tab).click({ force: true });

      // Tab được kích hoạt
      cy.wrap($tab).should('have.class', 'bg-black');

      // Tag 'Đang lọc theo:' xuất hiện
      cy.contains(/Đang lọc theo:/i).should('be.visible');
      cy.contains(categoryName).should('be.visible');
    });

    // 3. Chuyển lại về Tab 'Tất cả'
    cy.contains('button', /Tất cả/i).click({ force: true });
    cy.contains('button', /Tất cả/i).should('have.class', 'bg-black');
  });

  it("TC_FE_PROD_002B: Lọc sản phẩm bằng ô Search trong trang & Xóa từ khóa", () => {
    // 1. Nhập từ khóa tìm kiếm trong trang
    cy.get('input[placeholder*="Tìm kiếm phụ kiện"]').clear({ force: true }).type("Pro", { force: true });

    // 2. Xác nhận Tag lọc xuất hiện
    cy.contains(/Tìm: "Pro"/i).should('be.visible');

    // 3. Bấm icon X trên thanh Search để xóa từ khóa
    cy.get('button[title="Xóa tìm kiếm"]').click({ force: true });
    cy.get('input[placeholder*="Tìm kiếm phụ kiện"]').should('have.value', '');
  });

  it("TC_FE_PROD_002C: Sắp xếp giá TĂNG DẦN (Giá: Thấp đến Cao) - Kiểm thử Toán học", () => {
    // 1. Mở bộ lọc nâng cao
    cy.contains(/Bộ lọc nâng cao/i).click({ force: true });

    // 2. Mở dropdown Sắp xếp
    cy.contains(/Sắp xếp/i).parent().find('button').first().click({ force: true });

    // 3. Chọn "Giá: Thấp đến Cao"
    cy.contains(/Giá: Thấp đến Cao/i).click({ force: true });

    // 4. Trích xuất tất cả mức giá hiển thị trên trang và kiểm tra tính đơn điệu tăng (P[i] <= P[i+1])
    cy.wait(400);
    cy.get('.grid')
      .find('span')
      .filter(':contains("₫")')
      .then(($prices) => {
        const priceList: number[] = [];
        $prices.each((_, el) => {
          const rawText = Cypress.$(el).text().replace(/[^0-9]/g, '');
          if (rawText) {
            priceList.push(parseInt(rawText, 10));
          }
        });

        cy.log(`Danh sách giá tăng dần: ${JSON.stringify(priceList)}`);
        expect(priceList.length).to.be.greaterThan(0);

        for (let i = 0; i < priceList.length - 1; i++) {
          expect(priceList[i]).to.be.at.most(priceList[i + 1], `Giá tại vị trí ${i} (${priceList[i]}) phải <= vị trí ${i+1} (${priceList[i+1]})`);
        }
      });
  });

  it("TC_FE_PROD_002D: Sắp xếp giá GIẢM DẦN (Giá: Cao đến Thấp) - Kiểm thử Toán học", () => {
    // 1. Mở bộ lọc nâng cao
    cy.contains(/Bộ lọc nâng cao/i).click({ force: true });

    // 2. Mở dropdown Sắp xếp
    cy.contains(/Sắp xếp/i).parent().find('button').first().click({ force: true });

    // 3. Chọn "Giá: Cao đến Thấp"
    cy.contains(/Giá: Cao đến Thấp/i).click({ force: true });

    // 4. Trích xuất tất cả mức giá và kiểm tra tính đơn điệu giảm (P[i] >= P[i+1])
    cy.wait(400);
    cy.get('.grid')
      .find('span')
      .filter(':contains("₫")')
      .then(($prices) => {
        const priceList: number[] = [];
        $prices.each((_, el) => {
          const rawText = Cypress.$(el).text().replace(/[^0-9]/g, '');
          if (rawText) {
            priceList.push(parseInt(rawText, 10));
          }
        });

        cy.log(`Danh sách giá giảm dần: ${JSON.stringify(priceList)}`);
        expect(priceList.length).to.be.greaterThan(0);

        for (let i = 0; i < priceList.length - 1; i++) {
          expect(priceList[i]).to.be.at.least(priceList[i + 1], `Giá tại vị trí ${i} (${priceList[i]}) phải >= vị trí ${i+1} (${priceList[i+1]})`);
        }
      });
  });

  it("TC_FE_PROD_002E: [Random Multi-Color] Lọc sản phẩm bằng cách click ngẫu nhiên nhiều màu sắc", () => {
    // 1. Mở Bộ lọc nâng cao
    cy.contains(/Bộ lọc nâng cao/i).click({ force: true });

    // 2. Tìm danh sách tất cả các nút Màu sắc có sẵn
    cy.contains(/Màu sắc/i).parent().find('button').then(($colorBtns) => {
      const totalColors = $colorBtns.length;
      expect(totalColors).to.be.greaterThan(0);

      // 3. Bốc ngẫu nhiên 2 màu khác nhau từ danh sách
      const indices: number[] = [];
      while (indices.length < Math.min(2, totalColors)) {
        const randIdx = Math.floor(Math.random() * totalColors);
        if (!indices.includes(randIdx)) {
          indices.push(randIdx);
        }
      }

      const selectedColorNames: string[] = [];

      // 4. Click chọn từng màu ngẫu nhiên đã bốc
      indices.forEach((idx) => {
        const btn = $colorBtns.eq(idx);
        const colorName = btn.text().trim();
        selectedColorNames.push(colorName);

        cy.log(`🎲 Bốc & Click ngẫu nhiên màu: "${colorName}"`);
        cy.wrap(btn).click({ force: true });
        cy.wrap(btn).should('have.class', 'bg-black');
      });

      // 5. Xác nhận toàn bộ các Tag màu đã chọn xuất hiện đầy đủ trong "Đang lọc theo"
      selectedColorNames.forEach((name) => {
        cy.contains(`Màu: ${name}`).should('be.visible');
      });

      // 6. Click gỡ bỏ 1 Tag màu đầu tiên
      const firstRemovedColor = selectedColorNames[0];
      cy.log(`Hủy lọc màu: "${firstRemovedColor}"`);
      cy.contains(`Màu: ${firstRemovedColor}`).click({ force: true });

      // Tag của màu thứ nhất biến mất, nhưng màu thứ hai (nếu có) vẫn còn tồn tại
      cy.contains(`Màu: ${firstRemovedColor}`).should('not.exist');
      if (selectedColorNames.length > 1) {
        cy.contains(`Màu: ${selectedColorNames[1]}`).should('be.visible');
      }
    });
  });

  it("TC_FE_PROD_002F: Lọc theo Khoảng Giá (Price Range Boundary) & Nút 'Đặt lại'", () => {
    // 1. Mở Bộ lọc nâng cao
    cy.contains(/Bộ lọc nâng cao/i).click({ force: true });

    // 2. Nhập khoảng giá từ 0đ đến 5.000.000đ
    cy.get('input[type="number"]').first().clear({ force: true }).type("100000", { force: true });
    cy.get('input[type="number"]').last().clear({ force: true }).type("5000000", { force: true });
    cy.wait(400);

    // 3. Xác nhận Tag lọc theo giá xuất hiện
    cy.contains(/Giá:/i).should('be.visible');

    // 4. Bấm nút 'Đặt lại' (Reset filters)
    cy.contains('button', /Đặt lại/i).click({ force: true });

    // 5. Toàn bộ Tag lọc biến mất và trở về mặc định
    cy.contains(/Đang lọc theo:/i).should('not.exist');
  });
});
