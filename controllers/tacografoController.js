const { Tacografo: tacografoModel } = require("../models/Tacografo");
const moment = require("moment");

const tacografoController = {
  create: async (req, res) => {
    try {
      const tacografosData = req.body; // Assuming req.body contains an array of Tacografo objects

      const createdTacografos = await Promise.all(
        tacografosData.map(async (tacografoData) => {
          return await tacografoModel.create(tacografoData);
        })
      );

      res.status(201).json({
        tacografos: createdTacografos,
        msg: "Tacografos criados com sucesso!",
      });
    } catch (error) {
      console.error(`Error: ${error}`);
      res.status(500).json({ error: "Internal server error" });
    }
  },
  findTac: async (req, res) => {
    try {
      const { nr_col, startDate, endDate } = req.body;

      // Parse startDate and endDate strings into JavaScript Date objects
      const startDateTime = new Date(startDate);
      const endDateTime = new Date(endDate);

      // Ensure that the startDateTime and endDateTime are valid Date objects
      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        throw new Error("Invalid date format");
      }

      // Find documents matching the criteria and sort them in descending order by timerStartTime
      const users = await tacografoModel
        .find({
          colaborador: nr_col,
          timerStartTime: { $gte: startDateTime, $lte: endDateTime },
        })
        .sort({ timerStartTime: -1 }) // Sort in descending order
        .select("nome timer timerStartTime timerEndTime");

      // Create a new array to hold the updated list of documents
      const updatedUsers = [];

      // Iterate through the documents
      for (let i = 0; i < users.length - 1; i++) {
        updatedUsers.push(users[i]);

        if (users[i + 1]) {
          const timeDifference =
            (users[i + 1].timerStartTime - users[i].timerEndTime) / 1000; // Calculate time difference in seconds
          const roundedTimeDifference = Math.round(timeDifference); // Round to nearest second

          // If the time difference is greater than a certain threshold (e.g., 5 hours), insert a new document
          if (roundedTimeDifference > 5 * 60 * 60) {
            // 5 hours in seconds
            const newDocument = {
              _id: `descanso-${i}`, // Use a unique identifier for the "Descanso" documents
              nome: "Descanso",
              timer: roundedTimeDifference, // Rounded time difference in seconds
              timerStartTime: users[i].timerEndTime,
              timerEndTime: users[i + 1].timerStartTime,
            };
            updatedUsers.push(newDocument);
          }
        }
      }

      // Add the last document to the updated list
      if (users.length > 0) {
        updatedUsers.push(users[users.length - 1]);
      }

      console.log(updatedUsers);
      res.status(200).json(updatedUsers);
    } catch (error) {
      console.error("Error finding documents:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  ping: async (req, res) => {
    console.log("teste");
    res.status(200).json({ message: "Tacogrfo works" });
  },
};

module.exports = tacografoController;
