class ContextBuilder {

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