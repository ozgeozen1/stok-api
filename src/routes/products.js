const express = require("express");
const { body, param, query } = require("express-validator");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const Product = require("../models/Product");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Urun ve stok yonetimi
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Tum urunleri listele (filtreleme ve sayfalama destegi)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Kategori ID'sine gore filtrele
 *       - in: query
 *         name: warehouse
 *         schema:
 *           type: string
 *         description: Depo ID'sine gore filtrele
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Urun adi veya SKU'da ara
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [name, -name, price, -price, quantity, -quantity, createdAt, -createdAt]
 *           default: -createdAt
 *     responses:
 *       200:
 *         description: Urun listesi
 */
router.get("/", auth, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.warehouse) filter.warehouse = req.query.warehouse;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { sku: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const sort = req.query.sort || "-createdAt";

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name")
        .populate("warehouse", "name location")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/products/low-stock:
 *   get:
 *     summary: Dusuk stoklu urunleri listele (quantity <= minStock)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dusuk stoklu urunler
 */
router.get("/low-stock", auth, async (req, res, next) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ["$quantity", "$minStock"] },
    })
      .populate("category", "name")
      .populate("warehouse", "name location")
      .sort({ quantity: 1 });

    res.json({ data: products, total: products.length });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: ID ile urun detayi
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Urun detayi
 *       404:
 *         description: Urun bulunamadi
 */
router.get(
  "/:id",
  auth,
  [param("id").isMongoId().withMessage("Gecersiz ID")],
  validate,
  async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id)
        .populate("category", "name")
        .populate("warehouse", "name location");

      if (!product) {
        return res.status(404).json({ message: "Urun bulunamadi" });
      }
      res.json({ data: product });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Yeni urun olustur
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, sku, price]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Samsung Galaxy S24
 *               sku:
 *                 type: string
 *                 example: SGS24-BLK-128
 *               description:
 *                 type: string
 *                 example: Samsung Galaxy S24 128GB Siyah
 *               category:
 *                 type: string
 *                 description: Kategori ID
 *               price:
 *                 type: number
 *                 example: 42999.99
 *               quantity:
 *                 type: integer
 *                 example: 50
 *               minStock:
 *                 type: integer
 *                 example: 10
 *               warehouse:
 *                 type: string
 *                 description: Depo ID
 *               unit:
 *                 type: string
 *                 enum: [adet, kg, litre, kutu, paket]
 *                 example: adet
 *     responses:
 *       201:
 *         description: Urun olusturuldu
 *       400:
 *         description: Validasyon hatasi
 */
router.post(
  "/",
  auth,
  [
    body("name").notEmpty().withMessage("Urun adi zorunludur"),
    body("sku").notEmpty().withMessage("SKU zorunludur"),
    body("price").isFloat({ min: 0 }).withMessage("Fiyat 0 veya daha buyuk olmali"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const product = await Product.create(req.body);
      res.status(201).json({ message: "Urun olusturuldu", data: product });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Urun guncelle
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               sku:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: integer
 *               minStock:
 *                 type: integer
 *               warehouse:
 *                 type: string
 *               unit:
 *                 type: string
 *                 enum: [adet, kg, litre, kutu, paket]
 *     responses:
 *       200:
 *         description: Urun guncellendi
 *       404:
 *         description: Urun bulunamadi
 */
router.put(
  "/:id",
  auth,
  [param("id").isMongoId().withMessage("Gecersiz ID")],
  validate,
  async (req, res, next) => {
    try {
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!product) {
        return res.status(404).json({ message: "Urun bulunamadi" });
      }
      res.json({ message: "Urun guncellendi", data: product });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Urun sil
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Urun silindi
 *       404:
 *         description: Urun bulunamadi
 */
router.delete(
  "/:id",
  auth,
  [param("id").isMongoId().withMessage("Gecersiz ID")],
  validate,
  async (req, res, next) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Urun bulunamadi" });
      }
      res.json({ message: "Urun silindi" });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
