const express = require("express");

const SearchService = require("../app/search/SearchService");
const AIService = require("../app/ai/AIService");
const ContextBuilder = require("../app/context/ContextBuilder");

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const pergunta = req.body.pergunta?.trim();

        if (!pergunta) {
            return res.status(400).json({
                erro: "Informe uma pergunta."
            });
        }

        const busca = new SearchService();
        const trechos = busca.buscar(pergunta);

        const builder = new ContextBuilder();

        const trechosSelecionados = builder.selecionar(trechos);

        if (trechos.length === 0) {
            return res.json({
                resposta:
                    "Não encontrei essa informação na base consultada.",
                documentosEncontrados: 0,
                fontes: []
            });
        }

        const ia = new AIService();
        const resposta = await ia.responder(
            pergunta,
            trechosSelecionados
        );

        const fontes = trechosSelecionados.map(
            trecho => ({
                nomeArquivo: trecho.nomeArquivo,
                tipo: trecho.tipo,
                numero: trecho.numero,
                ano: trecho.ano,
                artigo: trecho.artigo,
                marcador: trecho.marcador,
                texto: trecho.texto
        }));

        res.json({
            resposta,
            documentosEncontrados:
                new Set(
                    fontes.map(fonte => fonte.nomeArquivo)
                ).size,
            trechosEncontrados: trechos.length,
            fontes
        });
    } catch (erro) {
        console.error("Erro na rota /chat:", erro);

        res.status(500).json({
            erro: "Erro ao processar a pergunta."
        });
    }
});

module.exports = router;