const express = require("express");
const jwt = require("jsonwebtoken");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const User = require("../models/User");

const router = express.Router();

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "15m" }
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d" }
  );
  return { accessToken, refreshToken };
};

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Kimlik dogrulama islemleri
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Yeni kullanici kaydi
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ahmet Yilmaz
 *               email:
 *                 type: string
 *                 example: ahmet@example.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: Kayit basarili
 *       400:
 *         description: Validasyon hatasi
 *       409:
 *         description: Email zaten kayitli
 */
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Ad zorunludur"),
    body("email").isEmail().withMessage("Gecerli bir email giriniz"),
    body("password").isLength({ min: 6 }).withMessage("Sifre en az 6 karakter olmali"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, password } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "Bu email zaten kayitli" });
      }

      const user = await User.create({ name, email, password });
      const tokens = generateTokens(user);

      res.status(201).json({
        message: "Kayit basarili",
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        ...tokens,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Kullanici girisi
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: ahmet@example.com
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Giris basarili
 *       401:
 *         description: Gecersiz email veya sifre
 */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Gecerli bir email giriniz"),
    body("password").notEmpty().withMessage("Sifre zorunludur"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select("+password");
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: "Gecersiz email veya sifre" });
      }

      const tokens = generateTokens(user);

      res.json({
        message: "Giris basarili",
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        ...tokens,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Access token yenileme
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token yenilendi
 *       401:
 *         description: Gecersiz refresh token
 */
router.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token zorunludur" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Kullanici bulunamadi" });
    }

    const tokens = generateTokens(user);
    res.json({ message: "Token yenilendi", ...tokens });
  } catch {
    return res.status(401).json({ message: "Gecersiz refresh token" });
  }
});

module.exports = router;
