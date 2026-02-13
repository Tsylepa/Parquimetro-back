const router = require("express").Router();

const viaturaController = require("../controllers/viaturaController");

router.route("/find").post((req, res) => viaturaController.findUser(req, res));
module.exports = router;
