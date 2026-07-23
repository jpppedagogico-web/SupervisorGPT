const RankingService = require("../ranking/RankingService");
const fs = require("fs");
const path = require("path");

const Config = require("../config/Config");

class SearchService {
    constructor() {
        this.caminhoIndice = path.join(
            Config.BASE,
            "base_conhecimento",
            "indice_invertido.json"
        );

        this.palavrasIgnoradas = new Set([
            "a", "ao", "aos", "as", "o", "os",
            "de", "da", "das", "do", "dos",
            "e", "em", "no", "nos", "na", "nas",
            "um", "uma", "uns", "umas",
            "que", "qual", "quais", "como",
            "por", "para", "com", "sem",
            "ser", "sobre", "isto", "isso",
            "eh", "é", "funciona", "funcionar",
            "pode", "podem", "deve", "devem"
        ]);
    }

    normalizarTexto(texto = "") {
        return String(texto)
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\p{L}\p{N}\s]/gu, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    extrairTermos(consulta) {
        return [
            ...new Set(
                this.normalizarTexto(consulta)
                    .split(" ")
                    .filter(palavra =>
                        palavra.length >= 3 &&
                        !this.palavrasIgnoradas.has(palavra)
                    )
            )
        ];
    }

    escaparRegex(texto) {
        return texto.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );
    }

    carregarIndice() {
        if (!fs.existsSync(this.caminhoIndice)) {
            throw new Error(
                "Índice invertido não encontrado. " +
                "Execute node scripts/UpdateKnowledgeBase.js."
            );
        }

        return JSON.parse(
            fs.readFileSync(this.caminhoIndice, "utf8")
        );
    }

    localizarCandidatos(indice, termos) {
        const candidatos = new Map();

        for (const termo of termos) {
            const ocorrencias = indice[termo] || [];

            for (const ocorrencia of ocorrencias) {
                const chave = [
                    ocorrencia.documento,
                    ocorrencia.artigo
                ].join("::");

                if (!candidatos.has(chave)) {
                    candidatos.set(chave, {
                        ...ocorrencia,
                        termosEncontrados: new Set(),
                        pontuacaoIndice: 0
                    });
                }

                const candidato = candidatos.get(chave);

                candidato.termosEncontrados.add(termo);
                candidato.pontuacaoIndice += 5;
            }
        }

        return [...candidatos.values()];
    }

    carregarDocumento(nomeArquivo) {
        const nomeJSON = nomeArquivo.replace(
            /\.pdf$/i,
            ".json"
        );

        const caminhoJSON = path.join(
            Config.JSON_PATH,
            nomeJSON
        );

        if (!fs.existsSync(caminhoJSON)) {
            return null;
        }

        try {
            return JSON.parse(
                fs.readFileSync(caminhoJSON, "utf8")
            );
        } catch (erro) {
            console.error(
                `Erro ao abrir ${nomeJSON}:`,
                erro.message
            );

            return null;
        }
    }

    localizarArtigo(documento, numeroArtigo) {
        if (!Array.isArray(documento?.artigos)) {
            return null;
        }

        return documento.artigos.find(
            artigo =>
                String(artigo.numero) ===
                String(numeroArtigo)
        ) || null;
    }

    calcularPontuacao(
        texto,
        termos,
        consulta,
        pontuacaoIndice
    ) {
        const textoNormalizado =
            this.normalizarTexto(texto);

        const consultaNormalizada =
            this.normalizarTexto(consulta);

        let pontuacao = pontuacaoIndice;

        let termosPresentes = 0;

        for (const termo of termos) {
            const regex = new RegExp(
                `\\b${this.escaparRegex(termo)}\\b`,
                "g"
            );

            const ocorrencias =
                textoNormalizado.match(regex)?.length || 0;

            if (ocorrencias > 0) {
                termosPresentes += 1;
            }

            pontuacao += ocorrencias * 3;
        }

        // Valoriza artigos que reúnem vários termos da pergunta.
        pontuacao += termosPresentes * termosPresentes * 4;

        // Valoriza a frase completa.
        if (
            consultaNormalizada.length > 4 &&
            textoNormalizado.includes(consultaNormalizada)
        ) {
            pontuacao += 30;
        }

        // Valoriza expressões consecutivas da pergunta.
        const expressoes = this.criarExpressoes(termos);

        for (const expressao of expressoes) {
            if (textoNormalizado.includes(expressao)) {
                pontuacao += 15;
            }
        }

        return pontuacao;
    }

    criarExpressoes(termos) {
        const expressoes = [];

        for (let tamanho = 2; tamanho <= 3; tamanho++) {
            for (
                let inicio = 0;
                inicio <= termos.length - tamanho;
                inicio++
            ) {
                expressoes.push(
                    termos
                        .slice(inicio, inicio + tamanho)
                        .join(" ")
                );
            }
        }

        return expressoes;
    }

    buscar(consulta, limiteArtigos = 3) {
        if (!consulta?.trim()) {
            return [];
        }

        const termos = this.extrairTermos(consulta);

        if (termos.length === 0) {
            return [];
        }

        const indice = this.carregarIndice();

        const candidatos = this.localizarCandidatos(
            indice,
            termos
        );

        const cacheDocumentos = new Map();
        const resultados = [];
        const ranking = new RankingService();

        for (const candidato of candidatos) {
            let documento = cacheDocumentos.get(
                candidato.documento
            );

            if (!documento) {
                documento = this.carregarDocumento(
                    candidato.documento
                );

                if (documento) {
                    cacheDocumentos.set(
                        candidato.documento,
                        documento
                    );
                }
            }

            if (!documento) {
                continue;
            }

            const artigo = this.localizarArtigo(
                documento,
                candidato.artigo
            );

            if (!artigo) {
                continue;
            }

            const textoArtigo = [
                artigo.marcador,
                artigo.texto
            ]
                .filter(Boolean)
                .join(" ");

            const pontuacao =

                this.calcularPontuacao(
                textoArtigo,
                termos,
                consulta,
                candidato.pontuacaoIndice
    )

    +

    ranking.calcular(
        consulta,
        artigo
    );

            resultados.push({
                nomeArquivo: documento.nomeArquivo,
                tipo: documento.tipo || "Documento",
                numero: documento.numero || null,
                ano: documento.ano || null,
                artigo: artigo.numero || null,
                marcador: artigo.marcador || null,
                texto: artigo.texto || "",
                pontuacao
            });
        }

        return resultados
            .sort((a, b) => b.pontuacao - a.pontuacao)
            .slice(0, limiteArtigos);
    }
}

module.exports = SearchService;