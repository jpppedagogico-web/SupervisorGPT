class ContextBuilder {

    constructor() {
        // Aproximadamente 4 a 5 mil tokens de contexto.
        // Deixa espaço para pergunta, instruções e resposta da IA.
        this.limiteTotalCaracteres = 18000;

        // Impede que um único artigo gigantesco ocupe todo o contexto.
        this.limitePorArtigo = 5000;

        // Número máximo de artigos enviados à IA.
        this.maximoArtigos = 6;
    }

    selecionar(resultados = []) {

        if (!Array.isArray(resultados)) {
            return [];
        }

        const selecionados = [];

        let caracteresUsados = 0;

        for (const resultado of resultados) {

            if (
                selecionados.length >=
                this.maximoArtigos
            ) {
                break;
            }

            const texto = String(
                resultado.texto || ""
            );

            const textoLimitado =
                texto.length > this.limitePorArtigo
                    ? texto.slice(
                        0,
                        this.limitePorArtigo
                    ) +
                    "\n\n[Trecho reduzido por limite de contexto]"
                    : texto;

            const estimativa =
                textoLimitado.length + 300;

            if (
                caracteresUsados + estimativa >
                this.limiteTotalCaracteres
            ) {
                continue;
            }

            selecionados.push({
                ...resultado,
                texto: textoLimitado
            });

            caracteresUsados += estimativa;
        }

        return selecionados;
    }

    montar(resultados = []) {

        if (!resultados.length) {
            return "Nenhum contexto encontrado.";
        }

        let contexto = "";

        let documentoAtual = "";

        resultados.forEach(resultado => {

            const nomeDocumento =
                `${resultado.tipo} ${resultado.numero}/${resultado.ano}`;

            if (nomeDocumento !== documentoAtual) {

                documentoAtual = nomeDocumento;

                contexto +=
`==================================================
${nomeDocumento.toUpperCase()}
==================================================

`;
            }

            contexto +=
`ARTIGO ${resultado.artigo}

${resultado.texto}

--------------------------------------------------

`;
        });

        return contexto;
    }
}

module.exports = ContextBuilder;