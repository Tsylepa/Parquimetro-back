const router = require("express").Router();

const userRouter = require("./users");
const viaturaRouter = require("./viaturas");
const tacografoRouter = require("./tacografo");
const galeraRouter = require("./galera");
const parquimetroRouter = require("./parquimetro");
const auditLogRouter = require("./auditLog");

router.use("/users", userRouter);
router.use("/", viaturaRouter);
router.use("/tacografo", tacografoRouter);
router.use("/galera", galeraRouter);
router.use("/parquimetro", parquimetroRouter);
router.use("/auditLog", auditLogRouter);
// Health check
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is working!" });
});

module.exports = router;
