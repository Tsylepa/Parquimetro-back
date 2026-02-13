const mongoose = require("mongoose");

const { Schema } = mongoose;

const parquimetroSchema = new Schema(
  {
    lugar: {
      type: String,
      required: true,
    },
    galera: {
      type: String,
    },
    movel: {
      type: Number,
    },
    ocupado: {
      type: Boolean,
    },
    pronto: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

const Parquimetro = mongoose.model("Parquimetro", parquimetroSchema);

module.exports = {
  Parquimetro,
  parquimetroSchema,
};
