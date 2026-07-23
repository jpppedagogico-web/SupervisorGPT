async function enviarPergunta() {
    const campo = document.getElementById("pergunta");
    const botao = document.getElementById("btnPerguntar");
    const pergunta = campo.value.trim();

    if (!pergunta) {
        campo.focus();
        return;
    }

    ocultarBoasVindas();
    adicionarMensagem("user", pergunta);

    campo.value = "";
    campo.disabled = true;
    botao.disabled = true;

    mostrarCarregamento();

    const inicio = performance.now();

    try {
        const dados = await consultarSupervisor(pergunta);
        const fim = performance.now();
        const tempo = (fim - inicio) / 1000;

        removerCarregamento();
        adicionarMensagem("bot", dados.resposta);

        atualizarFontes(dados.fontes);
        atualizarMetricas(tempo, dados.documentosEncontrados);
    } catch (erro) {
        removerCarregamento();

        adicionarMensagem(
            "bot",
            `Não foi possível concluir a consulta: ${erro.message}`
        );
    } finally {
        campo.disabled = false;
        botao.disabled = false;
        campo.focus();
    }
}