const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const AdminService = require("../app/admin/AdminService");
const Config = require("../app/config/Config");


// ========================================
// RESUMO DA BASE
// ========================================

router.get("/resumo", (req, res) => {

    const admin = new AdminService();

    const dados = admin.getResumo();

    res.json(dados);

});


// ========================================
// BIBLIOTECA
// ========================================

router.get("/biblioteca", (req, res) => {

    try {

        const arquivos = fs
            .readdirSync(Config.JSON_PATH)
            .filter(nome =>
                nome.toLowerCase().endsWith(".json")
            );

        const documentos = [];

        for (const arquivo of arquivos) {

            const caminho = path.join(
                Config.JSON_PATH,
                arquivo
            );

            try {

                const documento = JSON.parse(
                    fs.readFileSync(
                        caminho,
                        "utf8"
                    )
                );

                documentos.push({

                    nomeArquivo:
                        documento.nomeArquivo ||
                        arquivo,

                    tipo:
                        documento.tipo ||
                        "Documento",

                    numero:
                        documento.numero ||
                        "",

                    ano:
                        documento.ano ||
                        "",

                    quantidadeArtigos:
                        Array.isArray(documento.artigos)
                            ? documento.artigos.length
                            : 0

                });

            } catch (erro) {

                console.error(
                    `Erro ao ler ${arquivo}:`,
                    erro.message
                );

            }
        }

        documentos.sort((a, b) => {

            const nomeA =
                `${a.tipo} ${a.numero}/${a.ano}`;

            const nomeB =
                `${b.tipo} ${b.numero}/${b.ano}`;

            return nomeA.localeCompare(
                nomeB,
                "pt-BR"
            );

        });

        res.json({
            total: documentos.length,
            documentos
        });

    } catch (erro) {

        console.error(
            "Erro ao carregar biblioteca:",
            erro
        );

        res.status(500).json({
            erro:
                "Não foi possível carregar a biblioteca."
        });

    }

});


// ========================================
// VISUALIZAR DOCUMENTO DA BIBLIOTECA
// ========================================

router.get(
    "/biblioteca/documento/:arquivo",
    (req, res) => {

        try {

            const arquivo = path.basename(
                req.params.arquivo
            );

            const nomeJSON =
                arquivo.replace(
                    /\.pdf$/i,
                    ".json"
                );

            const caminho = path.join(
                Config.JSON_PATH,
                nomeJSON
            );

            if (!fs.existsSync(caminho)) {

                return res.status(404).json({
                    erro:
                        "Documento não encontrado."
                });

            }

            const documento = JSON.parse(
                fs.readFileSync(
                    caminho,
                    "utf8"
                )
            );

            res.json({

                nomeArquivo:
                    documento.nomeArquivo,

                tipo:
                    documento.tipo,

                numero:
                    documento.numero,

                ano:
                    documento.ano,

                artigos:
                    documento.artigos || []

            });

        } catch (erro) {

            console.error(
                "Erro ao abrir documento:",
                erro
            );

            res.status(500).json({
                erro:
                    "Não foi possível abrir o documento."
            });

        }

    }
);

// ========================================
// PESQUISA JURÍDICA
// ========================================

router.get("/pesquisa", (req, res) => {

    try {

        const consulta =
            String(req.query.q || "").trim();

        if (!consulta) {

            return res.status(400).json({
                erro: "Informe um termo para pesquisa."
            });

        }

        const SearchService =
            require("../app/search/SearchService");

        const busca =
            new SearchService();

        const resultados =
            busca.buscar(consulta, 20);

        res.json({
            consulta,
            total: resultados.length,
            resultados
        });

    } catch (erro) {

        console.error(
            "Erro na pesquisa jurídica:",
            erro
        );

        res.status(500).json({
            erro:
                "Não foi possível realizar a pesquisa."
        });

    }

});

module.exports = router;