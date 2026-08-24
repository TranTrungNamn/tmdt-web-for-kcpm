import { createVoucher } from '../services/api';

export function generateRandomVouchers(count = 20) {
  const prefixes = ['SALE', 'VIP', 'OFF', 'MEGA', 'TECH', 'WELCOME', 'HOT', 'BVA'];
  const discounts = [10, 15, 20, 50000, 100000, 200000, 500000, 1000000];
  const minOrders = [0, 500000, 1000000, 5000000, 10000000];
  
  const vouchers = [];
  for (let i = 0; i < count; i++) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const code = `${prefix}${Math.floor(100 + Math.random() * 900)}`; 
    
    const discount = discounts[Math.floor(Math.random() * discounts.length)];
    const minOrderVal = minOrders[Math.floor(Math.random() * minOrders.length)];
    
    const isPercent = discount <= 100;
    const description = `Giảm ${isPercent ? discount + '%' : discount.toLocaleString() + 'đ'} cho đơn từ ${minOrderVal.toLocaleString()}đ`;
    
    vouchers.push({
      code,
      discount,
      description,
      minOrderVal,
      isActive: true
    });
  }
  
  // Vẫn chèn cứng 1 cái chuyên test BVA500 để bạn dễ dùng làm test case nha
  vouchers.push({
    code: 'BVA500',
    discount: 50000,
    description: 'Voucher chuyên test BVA (Subtotal = 500k)',
    minOrderVal: 500000,
    isActive: true
  });
  
  return vouchers;
}

/**
 * Hàm hỗ trợ tự động tạo hàng loạt Voucher ngẫu nhiên vào Database thông qua API
 */
export async function seedDemoVouchers(count = 20) {
  console.log(`Bắt đầu tạo danh sách ${count} Voucher ngẫu nhiên...`);
  const vouchers = generateRandomVouchers(count);
  let successCount = 0;
  
  for (const voucher of vouchers) {
    try {
      const response = await createVoucher(voucher);
      if (response.success) {
        console.log(`✅ Đã tạo thành công Voucher: ${voucher.code}`);
        successCount++;
      } else {
        console.warn(`⚠️ Bỏ qua Voucher ${voucher.code}:`, response.message);
      }
    } catch (error) {
      console.error(`❌ Lỗi khi tạo Voucher ${voucher.code}:`, error);
    }
  }

  console.log(`\n🎉 Đã hoàn tất! Tạo thành công ${successCount}/${vouchers.length} Vouchers.`);
  return successCount;
}
