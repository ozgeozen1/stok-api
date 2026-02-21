const express = require("express");
const { body, param } = require("express-validator");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const Warehouse = require("../models/Warehouse");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Warehouses
 *   description: Depo yonetimi
 */

/**
 * @swagger
 * /api/warehouses:
 *   get:
 *     summary: Tum depolari listele
 *     tags: [Warehouses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Depo listesi
 */
router.get("/", auth, async (req, res, next) => {
  try {
    const warehouses = await Warehouse.find().sort({ name: 1 });
    res.json({ data: warehouses, total: warehouses.length });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/warehouses:
 *   post:
 *     summary: Yeni depo olustur
 *     tags: [Warehouses]
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
 *                 example: Ana Depo
 *               location:
 *                 type: string
 *                 example: Istanbul, Tuzla
 *               description:
 *                 type: string
 *                 example: Ana dagitim deposu
 *     responses:
 *       201:
 *         description: Depo olusturuldu
 */
router.post(
  "/",
  auth,
  body("name").notEmpty().withMessage("Depo adi zorunludur"),
  validate,
  async (req, res, next) => {
    try {
      const warehouse = await Warehouse.create(req.body);
      res.status(201).json({ message: "Depo olusturuldu", data: warehouse });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/warehouses/{id}:
 *   put:
 *     summary: Depo guncelle
 *     tags: [Warehouses]
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
 *               location:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Depo guncellendi
 *       404:
 *         description: Depo bulunamadi
 */
router.put(
  "/:id",
  auth,
  param("id").isMongoId().withMessage("Gecersiz ID"),
  validate,
  async (req, res, next) => {
    try {
      const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!warehouse) {
        return res.status(404).json({ message: "Depo bulunamadi" });
      }
      res.json({ message: "Depo guncellendi", data: warehouse });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/warehouses/{id}:
 *   delete:
 *     summary: Depo sil
 *     tags: [Warehouses]
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
 *         description: Depo silindi
 *       404:
 *         description: Depo bulunamadi
 */
router.delete(
  "/:id",
  auth,
  param("id").isMongoId().withMessage("Gecersiz ID"),
  validate,
  async (req, res, next) => {
    try {
      const warehouse = await Warehouse.findByIdAndDelete(req.params.id);
      if (!warehouse) {
        return res.status(404).json({ message: "Depo bulunamadi" });
      }
      res.json({ message: "Depo silindi" });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
