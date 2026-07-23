async function consultarSupervisor(pergunta) {
    const resposta = await fetch("/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ pergunta })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(
            dados.erro || "Não foi possível concluir a consulta."
        );
    }

    return dados;
}