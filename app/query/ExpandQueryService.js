const fs = require("fs");
const path = require("path");

const Config = require("../config/Config");

class ExpandQueryService {
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
            const conteudo = fs.readFileSync(
                this.caminhoDicionario,
                "utf8"
            );

            const dicionario = JSON.parse(conteudo);

            return {
                expressoes: Array.isArray(dicionario.expressoes)
                    ? dicionario.expressoes
                    : []
            };
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

    recarregar() {
        this.dicionario = this.carregarDicionario();
    }

    expandir(consulta, termosOriginais = []) {
        const pergunta = this.normalizar(consulta);

        const termosExpandidos = new Set(
            termosOriginais.map(termo =>
                this.normalizar(termo)
            )
        );

        for (const item of this.dicionario.expressoes) {
            const termoPrincipal = this.normalizar(
                item.termo || ""
            );

            const relacionados = Array.isArray(item.relacionados)
                ? item.relacionados
                    .map(termo => this.normalizar(termo))
                    .filter(Boolean)
                : [];

            const conceito = [
                termoPrincipal,
                ...relacionados
            ].filter(Boolean);

            const conceitoFoiIdentificado = conceito.some(
                termo => this.consultaContemTermo(
                    pergunta,
                    termo
                )
            );

            if (!conceitoFoiIdentificado) {
                continue;
            }

            /*
             * Inclui tanto o termo principal quanto os relacionados.
             * Expressões compostas também serão decompostas para que
             * possam ser consultadas no índice invertido.
             */
            for (const termo of conceito) {
                termosExpandidos.add(termo);

                for (const palavra of termo.split(" ")) {
                    if (palavra.length >= 3) {
                        termosExpandidos.add(palavra);
                    }
                }
            }
        }

        return [...termosExpandidos]
            .filter(Boolean);
    }

    consultaContemTermo(pergunta, termo) {
        if (!termo) {
            return false;
        }

        if (termo.includes(" ")) {
            return pergunta.includes(termo);
        }

        const regex = new RegExp(
            `\\b${this.escaparRegex(termo)}\\b`,
            "i"
        );

        return regex.test(pergunta);
    }

    escaparRegex(texto) {
        return texto.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );
    }
}

module.exports = ExpandQueryService;