const fs = require("fs");
const path = require("path");

const Config = require("../config/Config");

class RankingService {
    constructor() {
        this.caminhoDicionario = path.join(
            Config.BASE,
            "base_conhecimento",
            "dicionario_juridico.json"
        );

        this.dicionario = this.carregarDicionario();
    }

    normalizar(texto = "") {
        return String(texto)
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\p{L}\p{N}\s]/gu, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    carregarDicionario() {
        if (!fs.existsSync(this.caminhoDicionario)) {
            console.warn(
                "Dicionário jurídico não encontrado:",
                this.caminhoDicionario
            );

            return {
                expressoes: []
            };
        }

        try {
            return JSON.parse(
                fs.readFileSync(
                    this.caminhoDicionario,
                    "utf8"
                )
            );
        } catch (erro) {
            console.error(
                "Erro ao carregar o dicionário jurídico:",
                erro.message
            );

            return {
                expressoes: []
            };
        }
    }

    calcular(consulta, artigo) {
        const pergunta = this.normalizar(consulta);

        const texto = this.normalizar(
            [
                artigo.marcador || "",
                artigo.texto || ""
            ].join(" ")
        );

        let pontos = 0;

        if (texto.includes(pergunta)) {
            pontos += 100;
        }

        for (const item of this.dicionario.expressoes || []) {
            const termoPrincipal = this.normalizar(item.termo);
            const peso = Number(item.peso) || 0;

            const termosDoConceito = [
                termoPrincipal,
                ...(item.relacionados || []).map(termo =>
                    this.normalizar(termo)
                )
            ];

            const perguntaPossuiConceito =
                termosDoConceito.some(termo =>
                    pergunta.includes(termo)
                );

            if (!perguntaPossuiConceito) {
                continue;
            }

            const textoPossuiPrincipal =
                texto.includes(termoPrincipal);

            if (textoPossuiPrincipal) {
                pontos += peso;
            }

            for (const relacionado of termosDoConceito.slice(1)) {
                if (texto.includes(relacionado)) {
                    pontos += Math.round(peso * 0.6);
                }
            }
        }

        const palavras = pergunta
            .split(" ")
            .filter(palavra => palavra.length >= 3);

        for (const palavra of palavras) {
            const regex = new RegExp(
                `\\b${this.escaparRegex(palavra)}\\b`,
                "g"
            );

            const ocorrencias =
                texto.match(regex)?.length || 0;

            pontos += ocorrencias * 2;
        }

        return pontos;
    }

    escaparRegex(texto) {
        return texto.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );
    }
}

module.exports = RankingService;