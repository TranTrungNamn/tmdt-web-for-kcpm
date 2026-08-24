describe("Module 6.1: Contact - Biểu mẫu liên hệ & Hỗ trợ khách hàng", () => {
  beforeEach(() => {
    cy.visit("/contact");
    cy.get("body").should("be.visible");
  });

  it("TC_FE_CONT_001A: [Positive E2E] Gửi thư yêu cầu liên hệ hợp tác thành công với đủ 4 trường bắt buộc", () => {
    // 1. Cuộn đến form liên hệ
    cy.get("form").first().scrollIntoView().should("be.visible");

    // 2. Nhập đầy đủ 4 trường: Họ tên, Email, Tiêu đề, Nội dung
    cy.get('form input[placeholder*="Nguyễn Văn A"]').clear({ force: true }).type("Trần Trung Nam", { force: true });
    cy.get('form input[placeholder*="contact@example.com"]').clear({ force: true }).type("nam.tran@techvie.com", { force: true });
    cy.get('form input[placeholder*="Kế hoạch đại lý"]').clear({ force: true }).type("Hợp tác phân phối thiết bị TechVie", { force: true });
    cy.get('form textarea').clear({ force: true }).type("Tôi muốn tìm hiểu thêm về dịch vụ bảo hành và phân phối sản phẩm TechVie.", { force: true });

    // 3. Bấm Gửi thư yêu cầu
    cy.get('form button[type="submit"]').click({ force: true });

    // 4. Thông báo gửi thư thành công xuất hiện
    cy.contains(/Thư Yêu Cầu Đã Gửi|Cảm ơn bạn|thành công/i, { timeout: 10000 }).should("be.visible");
  });

  it("TC_FE_CONT_001B: [Form Validation BVA] Chặn gửi khi bỏ trống Họ tên hoặc Email bắt buộc", () => {
    // 1. Cuộn đến form liên hệ
    cy.get("form").first().scrollIntoView().should("be.visible");

    // 2. Chỉ điền tiêu đề và nội dung, để trống Họ tên & Email
    cy.get('form input[placeholder*="Kế hoạch đại lý"]').clear({ force: true }).type("Hỏi thông tin đại lý", { force: true });
    cy.get('form textarea').clear({ force: true }).type("Cần tư vấn bảng giá chiết khấu.", { force: true });

    // 3. Bấm Gửi thư
    cy.get('form button[type="submit"]').click({ force: true });

    // 4. Form không chuyển sang trạng thái thành công
    cy.contains(/Thư Yêu Cầu Đã Gửi/i).should("not.exist");
  });

  it("TC_FE_CONT_001C: [FAQs Accordion Toggle] Mở và đóng câu hỏi thường gặp (FAQs State Transition)", () => {
    // 1. Cuộn đến khu vực câu hỏi phổ biến
    cy.contains(/Câu hỏi phổ biến/i).scrollIntoView().should("be.visible");

    // 2. Click mở câu hỏi đầu tiên
    cy.contains("button", /Tôi có thể xem và mua các sản phẩm TechVie ở đâu/i).click({ force: true });
    cy.contains(/TechVie hiện phân phối sản phẩm chủ yếu trên nền tảng trực tuyến/i).should("be.visible");

    // 3. Click đóng câu hỏi đầu tiên
    cy.contains("button", /Tôi có thể xem và mua các sản phẩm TechVie ở đâu/i).click({ force: true });
    cy.wait(300);

    // 4. Click mở câu hỏi thứ hai
    cy.contains("button", /Các phụ kiện của TechVie có kén thiết bị sử dụng không/i).click({ force: true });
    cy.contains(/Các sản phẩm cơ học như giá đỡ tản nhiệt/i).should("be.visible");
  });

  it("TC_FE_CONT_001D: [Showroom & Map Display] Kiểm tra thông tin Văn phòng đại diện, Giờ làm việc và Bản đồ", () => {
    // 1. Kiểm tra thông tin Văn phòng đại diện
    cy.contains(/Văn Phòng Đại Diện/i).should("be.visible");
    cy.contains(/Số 02 Võ Oanh|0909|techvie/i).should("be.visible");

    // 2. Kiểm tra phần Giờ làm việc
    cy.contains(/Giờ Làm Việc/i).should("be.visible");
    cy.contains(/T2 - T6/i).should("be.visible");

    // 3. Kiểm tra iframe Google Maps hiển thị
    cy.get('iframe[src*="google.com/maps"]').should("exist");
  });
});

