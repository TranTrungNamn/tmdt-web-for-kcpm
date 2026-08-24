const { uploadToImageKit, deleteFromImageKit } = require("../config/imagekit");
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/cloudinary");
const logger = require("../utils/logger");

/**
 * Upload ảnh với cơ chế Fallback (ImageKit -> Cloudinary)
 */
const uploadImage = async (fileBuffer, fileName, folder = "techvie_products") => {
  try {
    logger.info("Đang thử upload lên ImageKit (Primary)...");
    const result = await uploadToImageKit(fileBuffer, fileName, `/${folder}`);
    logger.info("Upload ImageKit thành công!");
    return result;
  } catch (imagekitError) {
    logger.warn("Upload ImageKit thất bại, tự động chuyển sang Cloudinary (Fallback)... Error:", { error: imagekitError.message || imagekitError });

    try {
      const cloudinaryUrl = await uploadToCloudinary(fileBuffer, folder);
      logger.info("Upload Cloudinary (Fallback) thành công!");
      return {
        url: cloudinaryUrl,
        fileId: null,
        provider: "cloudinary",
      };
    } catch (cloudinaryError) {
      logger.error("Upload thất bại trên cả 2 dịch vụ (ImageKit & Cloudinary)!");
      throw cloudinaryError;
    }
  }
};

/**
 * Xóa ảnh dựa trên provider
 */
const deleteImage = async (fileId, provider) => {
  if (provider === "imagekit") {
    return await deleteFromImageKit(fileId);
  } else if (provider === "cloudinary") {
    return await deleteFromCloudinary(fileId);
  }
};

module.exports = {
  uploadImage,
  deleteImage,
};
