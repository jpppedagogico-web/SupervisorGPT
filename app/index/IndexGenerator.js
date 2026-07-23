const fs = require("fs");
const path = require("path");

const Config = require("../config/Config");

class IndexGenerator {
    normalizar(texto = "") {
        return String(texto)
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\p{L}\p{N}\s]/gu, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    gerar() {
        const indice = {};

        if (!fs.existsSync(Config.JSON_PATH)) {
            throw new Error(
                `Pasta JSON não encontrada: ${Config.JSON_PATH}`
            );
        }

        const arquivos = fs
            .readdirSync(Config.JSON_PATH)
            .filter(arquivo =>
                arquivo.toLowerCase().endsWith(".json")
            );

        for (const arquivo of arquivos) {
            const caminhoArquivo = path.join(
                Config.JSON_PATH,
                arquivo
            );

            const documento = JSON.parse(
                fs.readFileSync(caminhoArquivo, "utf8")
            );

            const artigos = Array.isArray(documento.artigos)
                ? documento.artigos
                : [];

            for (const artigo of artigos) {
                const texto = this.normalizar(
                    `${artigo.marcador || ""} ${artigo.texto || ""}`
                );

                const palavrasUnicas = new Set(
                    texto
                        .split(" ")
                        .filter(palavra => palavra.length > 3)
                );

                for (const palavra of palavrasUnicas) {
                    if (!indice[palavra]) {
                        indice[palavra] = [];
                    }

                    indice[palavra].push({
                        documento: documento.nomeArquivo,
                        tipo: documento.tipo,
                        numero: documento.numero,
                        ano: documento.ano,
                        artigo: artigo.numero,
                        marcador: artigo.marcador
                    });
                }
            }
        }

        const caminhoIndice = path.join(
            Config.BASE,
            "base_conhecimento",
            "indice_invertido.json"
        );

        fs.writeFileSync(
            caminhoIndice,
            JSON.stringify(indice, null, 2),
            "utf8"
        );

        console.log(
            `✅ Índice invertido criado: ${caminhoIndice}`
        );

        return indice;
    }
}

module.exports = IndexGenerator;