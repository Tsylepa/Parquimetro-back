// controllers/userController.js
const { User: UserModel } = require("../models/User");
const jwt = require("jsonwebtoken");

const userController = {
  // Criar um novo usuário
  create: async (req, res) => {
    try {
      const user = {
        colaborador: req.body.colaborador,
        nome: req.body.nome,
        funcao: req.body.funcao,
        password: req.body.password,
        role: req.body.role,
      };

      const response = await UserModel.create(user);
      res.status(200).json(response);
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      res.status(500).json({ msg: "Erro interno do servidor" });
    }
  },

  // Deletar um usuário
  delete: async (req, res) => {
    try {
      const { id } = req.body;
      const deleted = await UserModel.deleteOne({ _id: id });
      if (deleted.deletedCount > 0) {
        res.status(200).json({ msg: "Usuário eliminado" });
      } else {
        res.status(400).json({ msg: "Não foi possível eliminar o usuário" });
      }
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      res.status(500).json({ msg: "Erro interno do servidor" });
    }
  },

  // Login de usuário
  findUser: async (req, res) => {
    try {
      const { colaborador, password } = req.body;

      const user = await UserModel.findOne({ colaborador });

      if (!user) {
        return res.status(404).json({ msg: "Usuário não encontrado" });
      }

      if (user.password !== password) {
        return res.status(400).json({ msg: "Senha incorreta" });
      }

      const token = jwt.sign(
        { id: user._id, colaborador: user.colaborador, role: user.role },
        "secretKey",
        { expiresIn: "14d" },
      );

      return res.status(200).json({ token, user });
    } catch (error) {
      console.error("Erro no login:", error);
      return res.status(500).json({ msg: "Erro interno do servidor" });
    }
  },

  // Login de administrador
  findUserAdmin: async (req, res) => {
    try {
      const { colaborador, password } = req.body;
      const user = await UserModel.findOne({ colaborador });

      if (!user) return res.status(404).json({ msg: "Usuário não encontrado" });

      if (user.password !== password)
        return res.status(400).json({ msg: "Senha incorreta" });

      if (!user.role.includes("admin"))
        return res
          .status(403)
          .json({ msg: "Permissões de administrador necessárias" });

      const token = jwt.sign(
        { id: user._id, colaborador: user.colaborador, role: user.role },
        "secretKey",
        { expiresIn: "14d" },
      );

      return res.status(200).json({ token, user });
    } catch (error) {
      console.error("Erro no login admin:", error);
      return res.status(500).json({ msg: "Erro interno do servidor" });
    }
  },

  // Informações do usuário
  infoUser: async (req, res) => {
    try {
      const { id } = req.body;
      const user = await UserModel.findById(id);
      res.status(200).json(user);
    } catch (error) {
      console.error("Erro ao obter informações do usuário:", error);
      res.status(500).json({ msg: "Erro interno do servidor" });
    }
  },

  // Todos os usuários
  allUsers: async (req, res) => {
    try {
      const allUsers = await UserModel.find({}, { password: 0 });
      res.status(200).json(allUsers);
    } catch (error) {
      console.error("Erro ao obter todos os usuários:", error);
      res.status(500).json({ msg: "Erro interno do servidor" });
    }
  },

  // Todos os colaboradores
  findColaborador: async (req, res) => {
    try {
      const colaboradores = await UserModel.find(
        { funcao: "colaborador" },
        { password: 0 },
      );
      res.status(200).json(colaboradores);
    } catch (error) {
      console.error("Erro ao buscar colaboradores:", error);
      res.status(500).json({ msg: "Erro interno do servidor" });
    }
  },

  // Alterar informações do usuário
  changeInfoUser: async (req, res) => {
    try {
      const { id, colaborador, nome, funcao, password, role } = req.body;
      const updates = {};

      if (colaborador) updates.colaborador = colaborador;
      if (nome) updates.nome = nome;
      if (funcao) updates.funcao = funcao;
      if (password) updates.password = password;
      if (role) updates.role = role;

      const user = await UserModel.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true },
      );

      res.status(200).json(user);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      res.status(500).json({ msg: "Erro interno do servidor" });
    }
  },
};

module.exports = userController;
