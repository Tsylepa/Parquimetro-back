const router = require("express").Router();

const auditLogController = require("../controllers/auditLogController");

router.route("/").post((req, res) => auditLogController.checkLogs(req, res));

module.exports = router;
