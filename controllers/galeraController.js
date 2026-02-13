const { sendCustomEmail } = require("../config/nodemailer");
const { Galera: galeraModel } = require("../models/Galera");
const { Parquimetro: parquimetroModel } = require("../models/Parquimetro");
const { Email: emailModel } = require("../models/Email");
const { AuditLog: auditLogModel } = require("../models/AuditLog");
const parquimetroController = require("./parquimetroController");

const galeraController = {
  estacionadas: async (req, res) => {
    try {
      const availableSpots = await galeraModel.find({
        "estado.status": { $exists: true },
      });
      res.status(200).json(availableSpots);
    } catch (error) {
      console.error("Error finding available spots:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  findGalera: async (req, res) => {
    const galera = req.body.matricula;
    try {
      const onlyGalera = await galeraModel.findOne({
        matricula: galera,
      });
      res.status(200).json(onlyGalera);
    } catch (error) {
      console.error("Error finding available spots:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  oficina: async (req, res) => {
    try {
      const availableSpots = await galeraModel.find({
        oficina: { $exists: true },
      });
      res.status(200).json(availableSpots);
    } catch (error) {
      console.error("Error finding available spots:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  peritagem: async (req, res) => {
    try {
      const availableSpots = await galeraModel.find({
        peritagem: { $exists: true },
      });
      res.status(200).json(availableSpots);
    } catch (error) {
      console.error("Error finding available spots:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  externa: async (req, res) => {
    try {
      const availableSpots = await galeraModel.find({
        externa: true,
      });
      res.status(200).json(availableSpots);
    } catch (error) {
      console.error("Error finding available spots:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  sinistros: async (req, res) => {
    try {
      const availableSpots = await galeraModel.find({
        sinistros: { $exists: true },
      });
      res.status(200).json(availableSpots);
    } catch (error) {
      console.error("Error finding available spots:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  needValidar: async (req, res) => {
    try {
      const validar = await galeraModel.find({ validar: false });
      res.status(200).json(validar);
    } catch (error) {
      console.error("Error in needValidar:", error);
      res.status(500).json({ msg: "erro do sistema" });
    }
  },

  validarViatura: async (req, res) => {
    const veiculo = String(req.body.veiculo);
    try {
      const viatura = await galeraModel.findOneAndUpdate(
        { _id: veiculo },
        { $unset: { validar: "" }, $set: { pronto: true } }
      );
      console.log(viatura);
      if (viatura) {
        const emailDoc = await emailModel.findOne({
          enc: viatura.enc, // Ensure selectedGalera.Enc is a string
        });
        auditLogModel.create({
          acao: "Validação",
          galera: viatura.matricula,
          movel: viatura.movel,
          user_id: req.body.user_id,
          descricao: viatura.estado.descricao,
        });
        if (emailDoc) {
          const htmlContent = `<p>A galera ${viatura.matricula} está pronta para levantar.</p><p>O codigo de acesso: ${viatura.acesso}</p>`;

          // Iterate over each recipient in the emailDoc.email array
          for (const recipientEmail of emailDoc.email) {
            sendCustomEmail(recipientEmail, "Galera pronta!", htmlContent);
          }
        }
        res.status(200).json(viatura);
      } else {
        res.status(400).json({ msg: "viatura não encontrada" });
      }
    } catch (error) {
      console.error("Error in validarViatura:", error);
      res.status(500).json({ msg: `erro do sistema: ${error.message}` });
    }
  },

  findProntas: async (req, res) => {
    try {
      const availableSpots = await galeraModel.find({
        pronto: true,
      });

      const matriculas = availableSpots.map((spot) => spot.matricula);

      const lugar = await parquimetroModel.find({
        galera: { $in: matriculas },
      });

      res.status(200).json(availableSpots);
    } catch (error) {
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  },
  removerStatus: async (req, res) => {
    const galera = req.body.veiculo;
    console.log(galera);
    await galeraModel.findByIdAndUpdate(
      { _id: galera },
      {
        $unset: {
          pronto: "",
          peritagem: "",
          oficina: "",
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
    res.status(200).json({ msg: "galera removida" });
  },
  changeStatusPeritagem: async (req, res) => {
    const matricula = req.body.matricula; // Assuming matricula is sent in the request body
    const status = req.body.status;

    try {
      const selectedGalera = await galeraModel.findOneAndUpdate(
        { matricula: matricula },
        { $set: { peritagem: status } },
        { new: true }
      );

      if (status === "standby") {
        const parquimetroGalera = await parquimetroModel.findOneAndUpdate(
          { galera: matricula },
          {
            $unset: { galera: "", movel: "", pronto: "" },
            $set: { ocupado: false },
          },
          { new: true }
        );

        res.status(201).json(selectedGalera);
      } else if (status === "pronto") {
        const parquimetroGalera = await parquimetroModel.findOne({
          galera: matricula,
        });

        if (!parquimetroGalera) {
          await galeraModel.findOneAndUpdate(
            { matricula: matricula }, // Search based on matricula instead of _id
            {
              $unset: {
                oficina: "",
              },
              $set: {
                validar: false,
              },
            }
          );

          // Update the parquimetroModel
          const lugar = await parquimetroModel.findOneAndUpdate(
            { ocupado: false },
            {
              $set: {
                galera: selectedGalera.matricula,
                movel: selectedGalera.movel,
                pronto: true,
                ocupado: true,
              },
            }
          );

          res.status(200).json({ selectedGalera, lugar });
        } else {
          res.status(400).json(parquimetroGalera.lugar);
        }
      } else if (status === "espera") {
        const vehicleExists = await parquimetroModel.findOne({
          galera: selectedGalera.matricula,
        });
        console.log("veiculo", selectedGalera);
        console.log("vehicleExists", vehicleExists);
        if (vehicleExists) {
          return res
            .status(400)
            .json({ message: "Vehicle is already present." });
        } else {
          // Find and update an available spot
          const lugar = await parquimetroModel.findOneAndUpdate(
            { ocupado: false },
            {
              $set: {
                galera: selectedGalera.matricula,
                movel: selectedGalera.movel,
                pronto: false,
                ocupado: true,
              },
            },
            { new: true } // Return the updated document
          );

          if (lugar) {
            // Successfully parked the vehicle
            res.status(202).json({ selectedGalera, lugar });
          } else {
            // No available spot found
            res.status(404).json({ message: "No available spot found." });
          }
        }
      } else {
        res.status(201).json(selectedGalera);
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  changeStatus: async (req, res) => {
    const op = req.body.op;
    const matricula = req.body.matricula; // Assuming matricula is sent in the request body
    const status = req.body.status;
    const mat = req.body.mat;
    const frio = req.body.frio;
    try {
      if (op == "parquimetro") {
        const selectedGalera = await galeraModel.findOneAndUpdate(
          { matricula: matricula }, // Search based on matricula instead of _id
          {
            $set: {
              estado: {
                status: status,
              },
            },
          },
          { new: true }
        );

        if (selectedGalera) {
          switch (status) {
            case "manutencao":
              await galeraModel.findOneAndUpdate(
                { matricula: matricula },
                { $set: { oficina: "espera", mat: true } }
              );
              return res
                .status(201)
                .json({ msg: "Foi enviada para a oficina" });
            case "sinistros":
              await galeraModel.findOneAndUpdate(
                { matricula: matricula },
                { $set: { sinistros: "espera" } }
              );
              return res
                .status(200)
                .json({ message: "Status updated successfully" });
            case "peritagem":
              console.log(matricula);
              await galeraModel.findOneAndUpdate(
                { matricula: matricula },
                { $set: { peritagem: "espera" } }
              );
              const htmlContent = `<p>A galera ${selectedGalera.matricula} precisa de peritagem no lugar ${lugar.lugar}.</p>`;
              sendCustomEmail(
                "cassiano.tenda@acrv-pt.com",
                "Galera precisa de peritagem!",
                htmlContent
              );
              return res
                .status(200)
                .json({ message: "Status updated successfully" });
            default:
              return res
                .status(200)
                .json({ message: "Status updated successfully" });
          }
        } else {
          return res.status(404).json({ error: "Galera not found" });
        }
      } else {
        const vehicleExists = await parquimetroModel.findOne({
          galera: matricula,
        });

        if (vehicleExists && status !== "standby") {
          return res
            .status(400)
            .json({ message: "Vehicle is already present." });
        } else {
          const updateFields = {
            oficina: status,
          };

          if (typeof mat !== "undefined") {
            updateFields.mat = mat;
          }

          if (typeof frio !== "undefined") {
            updateFields.frio = frio;
          }
          const selectedGalera = await galeraModel.findOneAndUpdate(
            { matricula: matricula },
            { $set: updateFields },
            { new: true }
          );
          if (status === "standby") {
            const parquimetroGalera = await parquimetroModel.findOneAndUpdate(
              { galera: matricula },
              {
                $unset: { galera: "", movel: "", pronto: "" },
                $set: { ocupado: false },
              },
              { new: true }
            );

            return res.status(201).json(selectedGalera);
          } else if (status === "pronto") {
            const parquimetroGalera = await parquimetroModel.findOne({
              galera: matricula,
            });

            if (!parquimetroGalera) {
              await galeraModel.findOneAndUpdate(
                { matricula: matricula }, // Search based on matricula instead of _id
                {
                  $unset: {
                    oficina: "",
                  },
                  $set: {
                    validar: false,
                  },
                }
              );

              console.log(selectedGalera);

              // Update the parquimetroModel
              const lugar = await parquimetroModel.findOneAndUpdate(
                { ocupado: false },
                {
                  $set: {
                    galera: selectedGalera.matricula,
                    movel: selectedGalera.movel,
                    pronto: true,
                    ocupado: true,
                  },
                }
              );

              return res.status(200).json({ selectedGalera, lugar });
            } else {
              return res.status(400).json(parquimetroGalera.lugar);
            }
          } else if (status === "espera") {
            const vehicleExists = await parquimetroModel.findOne({
              galera: matricula,
            });
            console.log("veiculo", selectedGalera);
            console.log("vehicleExists", vehicleExists);
            if (vehicleExists) {
              return res
                .status(400)
                .json({ message: "Vehicle is already present." });
            } else {
              // Find and update an available spot
              const lugar = await parquimetroModel.findOneAndUpdate(
                { ocupado: false },
                {
                  $set: {
                    galera: selectedGalera.matricula,
                    movel: selectedGalera.movel,
                    pronto: false,
                    ocupado: true,
                  },
                },
                { new: true } // Return the updated document
              );

              if (lugar) {
                // Successfully parked the vehicle
                return res.status(202).json({ selectedGalera, lugar });
              } else {
                // No available spot found
                return res
                  .status(404)
                  .json({ message: "No available spot found." });
              }
            }
          }
        }
      }
    } catch (error) {
      console.log("here", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
  disponiveis: async (req, res) => {
    try {
      const availableSpots = await galeraModel.find();
      res.status(200).json(availableSpots);
    } catch (error) {
      console.error("Error finding available spots:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

module.exports = galeraController;
