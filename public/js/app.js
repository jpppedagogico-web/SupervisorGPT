document.addEventListener("DOMContentLoaded", () => {
    carregarQuantidadeDocumentos();

    const botao = document.getElementById("btnPerguntar");
    const campo = document.getElementById("pergunta");

    if (botao) {
        botao.addEventListener("click", enviarPergunta);
    }

    if (campo) {
        campo.addEventListener("keydown", evento => {
            if (evento.key === "Enter" && !evento.shiftKey) {
                evento.preventDefault();
                enviarPergunta();
            }
        });
    }

    console.log("SupervisorGPT iniciado.");
});

async function carregarQuantidadeDocumentos() {
    const elemento = document.getElementById(
        "quantidadeDocumentos"
    );

    if (!elemento) {
        console.warn(
            'Elemento "quantidadeDocumentos" não encontrado.'
        );
        return;
    }

    try {
        elemento.textContent = "Carregando...";

        const resposta = await fetch(
            "/api/admin/resumo",
            {
                cache: "no-store"
            }
        );

        if (!resposta.ok) {
            throw new Error(
                `Erro HTTP ${resposta.status}`
            );
        }

        const dados = await resposta.json();
        const quantidade = Number(dados.normas) || 0;

        elemento.textContent =
            quantidade === 1
                ? "1 documento"
                : `${quantidade} documentos`;

    } catch (erro) {
        console.error(
            "Erro ao carregar quantidade de documentos:",
            erro
        );

        elemento.textContent = "Base indisponível";
    }
}