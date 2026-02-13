const { Viatura: ViaturaModel } = require("../models/User");

const viaturaModel = {
  findUser: async (req, res) => {
    try {
      const nr_col = req.body.nr_col;
      console.log(req.body);
      const user = await UserModel.findOne({ nr_col: nr_col });
      console.log(user);
      if (!user) {
        res.status(404).json({ msg: "Serviço não encontrado." });
        return;
      } else {
        const data = req.body;
        if (data.password != user.password) {
          res.status(400).json({ msg: "A password está incorreta" });
        } else {
          res.status(200).json(user);
        }
      }
    } catch (error) {
      console.log(`erro: ${error}`);
    }
  },
};

module.exports = viaturaModel;
