const ImageKit = require("imagekit");

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
});

// Helper upload lên ImageKit
const uploadToImageKit = async (fileBuffer, fileName, folder = "/techvie_products") => {
  return new Promise((resolve, reject) => {
    imagekit.upload(
      {
        file: fileBuffer,
        fileName: fileName || `img_${Date.now()}`,
        folder: folder,
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve({
          url: result.url,
          fileId: result.fileId,
          provider: "imagekit",
        });
      }
    );
  });
};

// Helper xóa file trên ImageKit
const deleteFromImageKit = async (fileId) => {
  try {
    const result = await imagekit.deleteFile(fileId);
    return result;
  } catch (error) {
    console.error("Lỗi khi xóa ảnh trên ImageKit:", error);
    throw error;
  }
};

module.exports = {
  imagekit,
  uploadToImageKit,
  deleteFromImageKit,
};
