const express = require("express");
const router = express.Router();

const AdminService = require("../app/admin/AdminService");

router.get("/resumo", (req, res) => {

    const admin = new AdminService();

    const dados = admin.getResumo();

    res.json(dados);

});

module.exports = router;