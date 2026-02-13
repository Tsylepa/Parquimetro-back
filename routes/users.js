const router = require("express").Router();
const jwt = require("jsonwebtoken");
const { User: UserModel } = require("../models/User");

// Criar usuário
router.post("/", async (req, res) => {
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
    console.log(`Erro ao criar usuário: ${error}`);
    res.status(500).json({ msg: "Erro ao criar usuário" });
  }
});

// Login de usuário normal
router.post("/login", async (req, res) => {
  try {
    const nr_col = req.body.colaborador;
    const user = await UserModel.findOne({ colaborador: nr_col });

    if (!user) {
      res.status(404).json({ msg: "Usuário não encontrado." });
      return;
    }

    if (req.body.password !== user.password) {
      res.status(400).json({ msg: "Senha incorreta." });
      return;
    }

    const token = jwt.sign({ user }, "secretKey", { expiresIn: "14d" });
    res.status(200).json(token);
  } catch (error) {
    console.log(`Erro no login: ${error}`);
    res.status(500).json({ msg: "Erro no servidor." });
  }
});

// Login de admin
router.post("/loginAdmin", async (req, res) => {
  try {
    const nr_col = req.body.colaborador;
    const user = await UserModel.findOne({ colaborador: nr_col });

    if (!user) {
      res.status(404).json({ msg: "Usuário não encontrado." });
      return;
    }

    if (req.body.password !== user.password) {
      res.status(400).json({ msg: "Senha incorreta." });
      return;
    }

    if (!user.role.includes("admin")) {
      res
        .status(403)
        .json({ msg: "Você não tem permissões de administrador." });
      return;
    }

    const token = jwt.sign({ user }, "secretKey", { expiresIn: "14d" });
    res.status(200).json(token);
  } catch (error) {
    console.log(`Erro no login admin: ${error}`);
    res.status(500).json({ msg: "Erro no servidor." });
  }
});

// Listar todos os usuários (sem senha)
router.get("/findall", async (req, res) => {
  try {
    const allUsers = await UserModel.find({}, { password: 0 });
    res.status(200).json(allUsers);
  } catch (error) {
    console.log(`Erro ao buscar usuários: ${error}`);
    res.status(500).json({ msg: "Erro ao buscar usuários" });
  }
});

// Buscar colaboradores
router.get("/findCol", async (req, res) => {
  try {
    const colaboradores = await UserModel.find(
      { funcao: "colaborador" },
      { password: 0 },
    );
    res.status(200).json(colaboradores);
  } catch (error) {
    console.log(`Erro ao buscar colaboradores: ${error}`);
    res.status(500).json({ msg: "Erro ao buscar colaboradores" });
  }
});

// Buscar info de um usuário
router.post("/find", async (req, res) => {
  try {
    const user = await UserModel.findById(req.body.id);
    res.status(200).json(user);
  } catch (error) {
    console.log(`Erro ao buscar usuário: ${error}`);
    res.status(500).json({ msg: "Erro ao buscar usuário" });
  }
});

// Deletar usuário
router.delete("/remover", async (req, res) => {
  try {
    const deleted = await UserModel.deleteOne({ _id: req.body.id });
    if (deleted.deletedCount) {
      res.status(200).json({ msg: "Usuário eliminado" });
    } else {
      res.status(400).json({ msg: "Não foi possível eliminar" });
    }
  } catch (error) {
    console.log(`Erro ao eliminar usuário: ${error}`);
    res.status(500).json({ msg: "Erro ao eliminar usuário" });
  }
});

// Editar usuário
router.post("/edit", async (req, res) => {
  try {
    const updates = {};
    ["colaborador", "nome", "funcao", "password", "role"].forEach((field) => {
      if (req.body[field] !== undefined && req.body[field] !== "") {
        updates[field] = req.body[field];
      }
    });

    const user = await UserModel.findByIdAndUpdate(
      req.body.id,
      { $set: updates },
      { new: true },
    );

    res.status(200).json(user);
  } catch (error) {
    console.log(`Erro ao editar usuário: ${error}`);
    res.status(500).json({ msg: "Erro ao editar usuário" });
  }
});

module.exports = router;
