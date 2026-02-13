const router = require("express").Router();

const tacografoController = require("../controllers/tacografoController");

router.route("/createTacografo").post((req, res) => tacografoController.create(req, res));

router.route("/findTacografo").post((req, res) => tacografoController.findTac(req, res));

router.route("/ping").get((req, res) => tacografoController.ping(req, res));
module.exports = router;
