const { AuditLog: auditLogModel } = require("../models/AuditLog");

const auditLogController = {
  checkLogs: async (req, res) => {
    try {
      const findLogs = await auditLogModel.find().sort({ timestamp: -1 });
      // Here, { timestamp: -1 } indicates sorting by timestamp field in descending order (newest to oldest)
      res.status(200).json(findLogs);
    } catch (error) {
      console.error("Error finding available spots:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
module.exports = auditLogController;
