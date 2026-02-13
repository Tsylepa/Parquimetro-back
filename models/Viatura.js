const mongoose = require("mongoose");

const { Schema } = mongoose;

const viaturaSchema = new Schema(
  {
    matricula: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

const Viatura = mongoose.model("Viatura", viaturaSchema);

module.exports = {
  Viatura,
  viaturaSchema,
};
