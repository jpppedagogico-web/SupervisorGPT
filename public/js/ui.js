function escaparHTML(texto) {
    const elemento = document.createElement("div");
    elemento.textContent = texto;
    return elemento.innerHTML;
}

function ocultarBoasVindas() {
    const welcomeCard = document.getElementById("welcomeCard");

    if (welcomeCard) {
        welcomeCard.style.display = "none";
    }
}

function adicionarMensagem(tipo, texto, id = "") {
    const chatArea = document.getElementById("chatArea");
    
    const textoFormatado = marked.parse(texto);
    
    const mensagem = document.createElement("div");
    mensagem.className = `message ${tipo}`;

    if (id) {
        mensagem.id = id;
    }

    const autor = tipo === "user" ? "Você" : "SupervisorGPT";

    mensagem.innerHTML = `
        <strong>${autor}</strong>
        <div class="markdown">${textoFormatado}</div>
    `;

    chatArea.appendChild(mensagem);
    mensagem.scrollIntoView({ behavior: "smooth", block: "end" });

    return mensagem;
}

function mostrarCarregamento() {
    return adicionarMensagem(
        "bot",
        "Analisando a base normativa...",
        "loadingMessage"
    );
}

function removerCarregamento() {
    document.getElementById("loadingMessage")?.remove();
}

function atualizarFontes(fontes = []) {
    const sourcesArea = document.getElementById("sourcesArea");

    if (!fontes.length) {
        sourcesArea.innerHTML = `
            <div class="empty-state">
                Nenhum documento relevante foi localizado.
            </div>
        `;
        return;
    }

    const fontesUnicas = [];
    const chaves = new Set();

    for (const fonte of fontes) {
        const chave = [
            fonte.nomeArquivo,
            fonte.artigo
        ].join("-");

        if (!chaves.has(chave)) {
            chaves.add(chave);
            fontesUnicas.push(fonte);
        }
    }

    sourcesArea.innerHTML = fontesUnicas
        .map((fonte, indice) => `
            <button
                type="button"
                class="source-card source-card-button"
                data-source-index="${indice}"
            >
                <div class="source-icon">📘</div>

                <div class="source-content">
                    <strong>
                        ${escaparHTML(
                            montarNomeFonte(fonte)
                        )}
                    </strong>

                    <span>
                        ${fonte.marcador
                            ? escaparHTML(fonte.marcador)
                            : fonte.artigo
                                ? `Art. ${escaparHTML(fonte.artigo)}`
                                : "Trecho normativo"}
                    </span>

                    <small>Clique para visualizar o trecho</small>
                </div>
            </button>
        `)
        .join("");

    document
        .querySelectorAll(".source-card-button")
        .forEach(botao => {
            botao.addEventListener("click", () => {
                const indice = Number(
                    botao.dataset.sourceIndex
                );

                mostrarFonte(fontesUnicas[indice]);
            });
        });
}

function montarNomeFonte(fonte) {
    const partes = [
        fonte.tipo,
        fonte.numero
    ].filter(Boolean);

    let nome = partes.join(" ");

    if (fonte.ano) {
        nome += `/${fonte.ano}`;
    }

    return nome || fonte.nomeArquivo || "Documento";
}

function atualizarMetricas(tempo, quantidade) {
    const confidenceValue = document.getElementById("confidenceValue");
    const responseTime = document.getElementById("responseTime");

    if (confidenceValue) {
        confidenceValue.textContent = quantidade > 0 ? "Alta" : "Baixa";
    }

    if (responseTime) {
        responseTime.textContent = `${tempo.toFixed(2)} s`;
    }
}
function mostrarFonte(fonte) {
    let modal = document.getElementById("sourceModal");

    if (!modal) {
        modal = document.createElement("div");
        modal.id = "sourceModal";
        modal.className = "source-modal";

        modal.innerHTML = `
            <div class="source-modal-backdrop"></div>

            <article class="source-modal-content">
                <button
                    type="button"
                    class="source-modal-close"
                    aria-label="Fechar"
                >
                    ×
                </button>

                <h2 id="sourceModalTitle"></h2>
                <h3 id="sourceModalArticle"></h3>
                <div id="sourceModalText"></div>
            </article>
        `;

        document.body.appendChild(modal);

        modal
            .querySelector(".source-modal-close")
            .addEventListener("click", fecharFonte);

        modal
            .querySelector(".source-modal-backdrop")
            .addEventListener("click", fecharFonte);
    }

    document.getElementById("sourceModalTitle").textContent =
        montarNomeFonte(fonte);

    document.getElementById("sourceModalArticle").textContent =
        fonte.marcador ||
        (fonte.artigo ? `Art. ${fonte.artigo}` : "");

    document.getElementById("sourceModalText").textContent =
        fonte.texto || "Trecho não disponível.";

    modal.classList.add("open");
}

function fecharFonte() {
    document
        .getElementById("sourceModal")
        ?.classList.remove("open");
}