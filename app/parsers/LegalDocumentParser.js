class LegalDocumentParser {
    parse(texto, nomeArquivo) {
        const textoSeguro = String(texto || "");
        const nomeSeguro = String(nomeArquivo || "");

        const artigos = this.extrairArtigos(textoSeguro);

        return {
            nomeArquivo: nomeSeguro,
            tipo: this.identificarTipo(nomeSeguro, textoSeguro),
            numero: this.identificarNumero(nomeSeguro, textoSeguro),
            ano: this.identificarAno(nomeSeguro, textoSeguro),
            quantidadeArtigos: artigos.length,
            artigos,
            textoCompleto: textoSeguro
        };
    }

    identificarTipo(nomeArquivo, texto) {
        /*
         * O nome do arquivo recebe prioridade porque representa
         * diretamente o documento processado.
         */
        const nome = String(nomeArquivo).toLowerCase();
        const inicioTexto = String(texto)
            .slice(0, 1000)
            .toLowerCase();

        const base = `${nome} ${inicioTexto}`;

        if (base.includes("deliberação")) return "Deliberação";
        if (base.includes("resolução")) return "Resolução";
        if (base.includes("parecer")) return "Parecer";
        if (base.includes("portaria")) return "Portaria";
        if (base.includes("indicação")) return "Indicação";
        if (base.includes("comunicado")) return "Comunicado";
        if (base.includes("retificação")) return "Retificação";
        if (base.includes("instrução")) return "Instrução";
        if (base.includes("decreto")) return "Decreto";
        if (base.includes("lei complementar")) return "Lei Complementar";
        if (base.includes("lei")) return "Lei";

        return "Documento";
    }

    identificarNumero(nomeArquivo, texto) {
        const nome = String(nomeArquivo);
        const inicioTexto = String(texto).slice(0, 1000);

        /*
         * Reconhece, por exemplo:
         * nº 155
         * nº 69.665
         * Resolução 95-2024
         * Deliberação 155/2017
         */
        const padroes = [
            /(?:n[ºo°.]?\s*)(\d{1,3}(?:\.\d{3})*|\d+)/i,
            /(?:deliberação|resolução|decreto|lei|portaria|parecer|indicação)\s+(?:n[ºo°.]?\s*)?(\d{1,3}(?:\.\d{3})*|\d+)/i,
            /(\d{1,3}(?:\.\d{3})*|\d+)\s*[/-]\s*(?:19|20)?\d{2}/i
        ];

        for (const base of [nome, inicioTexto]) {
            for (const padrao of padroes) {
                const match = base.match(padrao);

                if (match) {
                    return match[1];
                }
            }
        }

        return null;
    }

    identificarAno(nomeArquivo, texto) {
        const nomeNormalizado = String(nomeArquivo);

        /*
         * Exemplos:
         * 155-17
         * 155-2017
         * 155/2017
         */
        const matchNomeComNumero = nomeNormalizado.match(
            /\d{1,3}(?:\.\d{3})*\s*[/-]\s*(\d{2}|\d{4})/i
        );

        if (matchNomeComNumero) {
            return this.normalizarAno(matchNomeComNumero[1]);
        }

        /*
         * Procura qualquer ano completo no nome.
         */
        const anoNoNome = nomeNormalizado.match(/\b(?:19|20)\d{2}\b/);

        if (anoNoNome) {
            return anoNoNome[0];
        }

        /*
         * Só consulta o começo do texto para evitar capturar
         * anos de outras normas citadas no documento.
         */
        const inicioDocumento = String(texto).slice(0, 1200);

        const matchTextoComNumero = inicioDocumento.match(
            /\d{1,3}(?:\.\d{3})*\s*[/-]\s*(\d{2}|\d{4})/i
        );

        if (matchTextoComNumero) {
            return this.normalizarAno(matchTextoComNumero[1]);
        }

        /*
         * Procura datas como:
         * 30 de junho de 2025
         */
        const anoEmData = inicioDocumento.match(
            /\b(?:janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+((?:19|20)\d{2})\b/i
        );

        if (anoEmData) {
            return anoEmData[1];
        }

        const anoCompleto = inicioDocumento.match(/\b(?:19|20)\d{2}\b/);

        return anoCompleto ? anoCompleto[0] : null;
    }

    normalizarAno(ano) {
        const valor = String(ano);

        if (valor.length === 4) {
            return valor;
        }

        const numero = Number(valor);

        return numero <= 30
            ? `20${valor.padStart(2, "0")}`
            : `19${valor.padStart(2, "0")}`;
    }

    extrairArtigos(texto) {
        const textoNormalizado = String(texto || "")
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n");

        /*
         * Reconhece:
         *
         * Art. 1º
         * Art 1º
         * Artigo 1º
         * ARTIGO 1º
         * Artigo 1.º
         * Artigo 1°
         * Artigo único
         *
         * Não exige início de linha porque alguns PDFs são
         * extraídos como um único parágrafo contínuo.
         */
        const regex =
            /\b(Art(?:igo|\.)?\s+(?:\d+[A-Za-z]?|Único)(?:\s*[º°ª.]*)?)\s*(?:[-–—:]\s*)?/giu;

        const marcadores = [];
        let match;

        while ((match = regex.exec(textoNormalizado)) !== null) {
            marcadores.push({
                marcador: match[1].trim(),
                inicio: match.index,
                fimCabecalho: regex.lastIndex
            });
        }

        const artigos = [];

        for (let i = 0; i < marcadores.length; i++) {
            const atual = marcadores[i];
            const proximo = marcadores[i + 1];

            const fimConteudo = proximo
                ? proximo.inicio
                : textoNormalizado.length;

            const conteudo = textoNormalizado
                .slice(atual.fimCabecalho, fimConteudo)
                .trim();

            const numeroMatch = atual.marcador.match(/\d+[A-Za-z]?/i);

            let numero = numeroMatch
                ? numeroMatch[0]
                : null;

            if (
                !numero &&
                atual.marcador.toLowerCase().includes("único")
            ) {
                numero = "Único";
            }

            /*
             * Evita registrar marcadores vazios ou falsos positivos
             * sem conteúdo significativo.
             */
            if (conteudo.length > 0) {
                artigos.push({
                    numero,
                    marcador: atual.marcador,
                    texto: conteudo
                });
            }
        }

        /*
         * Documentos como retificações, comunicados e pareceres
         * podem não ter divisão formal em artigos.
         *
         * Nesse caso, o texto integral vira um bloco consultável.
         */
        if (
            artigos.length === 0 &&
            textoNormalizado.trim().length > 100
        ) {
            artigos.push({
                numero: "Texto",
                marcador: "Texto Integral",
                texto: textoNormalizado.trim()
            });
        }

        return artigos;
    }
}

module.exports = LegalDocumentParser;