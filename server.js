const express = require("express");
const cors = require("cors");
require("dotenv").config();

const chatRoute = require("./routes/chat");
const adminRoute = require("./routes/admin");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

app.use("/chat", chatRoute);
app.use("/api/admin", adminRoute);

/*
 * Rota usada para verificar se o serviço está funcionando.
 */
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        aplicacao: "SupervisorGPT",
        versao: "1.0.0",
        data: new Date().toISOString()
    });
});

/*
 * Usa a porta fornecida pelo Render.
 * Localmente, continua usando 3000.
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `SupervisorGPT rodando na porta ${PORT}`
    );
});