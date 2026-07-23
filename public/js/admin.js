const estadoAdmin = {
    documentos: []
};

document.addEventListener("DOMContentLoaded", () => {
    carregarResumo();

    const botaoAtualizar =
        document.getElementById("botaoAtualizar");

    const campoPesquisa =
        document.getElementById("pesquisaDocumento");

    botaoAtualizar.addEventListener(
        "click",
        carregarResumo
    );

    campoPesquisa.addEventListener(
        "input",
        aplicarPesquisa
    );
});

async function carregarResumo() {
    const botao =
        document.getElementById("botaoAtualizar");

    const mensagem =
        document.getElementById("mensagemStatus");

    botao.disabled = true;
    botao.textContent = "Carregando...";

    mensagem.classList.remove("erro");
    mensagem.textContent =
        "Carregando informações da base...";

    try {
        const resposta = await fetch(
            "/api/admin/resumo"
        );

        if (!resposta.ok) {
            throw new Error(
                `Erro HTTP ${resposta.status}`
            );
        }

        const dados = await resposta.json();

        estadoAdmin.documentos =
            Array.isArray(dados.documentos)
                ? dados.documentos
                : [];

        atualizarCards(dados);
        renderizarDocumentos(
            estadoAdmin.documentos
        );

        mensagem.textContent =
            `${estadoAdmin.documentos.length} documento(s) encontrado(s).`;
    } catch (erro) {
        console.error(
            "Erro ao carregar painel:",
            erro
        );

        mensagem.classList.add("erro");
        mensagem.textContent =
            "Não foi possível carregar os dados da base.";

        renderizarDocumentos([]);
    } finally {
        botao.disabled = false;
        botao.textContent = "Atualizar dados";
    }
}

function atualizarCards(dados) {
    document.getElementById(
        "totalNormas"
    ).textContent = formatarNumero(
        dados.normas
    );

    document.getElementById(
        "totalArtigos"
    ).textContent = formatarNumero(
        dados.artigos
    );

    document.getElementById(
        "totalErros"
    ).textContent = formatarNumero(
        dados.erros
    );

    const textoErros =
        document.getElementById("textoErros");

    textoErros.textContent =
        Number(dados.erros) === 0
            ? "Base íntegra"
            : "Requer verificação";

    document.getElementById(
        "ultimaAtualizacao"
    ).textContent = formatarData(
        dados.atualizacao
    );
}

function renderizarDocumentos(documentos) {
    const tabela =
        document.getElementById(
            "tabelaDocumentos"
        );

    tabela.innerHTML = "";

    if (!documentos.length) {
        tabela.innerHTML = `
            <tr>
                <td colspan="5" class="sem-resultados">
                    Nenhum documento encontrado.
                </td>
            </tr>
        `;

        return;
    }

    documentos.forEach(documento => {
        const linha =
            document.createElement("tr");

        const status =
            String(documento.status)
                .toUpperCase();

        const classeStatus =
            status === "OK"
                ? "status-ok"
                : "status-erro";

        linha.innerHTML = `
            <td class="documento">
                ${escaparHtml(
                    documento.documento || "-"
                )}
            </td>

            <td>
                ${escaparHtml(
                    documento.tipo || "-"
                )}
            </td>

            <td>
                ${escaparHtml(
                    documento.ano || "-"
                )}
            </td>

            <td class="numero-artigos">
                ${formatarNumero(
                    documento.artigos
                )}
            </td>

            <td>
                <span class="status ${classeStatus}">
                    ${status === "OK"
                        ? "OK"
                        : "ERRO"}
                </span>
            </td>
        `;

        tabela.appendChild(linha);
    });
}

function aplicarPesquisa(evento) {
    const termo =
        evento.target.value
            .trim()
            .toLowerCase();

    if (!termo) {
        renderizarDocumentos(
            estadoAdmin.documentos
        );

        return;
    }

    const filtrados =
        estadoAdmin.documentos.filter(
            documento => {
                const conteudo = [
                    documento.documento,
                    documento.tipo,
                    documento.ano,
                    documento.status
                ]
                    .join(" ")
                    .toLowerCase();

                return conteudo.includes(termo);
            }
        );

    renderizarDocumentos(filtrados);
}

function formatarNumero(valor) {
    const numero = Number(valor) || 0;

    return numero.toLocaleString("pt-BR");
}

function formatarData(valor) {
    if (!valor) {
        return "—";
    }

    const data = new Date(valor);

    if (Number.isNaN(data.getTime())) {
        return "—";
    }

    return data.toLocaleString(
        "pt-BR",
        {
            dateStyle: "short",
            timeStyle: "short"
        }
    );
}

function escaparHtml(valor) {
    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}