const mongoose = require("mongoose");

const thermometerSchema = mongoose.Schema(
  {
    thermId: {
      type: Number,
      required: true,
    },
    yearTemp: {
      type: Array,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const thermometerModel = mongoose.model("thermometers", thermometerSchema);

module.exports = thermometerModel;
