const express = require("express");
const { body, param } = require("express-validator");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const Category = require("../models/Category");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Kategori yonetimi
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Tum kategorileri listele
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kategori listesi
 */
router.get("/", auth, async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ data: categories, total: categories.length });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Yeni kategori olustur
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Elektronik
 *               description:
 *                 type: string
 *                 example: Elektronik urunler
 *     responses:
 *       201:
 *         description: Kategori olusturuldu
 *       400:
 *         description: Validasyon hatasi
 */
router.post(
  "/",
  auth,
  body("name").notEmpty().withMessage("Kategori adi zorunludur"),
  validate,
  async (req, res, next) => {
    try {
      const category = await Category.create(req.body);
      res.status(201).json({ message: "Kategori olusturuldu", data: category });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Kategori guncelle
 *     tags: [Categories]
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
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Kategori guncellendi
 *       404:
 *         description: Kategori bulunamadi
 */
router.put(
  "/:id",
  auth,
  param("id").isMongoId().withMessage("Gecersiz ID"),
  validate,
  async (req, res, next) => {
    try {
      const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!category) {
        return res.status(404).json({ message: "Kategori bulunamadi" });
      }
      res.json({ message: "Kategori guncellendi", data: category });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Kategori sil
 *     tags: [Categories]
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
 *         description: Kategori silindi
 *       404:
 *         description: Kategori bulunamadi
 */
router.delete(
  "/:id",
  auth,
  param("id").isMongoId().withMessage("Gecersiz ID"),
  validate,
  async (req, res, next) => {
    try {
      const category = await Category.findByIdAndDelete(req.params.id);
      if (!category) {
        return res.status(404).json({ message: "Kategori bulunamadi" });
      }
      res.json({ message: "Kategori silindi" });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
