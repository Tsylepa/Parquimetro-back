const mongoose = require("mongoose");

const { Schema } = mongoose;

const tacografoSchema = new Schema(
  {
    colaborador: {
      type: String,
      required: true,
    },
    nome: {
      type: String,
      required: true,
    },
    timer: {
      type: Number,
      required: true,
    },
    timerStartTime: {
      type: Date,
      required: true,
    },
    timerEndTime: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const Tacografo = mongoose.model("Tacografo", tacografoSchema);

module.exports = {
  Tacografo,
  tacografoSchema,
};
