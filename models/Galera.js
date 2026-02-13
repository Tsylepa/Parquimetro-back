const mongoose = require("mongoose");
const { peritagem } = require("../controllers/galeraController");

const { Schema } = mongoose;

const galeraSchema = new Schema({
  movel: {
    type: Number,
  },
  matricula: {
    type: String,
  },
  tipo: {
    type: Number,
  },
  descricao: {
    type: String,
  },
  data_emissao: {
    type: Date,
  },
  data_caducidade: {
    type: Date,
  },
  dias_atraso: {
    type: Number,
  },
  enc: {
    type: String,
  },
  oficina: {
    type: String,
  },
  estado: {
    status: {
      type: String,
    },
    descricao: {
      type: String,
    },
  },
  acesso: { type: Number },
  km: { type: String },
  peritagem: { type: String },
  mat: { type: Boolean },
  frio: { type: Boolean },
  pronto: { type: Boolean },
  chegada: { type: String },
  sondas: { type: String },
  validar: { type: Boolean },
  externa: { type: Boolean },
  local: { type: String },
});
const Galera = mongoose.model("Galera", galeraSchema);

module.exports = {
  Galera,
  galeraSchema,
};
