const Product = require("../models/Product");
const { uploadToCloudinary, deleteFromCloudinary } = require("../config/cloudinary");
const { uploadImage } = require("../services/uploadService");
const logger = require("../utils/logger");


// Helper trích xuất public_id từ Cloudinary URL
const getPublicIdFromUrl = (url) => {
  if (!url || !url.includes("res.cloudinary.com")) return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    const pathAfterUpload = parts[1];
    const cleanPath = pathAfterUpload.replace(/^v\d+\//, "");
    return cleanPath.substring(0, cleanPath.lastIndexOf("."));
  } catch (err) {
    logger.error("Lỗi trích xuất publicId từ URL:", { error: err.message });
    return null;
  }
};

const productController = {
  // 1. Lấy danh sách sản phẩm (Hỗ trợ tìm kiếm thông qua query parameter 'search')
  getProducts: async (req, res) => {
    try {
      const { search, includeDeleted } = req.query;
      let query = {};
      
      if (includeDeleted !== 'true') {
        query.isDeleted = { $ne: true };
        
        // Tự động ẩn các sản phẩm thuộc danh mục đã bị tắt (soft deleted/disabled)
        try {
          const Category = require("../models/Category");
          const disabledCategories = await Category.find({ isDeleted: true }, 'name');
          if (disabledCategories.length > 0) {
            const disabledNames = disabledCategories.map(cat => cat.name);
            logger.info('[BACKEND] Hiding products under disabled categories:', { disabledNames });
            query.category = { $nin: disabledNames };
          }
        } catch (catError) {
          logger.error("Lỗi khi tìm danh mục bị tắt:", { error: catError.message });
        }
      }
      
      if (search) {
        const searchRegex = new RegExp(search.trim(), "i");
        // Nếu đã có điều kiện category, ta gộp lại bằng $and để tránh đè query
        const searchOrCond = [
          { name: searchRegex },
          { description: searchRegex }
        ];
        
        // Nếu category không bị cấm do đã tắt, cho phép tìm kiếm theo category
        if (!query.category) {
          searchOrCond.push({ category: searchRegex });
        }
        
        if (query.category) {
          query.$and = [
            { category: query.category },
            { $or: searchOrCond }
          ];
        } else {
          query.$or = searchOrCond;
        }

        // Ghi log tìm kiếm để tính phổ biến & lịch sử gần đây
        try {
          let userId = null;
          const authHeader = req.headers.authorization;
          if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            const jwt = require("jsonwebtoken");
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "techvie_jwt_secret_key_2026");
            userId = decoded.id || decoded.email || null;
          }
          
          const SearchLog = require("../models/SearchLog");
          await SearchLog.create({
            query: search.trim(),
            userId: userId,
            ip: req.ip || req.connection.remoteAddress
          });
        } catch (logErr) {
          logger.error("Lỗi ghi log tìm kiếm:", { error: logErr.message });
        }
      }
      
      const products = await Product.find(query);
      return res.status(200).json(products);
    } catch (error) {
      logger.error("Lỗi lấy danh sách sản phẩm:", { error: error.message });
      return res.status(500).json({
        success: false,
        message: "Không thể lấy danh sách sản phẩm từ database!",
        error: error.message,
      });
    }
  },

  createProduct: async (req, res) => {
    try {
      const { name, price, stock, category, description, specs, colors, badge } = req.body;

      if (!name || !category || price === undefined || price === null || (typeof price === "string" && price.trim() === "")) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập đầy đủ: name, price, category!",
        });
      }

      if (typeof price !== "number" && typeof price !== "string") {
        return res.status(400).json({
          success: false,
          message: "Giá sản phẩm phải là số lớn hơn 0!",
        });
      }

      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: "Giá sản phẩm phải là số lớn hơn 0!",
        });
      }

      // Tạo slug ID độc nhất cho sản phẩm
      const slugId = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      
      let uniqueId = slugId || "product";
      let count = 1;
      while (await Product.findById(uniqueId)) {
        uniqueId = `${slugId}-${count}`;
        count++;
      }

      // Upload ảnh với cơ chế Fallback (ImageKit -> Cloudinary)
      let imageUrl = req.body.image || "";
      if (req.file) {
        const uploadResult = await uploadImage(req.file.buffer, req.file.originalname, "techvie_products");
        imageUrl = uploadResult.url;
      }


      // Parse specs từ JSON string (nếu gửi bằng form-data)
      let parsedSpecs = [];
      if (specs) {
        try {
          parsedSpecs = typeof specs === "string" ? JSON.parse(specs) : specs;
        } catch (e) {
          logger.warn("Lỗi parse specs JSON:", { error: e.message });
          parsedSpecs = [];
        }
      }

      // Parse colors từ JSON string hoặc mảng
      let parsedColors = [];
      if (colors) {
        try {
          parsedColors = typeof colors === "string" ? JSON.parse(colors) : colors;
        } catch (e) {
          logger.warn("Lỗi parse colors JSON:", { error: e.message });
          parsedColors = [];
        }
      }

      const newProduct = new Product({
        _id: uniqueId,
        name,
        price: numPrice,
        stock: stock !== undefined ? Number(stock) : 0,
        category,
        image: imageUrl,
        description: description || "",
        specs: parsedSpecs,
        colors: parsedColors,
        badge: badge || "NORMAL",
      });

      await newProduct.save();

      return res.status(201).json({
        success: true,
        message: "Thêm sản phẩm thành công vào MongoDB & Cloudinary!",
        product: newProduct,
      });
    } catch (error) {
      logger.error("Lỗi thêm sản phẩm:", { error: error.message });
      if (error.name === "ValidationError") {
        
        return res.status(400).json({
          success: false,
          message: error.message,
          error: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi thêm sản phẩm!",
        error: error.message,
      });
    }
  },

  updateProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, price, stock, category, description, specs, colors, badge } = req.body;

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sản phẩm cần cập nhật!",
        });
      }

      if (name) product.name = name;
      if (price !== undefined) product.price = Number(price);
      if (stock !== undefined) product.stock = Number(stock);
      if (category) product.category = category;
      if (description !== undefined) product.description = description;
      if (badge !== undefined) product.badge = badge;

      if (specs) {
        try {
          product.specs = typeof specs === "string" ? JSON.parse(specs) : specs;
        } catch (e) {
          logger.warn("Lỗi parse specs JSON khi update:", { error: e.message });
        }
      }

      if (colors) {
        try {
          product.colors = typeof colors === "string" ? JSON.parse(colors) : colors;
        } catch (e) {
          logger.warn("Lỗi parse colors JSON khi update:", { error: e.message });
        }
      }

      if (req.file) {
        // Xóa ảnh cũ trên Cloudinary trước khi tải ảnh mới lên
        if (product.image) {
          const oldPublicId = getPublicIdFromUrl(product.image);
          if (oldPublicId) {
            logger.info(`[CLOUDINARY] Xóa ảnh cũ khi cập nhật sản phẩm: ${oldPublicId}`);
            await deleteFromCloudinary(oldPublicId).catch(err => 
              logger.error("Lỗi xóa ảnh cũ khi cập nhật:", { error: err.message })
            );
          }
        }
        const uploadResult = await uploadImage(req.file.buffer, req.file.originalname, "techvie_products");
        product.image = uploadResult.url;

      } else if (req.body.image !== undefined) {
        product.image = req.body.image;
      }

      await product.save();

      return res.status(200).json({
        success: true,
        message: "Cập nhật sản phẩm thành công!",
        product,
      });
    } catch (error) {
      logger.error("Lỗi cập nhật sản phẩm:", { error: error.message });
      // Thêm trả về 400 Bad Request
      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: error.message,
          error: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi cập nhật sản phẩm!",
        error: error.message,
      });
    }
  },

  // 4. Xóa sản phẩm
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;
      
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sản phẩm cần xóa!",
        });
      }

      // Thực hiện xóa mềm
      product.isDeleted = true;
      product.status = "DISCONTINUED";
      await product.save();

      return res.status(200).json({
        success: true,
        message: "Xóa mềm sản phẩm thành công (chuyển sang Ngừng kinh doanh)!",
        deletedProduct: product,
      });
    } catch (error) {
      logger.error("Lỗi xóa sản phẩm:", { error: error.message });
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi xóa sản phẩm!",
        error: error.message,
      });
    }
  },

  // 5. Khôi phục sản phẩm
  restoreProduct: async (req, res) => {
    try {
      const { id } = req.params;
      
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sản phẩm cần khôi phục!",
        });
      }

      product.isDeleted = false;
      product.status = "AVAILABLE";
      await product.save();

      return res.status(200).json({
        success: true,
        message: "Khôi phục sản phẩm thành công!",
        restoredProduct: product,
      });
    } catch (error) {
      logger.error("Lỗi khôi phục sản phẩm:", { error: error.message });
      return res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi khôi phục sản phẩm!",
        error: error.message,
      });
    }
  },
};

module.exports = productController;
