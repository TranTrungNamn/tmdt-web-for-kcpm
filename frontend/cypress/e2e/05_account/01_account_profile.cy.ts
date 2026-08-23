describe("Module 5.1: Account - Quản lý tài khoản cá nhân (Profile, Orders, Devices & Security)", () => {
  beforeEach(() => {
    // 1. Đăng nhập với tài khoản khách hàng chuẩn
    cy.visit("/login");
    cy.get('input[placeholder*="email@example.com"], input[type="text"]').first().clear().type("customer@techvie.com");
    cy.get('input[type="password"]').first().clear().type("customer123");
    cy.get('button[type="submit"]').click({ force: true });
    cy.url({ timeout: 10000 }).should("not.include", "/login");

    // 2. Truy cập /account
    cy.visit("/account");
    cy.get("body").should("be.visible");
  });

  it("TC_FE_ACC_001A: [Profile View & TechVie ID] Xem thông tin cá nhân, mã TechVie ID và huy hiệu bảo vệ", () => {
    // 1. Kiểm tra sidebar Master Visual ID Card
    cy.contains(/MÃ SỐ:/i).should("be.visible");
    cy.contains(/Thành viên từ:/i).should("be.visible");
    cy.contains(/Đặc quyền:/i).should("be.visible");

    // 2. Kiểm tra tab Hồ sơ thành viên mặc định hiển thị
    cy.contains(/HỒ SƠ THÀNH VIÊN/i).should("be.visible");
    cy.get('input[value*="customer@techvie.com"]').should("be.visible");
    cy.contains(/EMAIL ĐĂNG KÝ/i).should("be.visible");
  });

  it("TC_FE_ACC_001B: [Tab Switching] Chuyển đổi linh hoạt giữa các Sub-tabs (Hồ sơ, Đơn hàng, Bảo hành, Bảo mật)", () => {
    // 1. Chuyển sang Tab 'Lịch sử đặt hàng'
    cy.contains("button", /Lịch sử đặt hàng/i).click({ force: true });
    cy.contains(/TIẾN TRÌNH ĐƠN HÀNG/i).should("be.visible");

    // 2. Chuyển sang Tab 'Bảo hành sản phẩm'
    cy.contains("button", /Bảo hành sản phẩm/i).click({ force: true });
    cy.contains(/THIẾT BỊ HOẠT ĐỘNG & CHỈ SỐ/i).should("be.visible");

    // 3. Chuyển sang Tab 'Cài đặt bảo mật'
    cy.contains("button", /Cài đặt bảo mật/i).click({ force: true });
    cy.contains(/THAY ĐỔI MẬT KHẨU/i).should("be.visible");
    cy.get('input[placeholder="••••••••"]').should("have.length.at.least", 1);

    // 4. Quay lại Tab 'Hồ sơ cá nhân'
    cy.contains("button", /Hồ sơ cá nhân/i).click({ force: true });
    cy.contains(/HỒ SƠ THÀNH VIÊN/i).should("be.visible");
  });

  it("TC_FE_ACC_001C: [Profile Update] Cập nhật thông tin Họ tên, SĐT, Địa chỉ nhận hàng", () => {
    // 1. Nhập thông tin hồ sơ mới
    const testName = "Khách Hàng TechVie VIP";
    const testPhone = "0987654321";
    const testAddress = "123 Đường Công Nghệ, Phường Tân Phú, Quận 7, TP.HCM";

    cy.get('input[type="text"]').eq(0).clear().type(testName);
    cy.get('input[type="text"]').eq(1).clear().type(testPhone);
    cy.get("textarea").first().clear().type(testAddress);

    // 2. Bấm nút Lưu hồ sơ thông tin
    cy.contains("button", /LƯU HỒ SƠ THÔNG TIN/i).click({ force: true });

    // 3. Kiểm tra input vẫn giữ giá trị đã nhập
    cy.get('input[type="text"]').eq(0).should("have.value", testName);
    cy.get('input[type="text"]').eq(1).should("have.value", testPhone);
    cy.get("textarea").first().should("have.value", testAddress);
  });

  it("TC_FE_ACC_001D: [Security Tab Validation] Kiểm tra form đổi mật khẩu và Toggle ẩn/hiện mật khẩu", () => {
    // 1. Chuyển sang Tab Cài đặt bảo mật
    cy.contains("button", /Cài đặt bảo mật/i).click({ force: true });

    // 2. Thử bấm cập nhật khi để trống input
    cy.contains("button", /CẬP NHẬT MẬT KHẨU/i).click({ force: true });
    cy.get("body").then(($body) => {
      expect($body.text()).to.match(/Vui lòng điền đầy đủ|thất bại|lỗi/i);
    });

    // 3. Nhập mật khẩu và test toggle icon mắt
    cy.get('input[placeholder="••••••••"]').first().type("currentpass123");
    cy.get('input[placeholder="••••••••"]').first().should("have.attr", "type", "password");

    // Click icon mắt để hiện password
    cy.get('input[placeholder="••••••••"]').first().parent().find("button").click({ force: true });
    cy.get('input[value="currentpass123"]').should("have.attr", "type", "text");
  });

  it("TC_FE_ACC_001E: [Copy Email Shortcut] Tương tác nút sao chép Email đăng ký", () => {
    // 1. Tìm nút sao chép email (icon copy bên cạnh email input readonly)
    cy.get('button[title="Sao chép email"]').first().should("be.visible").click({ force: true });
    cy.wait(300);
  });
});

