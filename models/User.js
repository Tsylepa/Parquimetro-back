const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    colaborador: {
      type: Number,
    },
    nr_col: {
      type: Number,
    },
    password: {
      type: String,
    },
    email: {
      type: String,
    },
    nome: {
      type: String,
    },
    tlm: {
      type: Number,
    },
    cod_postal: {
      type: Number,
    },
    tlm_urg: {
      type: Number,
    },
    estado: {
      type: String,
    },
    filho_dep: {
      type: String,
    },
    nif: {
      type: Number,
    },
    niss: {
      type: Number,
    },
    morada: {
      type: String,
    },
    funcao: {
      type: String,
    },
    role: {
      type: [String],
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = {
  User,
  userSchema,
};
