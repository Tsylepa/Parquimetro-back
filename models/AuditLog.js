const mongoose = require("mongoose");

const { Schema } = mongoose;

const auditLogSchema = new Schema({
  acao: { type: String, required: true }, // Action performed (e.g., "remove_car_id")
  user_id: { type: String, required: true },
  galera: { type: String, required: true },
  movel: { type: Number },
  descricao: [String],
  timestamp: { type: Date, default: Date.now }, // Timestamp of when the action was performed
});

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

module.exports = {
  AuditLog,
  auditLogSchema,
};
