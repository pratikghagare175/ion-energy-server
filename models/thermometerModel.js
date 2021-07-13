const mongoose = require("mongoose");

const thermometerSchema = mongoose.Schema(
  {
    month: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
    },
    weeklyTemp: {
      type: Array,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const thermometerModel = mongoose.model("thermometers", thermometerSchema);

module.exports = thermometerModel;
