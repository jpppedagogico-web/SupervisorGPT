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

        const normalizar = valor =>
            String(valor || "")
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, " ")
                .trim();


        const nome = normalizar(nomeArquivo);

        /*
         * 1. PRIORIDADE MÁXIMA:
         * identificar pelo nome do arquivo.
         *
         * Isso evita que referências a outras normas
         * dentro do documento alterem sua classificação.
         */

        if (nome.includes("resolucao")) {
            return "Resolução";
        }

        if (nome.includes("deliberacao")) {
            return "Deliberação";
        }

        if (nome.includes("decreto")) {
            return "Decreto";
        }

        if (nome.includes("lei complementar")) {
            return "Lei Complementar";
        }

        if (nome.includes("lei")) {
            return "Lei";
        }

        if (nome.includes("portaria")) {
            return "Portaria";
        }

        if (nome.includes("parecer")) {
            return "Parecer";
        }

        if (nome.includes("indicacao")) {
            return "Indicação";
        }

        if (nome.includes("comunicado")) {
            return "Comunicado";
        }

        if (nome.includes("retificacao")) {
            return "Retificação";
        }

        if (nome.includes("instrucao")) {
            return "Instrução";
        }


        /*
         * 2. Se o nome não informar o tipo,
         * procurar apenas no cabeçalho inicial.
         *
         * Usamos somente os primeiros 400 caracteres
         * para reduzir o risco de encontrar normas
         * apenas citadas pelo documento.
         */

        const cabecalho =
            normalizar(
                String(texto || "").slice(0, 400)
            );


        const padroes = [
            {
                regex: /\bresolucao\b/,
                tipo: "Resolução"
            },
            {
                regex: /\bdeliberacao\b/,
                tipo: "Deliberação"
            },
            {
                regex: /\bdecreto\b/,
                tipo: "Decreto"
            },
            {
                regex: /\blei complementar\b/,
                tipo: "Lei Complementar"
            },
            {
                regex: /\blei\b/,
                tipo: "Lei"
            },
            {
                regex: /\bportaria\b/,
                tipo: "Portaria"
            },
            {
                regex: /\bparecer\b/,
                tipo: "Parecer"
            },
            {
                regex: /\bindicacao\b/,
                tipo: "Indicação"
            },
            {
                regex: /\bcomunicado\b/,
                tipo: "Comunicado"
            },
            {
                regex: /\bretificacao\b/,
                tipo: "Retificação"
            },
            {
                regex: /\binstrucao\b/,
                tipo: "Instrução"
            }
        ];


        for (const item of padroes) {

            if (item.regex.test(cabecalho)) {
                return item.tipo;
            }

        }


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

        const nome = String(nomeArquivo || "");
        const conteudo = String(texto || "");

        /*
         * 1. PRIORIDADE MÁXIMA:
         * ano explícito no nome do arquivo.
         */

        const anosNome =
            nome.match(/\b(?:19|20)\d{2}\b/g);

        if (anosNome && anosNome.length > 0) {
            return anosNome[anosNome.length - 1];
        }


        /*
         * 2. Procura no cabeçalho uma identificação
         * formal da própria norma acompanhada de data.
         *
         * Exemplos:
         *
         * RESOLUÇÃO SEDUC Nº 162,
         * DE 9 DE DEZEMBRO DE 2025
         *
         * DECRETO Nº 69.665,
         * DE 30 DE JUNHO DE 2025
         */

        const cabecalho =
            conteudo.slice(0, 2000);

        const normaComData =
            cabecalho.match(
                /(?:resolu[cç][aã]o|delibera[cç][aã]o|decreto|portaria|parecer|indica[cç][aã]o|lei(?:\s+complementar)?)\s+(?:seduc\s+|cee\s+)?(?:n[º°o.]?\s*)?\d{1,3}(?:\.\d{3})*[^\n]{0,120}?\bde\s+\d{1,2}\s+de\s+(?:janeiro|fevereiro|mar[cç]o|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+((?:19|20)\d{2})\b/i
            );

        if (normaComData) {
            return normaComData[1];
        }


        /*
         * 3. Se o nome não contém ano e não encontramos
         * cabeçalho formal, procura número/ano da norma.
         *
         * Isso atende:
         * LDB -> Lei nº 9.394/1996
         * ECA -> Lei nº 8.069/1990
         */

        const inicioDocumento =
            conteudo.slice(0, 6000);

        const numeroAnoTexto =
            inicioDocumento.match(
                /(?:lei(?:\s+complementar)?|resolu[cç][aã]o|delibera[cç][aã]o|decreto|portaria|parecer|indica[cç][aã]o)?\s*(?:n[º°o.]?\s*)?(\d{1,3}(?:\.\d{3})*)\s*[/-]\s*((?:19|20)?\d{2})\b/i
            );

        if (numeroAnoTexto) {
            return this.normalizarAno(
                numeroAnoTexto[2]
            );
        }


        /*
         * 4. Procura data formal.
         */

        const dataFormal =
            inicioDocumento.match(
                /\bde\s+\d{1,2}\s+de\s+(?:janeiro|fevereiro|mar[cç]o|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+((?:19|20)\d{2})\b/i
            );

        if (dataFormal) {
            return dataFormal[1];
        }


        /*
         * 5. Último recurso:
         * primeiro ano encontrado no conteúdo.
         */

        const anoGenerico =
            inicioDocumento.match(
                /\b(?:19|20)\d{2}\b/
            );

        return anoGenerico
            ? anoGenerico[0]
            : null;
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
         * Algumas Resoluções possuem referências jurídicas
         * no preâmbulo antes da palavra "Resolve:".
         *
         * Exemplo:
         * Constituição Federal, Artigo 208º...
         *
         * Quando "Resolve:" estiver presente, somente
         * candidatos posteriores a ele poderão constituir
         * artigos estruturais da própria norma.
         */

        let inicioParteNormativa = 0;

        const resolveMatch =
            textoNormalizado.match(/\bresolve(?:m)?\s*:/i);

        if (resolveMatch) {
            inicioParteNormativa =
                resolveMatch.index + resolveMatch[0].length;
        }


        /*
         * Reconhece candidatos:
         *
         * Art. 1º
         * Art 1º
         * Artigo 1º
         * ARTIGO 1º
         * Artigo 1.°
         * Artigo único
         *
         * Não exige início de linha porque muitos PDFs
         * são extraídos como texto contínuo.
         */

        const regex =
            /\b(Art(?:igo|\.)?\s+(?:\d+[A-Za-z]?|Único)(?:\s*[º°ª.]*)?)/giu;

        const candidatos = [];

        let match;

        while ((match = regex.exec(textoNormalizado)) !== null) {

            const marcador = match[1].trim();

            const inicio = match.index;
            const fimMarcador = regex.lastIndex;


            /*
             * 1. Ignora referências localizadas no
             * preâmbulo quando existe "Resolve:".
             */

            if (inicio < inicioParteNormativa) {
                continue;
            }


            /*
             * Observa o conteúdo posterior ao marcador.
             */

            const depois = textoNormalizado
                .slice(fimMarcador, fimMarcador + 140)
                .replace(/\s+/g, " ")
                .trim();

            const depoisNormalizado = depois
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");


            /*
             * Exemplos rejeitados:
             *
             * artigo 12 da Deliberação...
             * artigo 43 da Resolução...
             * artigo 2º desta resolução...
             * artigo 38, do Decreto...
             */

            const ehReferenciaPosterior =
                /^[,;]?\s*(?:da|do|de|das|dos|desta|deste|destas|destes)\s+(?:resolucao|deliberacao|lei|decreto|portaria|parecer|indicacao|instrucao|norma|artigo)\b/i
                    .test(depoisNormalizado);

            if (ehReferenciaPosterior) {
                continue;
            }


            /*
             * Analisa também o contexto imediatamente
             * anterior ao candidato.
             */

            const antesOriginal = textoNormalizado
                .slice(Math.max(0, inicio - 180), inicio)
                .replace(/\s+/g, " ")
                .trim();

            const antes = antesOriginal
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");


            /*
             * Referências textuais comuns:
             *
             * conforme o artigo 12
             * nos termos do artigo 20
             * disposto no artigo 11
             */

            const referenciaPorExpressao =
                /(?:conforme|conforme dispoe|com base no|nos termos do|nos termos da|disposto no|disposto nos|previsto no|previsto nos|cumprimento do|cumprimento do disposto no)\s*$/
                    .test(antes);

            if (referenciaPorExpressao) {
                continue;
            }


            /*
             * Detecta referências como:
             *
             * no artigo 1º
             * do artigo 2º
             * ao artigo 21
             * o artigo 25
             *
             * Quando o regex chega ao marcador, essas
             * palavras ficam imediatamente antes dele.
             */

            const referenciaPorPreposicao =
                /(?:\bdo|\bda|\bdos|\bdas|\bno|\bna|\bnos|\bnas|\bao|\baos|\bpelo|\bpela|\bpelos|\bpelas|\bo|\ba|\bos|\bas|\bseu|\bsua|\bseus|\bsuas)\s*$/
                    .test(antes);

            if (referenciaPorPreposicao) {
                continue;
            }


            /*
             * Normas alteradoras frequentemente reproduzem
             * o texto de outra norma entre aspas:
             *
             * III – o artigo 25:
             * “Artigo 25 – ...”
             *
             * Esse Artigo 25 pertence à norma alterada,
             * não à norma atual.
             */

            const artigoDentroDeAspas =
                /[“"]\s*$/.test(antesOriginal);

            if (artigoDentroDeAspas) {
                continue;
            }


            /*
             * Artigos estruturais normalmente possuem
             * hífen, travessão ou dois-pontos depois do
             * número.
             *
             * O separador continua não obrigatório para
             * manter compatibilidade com documentos antigos.
             */

            const separadorMatch = textoNormalizado
                .slice(fimMarcador, fimMarcador + 15)
                .match(/^\s*[-–—:]\s*/);

            let fimCabecalho = fimMarcador;

            if (separadorMatch) {
                fimCabecalho += separadorMatch[0].length;
            }


            candidatos.push({
                marcador,
                inicio,
                fimCabecalho
            });
        }


        /*
         * Montagem dos artigos a partir dos candidatos
         * considerados estruturais.
         */

        const artigos = [];

        for (let i = 0; i < candidatos.length; i++) {

            const atual = candidatos[i];
            const proximo = candidatos[i + 1];

            const fimConteudo = proximo
                ? proximo.inicio
                : textoNormalizado.length;

            const conteudo = textoNormalizado
                .slice(
                    atual.fimCabecalho,
                    fimConteudo
                )
                .trim();

            const numeroMatch =
                atual.marcador.match(/\d+[A-Za-z]?/i);

            let numero = numeroMatch
                ? numeroMatch[0]
                : null;


            if (
                !numero &&
                atual.marcador
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .includes("unico")
            ) {

                numero = "Único";
            }


            if (conteudo.length > 0) {

                artigos.push({
                    numero,
                    marcador: atual.marcador,
                    texto: conteudo
                });
            }
        }


        /*
         * Documentos sem divisão formal em artigos,
         * como algumas retificações e comunicados,
         * continuam disponíveis integralmente.
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