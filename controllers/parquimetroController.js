const { Parquimetro: parquimetroModel } = require("../models/Parquimetro");
const { Galera: galeraModel } = require("../models/Galera");
const { Email: emailModel } = require("../models/Email");
const { AuditLog: auditLogModel } = require("../models/AuditLog");
const { sendCustomEmail } = require("../config/nodemailer");

const parquimetroController = {
  findAll: async (req, res) => {
    try {
      const availableSpots = await parquimetroModel.find({
        oficina: { $exists: false },
      });

      // Custom comparator function to sort documents by the numeric value of the 'lugar' field
      const sortedSpots = availableSpots.sort((a, b) => {
        const numA = parseInt(a.lugar.slice(1)); // Extract numeric part of 'lugar' field
        const numB = parseInt(b.lugar.slice(1)); // Extract numeric part of 'lugar' field
        return numA - numB; // Sort in ascending order
      });

      res.status(200).json(sortedSpots);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  },
  estacionarGalera: async (req, res) => {
    try {
      const lugar = req.body.lugar;
      const id = req.body.veiculo;
      const status = req.body.status;
      const km = req.body.km;
      const nr = Math.floor(Math.random() * 10000);

      const galeraExist = await galeraModel.findById(id);

      if (!galeraExist) {
        return res.status(400).json({ error: "Galera não encontrada" });
      } else {
        const estacionado = await parquimetroModel.findOne({
          galera: galeraExist.matricula,
        });

        if (!estacionado) {
          let updateObj = {};
          switch (status) {
            case "man_frio":
              updateObj = {
                km: km,
                oficina: status,
                estado: { descricao: req.body.descricao, status: status },
                acesso: nr,
                mat: false,
                frio: false,
              };
              auditLogModel.create({
                acao: "Entrada Oficina",
                galera: galeraExist.matricula,
                movel: galeraExist.movel,
                user_id: req.body.user_id,
                descricao: req.body.descricao,
              });
              break;
            case "frio":
              updateObj = {
                km: km,
                oficina: status,
                frio: false,
                estado: { descricao: req.body.descricao, status: status },
                acesso: nr,
              };
              auditLogModel.create({
                acao: "Entrada Oficina",
                galera: galeraExist.matricula,
                movel: galeraExist.movel,
                user_id: req.body.user_id,
                descricao: req.body.descricao,
              });
              break;

            case "manutencao":
              updateObj = {
                km: km,
                oficina: status,
                mat: false,
                estado: { descricao: req.body.descricao, status: status },
                acesso: nr,
              };
              auditLogModel.create({
                acao: "Entrada Oficina",
                galera: galeraExist.matricula,
                movel: galeraExist.movel,
                user_id: req.body.user_id,
                descricao: req.body.descricao,
              });
              break;
            case "sinistros":
              updateObj = {
                km: km,
                sinistros: status,
                estado: { descricao: req.body.descricao, status: status },
                acesso: nr,
              };
              auditLogModel.create({
                acao: "Entrada Sinistros",
                galera: galeraExist.matricula,
                movel: galeraExist.movel,
                user_id: req.body.user_id,
                descricao: req.body.descricao,
              });
              break;
            case "peritagem":
              console.log("peritagem");
              updateObj = {
                km: km,
                peritagem: status,
                estado: { descricao: req.body.descricao, status: status },
                acesso: nr,
              };
              auditLogModel.create({
                acao: "Entrada Peritagem",
                galera: galeraExist.matricula,
                movel: galeraExist.movel,
                user_id: req.body.user_id,
                descricao: req.body.descricao,
              });

              const htmlContent = `<p>A galera ${galeraExist.matricula} precisa de peritagem no lugar ${lugar}.</p>`;
              sendCustomEmail(
                "cassiano.tenda@acrv-pt.com",
                "Galera precisa de peritagem!",
                htmlContent
              );
              break;
            case "sondas":
              updateObj = {
                km: km,
                sondas: status,
                estado: { descricao: req.body.descricao, status: status },
                acesso: nr,
              };
              auditLogModel.create({
                acao: "Entrada Sondas",
                galera: galeraExist.matricula,
                movel: galeraExist.movel,
                user_id: req.body.user_id,
                descricao: req.body.descricao,
              });
              break;
            case "parqueamento":
              updateObj = {
                km: km,
                estado: { descricao: req.body.descricao, status: status },
                acesso: nr,
                pronto: true,
              };
              auditLogModel.create({
                acao: "Entrada Parqueamento",
                galera: galeraExist.matricula,
                movel: galeraExist.movel,
                user_id: req.body.user_id,
                descricao: req.body.descricao,
              });
              break;
            case "chegada":
              updateObj = {
                km: km,
                estado: { descricao: req.body.descricao, status: status },
                acesso: nr,
                pronto: true,
                externa: false,
              };
              auditLogModel.create({
                acao: "Chegada Perigoso",
                galera: galeraExist.matricula,
                movel: galeraExist.movel,
                user_id: req.body.user_id,
                descricao: req.body.descricao,
              });

              const htmlContent1 = `<p>A galera ${galeraExist.matricula} precisa de verificação no lugar ${lugar}.</p>`;
              sendCustomEmail(
                "sandra.tagarro@acrv-pt.com",
                "Chegada de perigoso",
                htmlContent1
              );
              break;
            default:
              updateObj = {
                km: km,
                estado: {
                  status: req.body.status,
                  descricao: req.body.descricao,
                },
                acesso: nr,
              };
              break;
          }

          const galeraEsta = await galeraModel.findOneAndUpdate(
            { _id: id },
            { $set: updateObj },

            { new: true }
          );
          console.log(galeraEsta);
          const parquimetro = await parquimetroModel.findOneAndUpdate(
            { lugar: lugar },
            {
              $set: {
                galera: galeraExist.matricula,
                movel: galeraExist.movel,
                pronto: galeraEsta.pronto,
                ocupado: true,
              },
            },
            { new: true }
          );
          const emailDoc = await emailModel.findOne({
            enc: "rececao", // Ensure selectedGalera.Enc is a string
          });
          const htmlContent = `<p>Viatura: ${galeraExist.matricula}</p><p>Processo: ${status}</p><p>Parquimetro: ${parquimetro.lugar}.</p><p>Kilometros: ${km}</p>`;

          for (const recipientEmail of emailDoc.email) {
            sendCustomEmail(
              recipientEmail,
              "informação sobre entrada de galera (Pré Receção)",
              htmlContent
            );
          }
          return res.status(200).json(parquimetro);
        } else {
          return res.status(400).json({ error: "Já está estacionado" });
        }
      }
    } catch (error) {
      console.error(`Erro: ${error}`);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  },
  newGalera: async (req, res) => {
    const {
      galera,
      empresa,
      lugar,
      descricao,
      status,
      email: emailPre,
      user_id,
      km,
    } = req.body;
    const nr = Math.floor(Math.random() * 10000);

    try {
      const estacionado = await parquimetroModel.findOne({ galera });

      if (!estacionado) {
        const email = await emailModel.findOne({ enc: empresa });

        if (email || emailPre !== "") {
          emailModel.create({ enc: empresa, email: emailPre });
          let updateObj = {};
          switch (status) {
            case "manutencao":
              updateObj = {
                matricula: galera,
                enc: empresa,
                km: km,
                oficina: status,
                estado: { descricao: req.body.descricao, status: status },
                acesso: nr,
              };
              auditLogModel.create({
                acao: "Entrada Oficina",
                galera: galera,

                user_id: req.body.user_id,
                descricao: req.body.descricao,
              });
              break;
            case "sinistros":
              updateObj = {
                matricula: galera,
                enc: empresa,
                km: km,
                sinistros: status,
                estado: { descricao: req.body.descricao, status: status },
                acesso: nr,
              };
              auditLogModel.create({
                acao: "Entrada Sinistros",
                galera: galera,

                user_id: req.body.user_id,
                descricao: req.body.descricao,
              });
              break;
            case "peritagem":
              updateObj = {
                matricula: galera,
                enc: empresa,
                km: km,
                peritagem: status,
                estado: { descricao: req.body.descricao, status: status },
                acesso: nr,
              };
              auditLogModel.create({
                acao: "Entrada Peritagem",
                galera: galera,

                user_id: req.body.user_id,
                descricao: req.body.descricao,
              });

              const htmlContent = `<p>A galera ${galera.matricula} precisa de peritagem no lugar ${lugar}.</p>`;
              sendCustomEmail(
                "cassiano.tenda@acrv-pt.com",
                "Galera precisa de peritagem!",
                htmlContent
              );
              break;
            case "sondas":
              updateObj = {
                matricula: galera,
                enc: empresa,
                km: km,
                sondas: status,
                estado: { descricao: req.body.descricao, status: status },
                acesso: nr,
              };
              auditLogModel.create({
                acao: "Entrada Sondas",
                galera: galera,

                user_id: req.body.user_id,
                descricao: req.body.descricao,
              });
              break;
            case "parqueamento":
              updateObj = {
                matricula: galera,
                enc: empresa,
                km: km,

                estado: { descricao: req.body.descricao, status: status },
                acesso: nr,
                pronto: true,
              };
              auditLogModel.create({
                acao: "Entrada Parqueamento",
                galera: galera,

                user_id: req.body.user_id,
                descricao: req.body.descricao,
              });
              break;
            case "chegada":
              updateObj = {
                km: km,
                estado: { descricao: req.body.descricao, status: status },
                acesso: nr,
                pronto: true,
                externa: false,
              };
              auditLogModel.create({
                acao: "Chegada Perigoso",
                galera: galera,

                user_id: req.body.user_id,
                descricao: req.body.descricao,
              });

              const htmlContent1 = `<p>A galera ${galeraExist.matricula} precisa de verificação no lugar ${lugar}.</p>`;
              sendCustomEmail(
                "sandra.tagarro@acrv-pt.com",
                "Chegada de perigoso",
                htmlContent1
              );
              break;
            default:
              updateObj = {
                km: km,
                estado: {
                  status: req.body.status,
                  descricao: req.body.descricao,
                },
                acesso: nr,
              };
              break;
          }

          const estacionar = await parquimetroModel.findOneAndUpdate(
            { lugar: lugar },
            {
              $set: {
                galera: galera,
                pronto: false,
                ocupado: true,
              },
            },
            { new: true }
          );

          const galera1 = await galeraModel.create(updateObj, { new: true });

          const emailDoc = await emailModel.findOne({
            enc: "rececao", // Ensure selectedGalera.Enc is a string
          });
          const htmlContent = `<p>Viatura: ${galera1.matricula}</p><p>Processo: ${status}</p><p>Parquimetro: ${estacionar.lugar}.</p><p>Kilometros: ${km}</p>`;
          for (const recipientEmail of emailDoc.email) {
            sendCustomEmail(
              recipientEmail,
              "informação sobre entrada de galera (Pré Receção)",
              htmlContent
            );
          }
          return res.status(200).json(estacionar);
        } else {
          return res.status(401).json({ msg: "Email não existe" });
        }
      } else {
        return res.status(400).json({ msg: "Já está estacionada" });
      }
    } catch (error) {
      console.error(`Erro: ${error}`);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  },
  perigoso: async (req, res) => {
    const { email, veiculo, lugar, local } = req.body;
    try {
      const galera = await galeraModel.findOneAndUpdate(
        { matricula: veiculo },
        { $set: { externa: true, local: local } }
      );
      const htmlContent = `<p>O veiculo ${veiculo} requisita chamada de perigoso no lugar ${lugar}.</p> <p>Codigo de acesso: ${galera.acesso}</p>`;
      sendCustomEmail(email, "Perigoso", htmlContent);
      return res.status(200).json({ msg: "foi enviado email" });
    } catch (error) {
      console.error(`Erro: ${error}`);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }
  },
  removerGalera: async (req, res) => {
    try {
      const lugar = req.body.lugar;
      const galera = req.body.veiculo;

      const galeraExist = await galeraModel.findOneAndUpdate(
        { matricula: galera },
        {
          $unset: {
            pronto: "",
            peritagem: "",
            mat: "",
            frio: "",
            sinistros: "",
            mat_frio: "",
            parqueamento: "",
            chegada: "",
            sondas: "",
          },
        },
        {}
      );

      if (galeraExist) {
        const updatedParquimetro = await parquimetroModel.findOneAndUpdate(
          { lugar: lugar },
          {
            $unset: { galera: "", movel: "", pronto: "" },
            $set: { ocupado: false },
          },
          { new: true }
        );
        auditLogModel.create({
          acao: "Ordem de levantamento",
          galera: galeraExist.matricula,
          movel: galeraExist.movel || "",
          user_id: req.body.user_id,
        });

        res.status(200).json(updatedParquimetro);
      } else {
        res.status(400).json({ msg: "galera não existe" });
      }
    } catch (error) {
      console.log(`erro: ${error}`);
    }
  },
  newLugar: async (req, res) => {
    const letra = req.body.letra;
    const num = req.body.num;

    async function getMaxNumberFromDB(letra) {
      const regex = new RegExp(`^${letra}\\d+`, "i"); // Match any string starting with the given letter followed by numbers
      const count = await parquimetroModel.countDocuments({ lugar: regex });

      return count; // Return the count of documents
    }

    const maxNum = await getMaxNumberFromDB(letra);

    const initNum = maxNum + 1;

    async function generateStringFromDB(letter, initialNumber, totalNumber) {
      let result = "";
      for (let i = initialNumber; i < initialNumber + totalNumber; i++) {
        result += letter + i + " ";
      }
      return result.trim(); // Trim to remove trailing space
    }

    const generatedString = await generateStringFromDB(letra, initNum, num);
    console.log("Generated string:", generatedString);

    // Create document in the database for each generated string
    const createdDocuments = [];
    for (let i = initNum; i < initNum + num; i++) {
      const lugar = letra + i;
      const document = await parquimetroModel.create({ lugar, ocupado: false });
      createdDocuments.push(document);
    }

    res.status(200).json(createdDocuments);
  },
  eliminarLugar: async (req, res) => {
    id = req.body.id;
    try {
      const deletedDocument = await parquimetroModel.findOneAndDelete({
        _id: id,
      });
      if (deletedDocument) {
        res.status(200).json(deletedDocument);
      } else {
        res.status(404).json({ error: "Document not found" });
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

module.exports = parquimetroController;
