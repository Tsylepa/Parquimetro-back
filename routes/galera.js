const router = require("express").Router();

const galeraController = require("../controllers/galeraController");

router.route("/").get((req, res) => galeraController.disponiveis(req, res));
router
  .route("/registar")
  .post((req, res) => galeraController.registarGalera(req, res));
router
  .route("/remover")
  .post((req, res) => galeraController.removerGalera(req, res));
router
  .route("/mudar")
  .post((req, res) => galeraController.changeStatus(req, res));
router
  .route("/mudarPeritagem")
  .post((req, res) => galeraController.changeStatusPeritagem(req, res));
router
  .route("/verificar")
  .post((req, res) => galeraController.findGalera(req, res));
router
  .route("/estacionadas")
  .get((req, res) => galeraController.estacionadas(req, res));
router.route("/oficina").get((req, res) => galeraController.oficina(req, res));
router
  .route("/peritagem")
  .get((req, res) => galeraController.peritagem(req, res));
router.route("/externa").get((req, res) => galeraController.externa(req, res));
router
  .route("/prontas")
  .get((req, res) => galeraController.findProntas(req, res));
router
  .route("/removerStatus")
  .post((req, res) => galeraController.removerStatus(req, res));
router
  .route("/porValidar")
  .get((req, res) => galeraController.needValidar(req, res));
router
  .route("/validar")
  .post((req, res) => galeraController.validarViatura(req, res));
module.exports = router;
