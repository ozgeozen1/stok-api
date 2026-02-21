const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Urun adi zorunludur"],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, "SKU zorunludur"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    price: {
      type: Number,
      required: [true, "Fiyat zorunludur"],
      min: 0,
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    minStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
    },
    unit: {
      type: String,
      enum: ["adet", "kg", "litre", "kutu", "paket"],
      default: "adet",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
