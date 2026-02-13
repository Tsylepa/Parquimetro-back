const router = require("express").Router();

const parquimetroController = require("../controllers/parquimetroController");

router
  .route("/remover")
  .post((req, res) => parquimetroController.removerGalera(req, res));
router
  .route("/estacionar")
  .post((req, res) => parquimetroController.estacionarGalera(req, res));

router
  .route("/novaGalera")
  .post((req, res) => parquimetroController.newGalera(req, res));
router
  .route("/removerLugar")
  .delete((req, res) => parquimetroController.eliminarLugar(req, res));
router.route("/").get((req, res) => parquimetroController.findAll(req, res));
router
  .route("/perigoso")
  .post((req, res) => parquimetroController.perigoso(req, res));
router
  .route("/novoLugar")
  .post((req, res) => parquimetroController.newLugar(req, res));

module.exports = router;
