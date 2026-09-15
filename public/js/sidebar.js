document.addEventListener("DOMContentLoaded", () => {

    const itensMenu =
        document.querySelectorAll(".sidebar-menu a");

    const chatView =
        document.getElementById("chatView");

    const moduleView =
        document.getElementById("moduleView");


    const titulos = {
        biblioteca: {
            icone: "📚",
            titulo: "Biblioteca",
            descricao:
                "Consulte as normas disponíveis na base jurídica do SupervisorGPT."
        },

        pesquisa: {
            icone: "🔎",
            titulo: "Pesquisa",
            descricao:
                "Pesquise diretamente termos, artigos e conteúdos da base normativa."
        },

        documentos: {
            icone: "📄",
            titulo: "Documentos",
            descricao:
                "Visualize os documentos que compõem a base de conhecimento."
        },

        atualizar: {
            icone: "🔄",
            titulo: "Atualizar Base",
            descricao:
                "Gerencie e atualize os documentos da base normativa."
        },

        estatisticas: {
            icone: "📊",
            titulo: "Estatísticas",
            descricao:
                "Acompanhe dados e indicadores da base jurídica."
        },

        configuracoes: {
            icone: "⚙",
            titulo: "Configurações",
            descricao:
                "Consulte as configurações e informações do SupervisorGPT."
        }
    };


    function atualizarMenu(view) {

        itensMenu.forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.view === view
            );

        });

    }


    function mostrarChat() {

        chatView.style.display = "";

        moduleView.style.display = "none";

        moduleView.innerHTML = "";

        atualizarMenu("chat");

    }


    function mostrarModulo(view) {

        const modulo = titulos[view];

        if (!modulo) {
            mostrarChat();
            return;
        }

        chatView.style.display = "none";
        moduleView.style.display = "block";

        atualizarMenu(view);

        moduleView.innerHTML = `
            <div class="module-header">
                <div>
                    <h2>
                        ${modulo.icone}
                        ${modulo.titulo}
                    </h2>

                    <p>
                        ${modulo.descricao}
                    </p>
                </div>
            </div>

            <div
                id="moduleContent"
                class="module-content"
            >
                <div class="module-placeholder">
                    Carregando ${modulo.titulo}...
                </div>
            </div>
        `;

        carregarModulo(view);

    }


    async function carregarModulo(view) {

        const conteudo =
            document.getElementById("moduleContent");

        if (!conteudo) {
            return;
        }

        switch (view) {

            case "biblioteca":

                await carregarBiblioteca(conteudo);

                break;


            case "pesquisa":

                carregarPesquisa(conteudo);

                break;


            case "documentos":

                await carregarDocumentos(conteudo);

                break;


            case "atualizar":

                conteudo.innerHTML = `
                    <div class="module-card">

                        <h3>🔄 Administração da base</h3>

                        <p>
                            Acesse a área administrativa para
                            atualização e acompanhamento da base.
                        </p>

                        <a
                            href="/admin.html"
                            class="module-button"
                        >
                            Abrir administração
                        </a>

                    </div>
                `;

                break;


            case "estatisticas":

                await carregarEstatisticas(conteudo);

                break;


            case "configuracoes":

                await carregarConfiguracoes(conteudo);

                break;
        }

    }

    async function carregarBiblioteca(conteudo) {

        conteudo.innerHTML = `
        <div class="module-card">
            Carregando biblioteca...
        </div>
    `;

        try {

            const resposta = await fetch(
                "/api/admin/biblioteca"
            );

            if (!resposta.ok) {
                throw new Error(
                    "Erro ao carregar biblioteca."
                );
            }

            const dados = await resposta.json();

            const documentos =
                dados.documentos || [];

            function renderizar(lista) {

                const listaBiblioteca =
                    document.getElementById(
                        "listaBiblioteca"
                    );

                if (!listaBiblioteca) {
                    return;
                }

                if (lista.length === 0) {

                    listaBiblioteca.innerHTML = `
                    <div class="module-card">
                        Nenhuma norma encontrada.
                    </div>
                `;

                    return;
                }

                listaBiblioteca.innerHTML =
                    lista.map(doc => {

                        const titulo =
                            `${doc.tipo} ${doc.numero || ""}` +
                            `${doc.ano ? "/" + doc.ano : ""}`;

                        const arquivo =
                            encodeURIComponent(
                                doc.nomeArquivo
                            );

                        return `
                        <div class="biblioteca-card">

                            <div class="biblioteca-icon">
                                📘
                            </div>

                            <div class="biblioteca-info">

                                <h3>
                                    ${titulo}
                                </h3>

                                <p>
                                    ${doc.quantidadeArtigos}
                                    artigos indexados
                                </p>

                                <button
                                    class="module-button"
                                    data-arquivo="${arquivo}"
                                >
                                    Visualizar
                                </button>

                            </div>

                        </div>
                    `;

                    }).join("");


                listaBiblioteca
                    .querySelectorAll(
                        "[data-arquivo]"
                    )
                    .forEach(botao => {

                        botao.addEventListener(
                            "click",
                            () => {

                                abrirDocumentoBiblioteca(
                                    botao.dataset.arquivo
                                );

                            }
                        );

                    });
            }


            conteudo.innerHTML = `
            <div class="biblioteca-toolbar">

                <div class="biblioteca-contador">
                    <strong>
                        ${documentos.length}
                    </strong>
                    <span>
                        normas disponíveis
                    </span>
                </div>

                <input
                    id="filtroBiblioteca"
                    type="text"
                    placeholder="Pesquisar por norma, número ou ano..."
                    class="module-input"
                >

            </div>

            <div
                id="listaBiblioteca"
                class="biblioteca-grid"
            ></div>
        `;


            renderizar(documentos);


            const filtro =
                document.getElementById(
                    "filtroBiblioteca"
                );

            filtro.addEventListener(
                "input",
                () => {

                    const termo =
                        filtro.value
                            .toLowerCase()
                            .trim();

                    const filtrados =
                        documentos.filter(doc => {

                            const texto = `
                            ${doc.tipo || ""}
                            ${doc.numero || ""}
                            ${doc.ano || ""}
                            ${doc.nomeArquivo || ""}
                        `.toLowerCase();

                            return texto.includes(
                                termo
                            );

                        });

                    renderizar(filtrados);

                }
            );

        } catch (erro) {

            console.error(
                "Erro na Biblioteca:",
                erro
            );

            conteudo.innerHTML = `
            <div class="module-card">
                Não foi possível carregar
                a Biblioteca Jurídica.
            </div>
        `;
        }
    }

    async function abrirDocumentoBiblioteca(
        arquivoCodificado
    ) {

        const conteudo =
            document.getElementById(
                "moduleContent"
            );

        if (!conteudo) {
            return;
        }

        conteudo.innerHTML = `
        <div class="module-card">
            Carregando documento...
        </div>
    `;

        try {

            const resposta = await fetch(
                "/api/admin/biblioteca/documento/" +
                arquivoCodificado
            );

            if (!resposta.ok) {
                throw new Error(
                    "Documento não encontrado."
                );
            }

            const documento =
                await resposta.json();

            const artigos =
                documento.artigos || [];

            conteudo.innerHTML = `
            <div class="documento-header">

                <button
                    id="voltarBiblioteca"
                    class="module-button secondary-button"
                >
                    ← Voltar à Biblioteca
                </button>

                <h2>
                    ${documento.tipo || "Documento"}
                    ${documento.numero || ""}
                    ${documento.ano
                    ? "/" + documento.ano
                    : ""}
                </h2>

                <p>
                    ${artigos.length}
                    artigos disponíveis
                </p>

            </div>

            <div class="artigos-lista">

                ${artigos.map(artigo => `
                    <article class="artigo-card">

                        <h3>
                            ${artigo.marcador ||
                        "Artigo " +
                        (artigo.numero || "")
                        }
                        </h3>

                        <p>
                            ${artigo.texto || ""}
                        </p>

                    </article>
                `).join("")}

            </div>
        `;

            document
                .getElementById(
                    "voltarBiblioteca"
                )
                .addEventListener(
                    "click",
                    () => {
                        carregarBiblioteca(
                            conteudo
                        );
                    }
                );

        } catch (erro) {

            console.error(
                "Erro ao abrir documento:",
                erro
            );

            conteudo.innerHTML = `
            <div class="module-card">

                <p>
                    Não foi possível abrir
                    este documento.
                </p>

                <button
                    id="voltarBibliotecaErro"
                    class="module-button"
                >
                    Voltar
                </button>

            </div>
        `;

            document
                .getElementById(
                    "voltarBibliotecaErro"
                )
                ?.addEventListener(
                    "click",
                    () => {
                        carregarBiblioteca(
                            conteudo
                        );
                    }
                );
        }
    }

    function carregarPesquisa(conteudo) {

        conteudo.innerHTML = `
        <div class="pesquisa-box">

            <div class="pesquisa-form">

                <input
                    id="campoPesquisaJuridica"
                    type="text"
                    class="module-input"
                    placeholder="Ex.: atribuição de aulas, aluno reprovado, educação especial..."
                    autocomplete="off"
                >

                <button
                    id="btnPesquisaJuridica"
                    class="module-button"
                >
                    🔎 Pesquisar
                </button>

            </div>

            <p class="pesquisa-ajuda">
                Pesquise diretamente nos artigos da base jurídica.
                A pesquisa utiliza termos relacionados e linguagem normativa.
            </p>

        </div>

        <div id="resultadosPesquisaJuridica"></div>
    `;


        const campo =
            document.getElementById(
                "campoPesquisaJuridica"
            );

        const botao =
            document.getElementById(
                "btnPesquisaJuridica"
            );


        botao.addEventListener(
            "click",
            () => executarPesquisaJuridica(
                campo.value
            )
        );


        campo.addEventListener(
            "keydown",
            evento => {

                if (evento.key === "Enter") {

                    executarPesquisaJuridica(
                        campo.value
                    );

                }

            }
        );


        campo.focus();
    }

    async function executarPesquisaJuridica(
        consulta
    ) {

        consulta =
            String(consulta || "").trim();

        if (!consulta) {
            return;
        }

        const area =
            document.getElementById(
                "resultadosPesquisaJuridica"
            );

        if (!area) {
            return;
        }

        area.innerHTML = `
        <div class="module-card">
            🔎 Pesquisando na base jurídica...
        </div>
    `;

        try {

            const resposta = await fetch(
                "/api/admin/pesquisa?q=" +
                encodeURIComponent(consulta)
            );

            if (!resposta.ok) {
                throw new Error(
                    "Erro ao realizar pesquisa."
                );
            }

            const dados =
                await resposta.json();

            const resultados =
                dados.resultados || [];


            if (resultados.length === 0) {

                area.innerHTML = `
                <div class="module-card">

                    <h3>
                        Nenhum resultado encontrado
                    </h3>

                    <p>
                        Não foram encontrados artigos
                        relacionados a
                        <strong>${consulta}</strong>.
                    </p>

                </div>
            `;

                return;
            }


            area.innerHTML = `

            <div class="pesquisa-resumo">

                <strong>
                    ${resultados.length}
                </strong>

                <span>
                    resultados encontrados para
                    “${consulta}”
                </span>

            </div>

            <div class="pesquisa-resultados">

                ${resultados
                    .map(
                        (resultado, indice) =>
                            criarResultadoPesquisa(
                                resultado,
                                indice
                            )
                    )
                    .join("")}

            </div>
        `;

        } catch (erro) {

            console.error(
                "Erro na pesquisa:",
                erro
            );

            area.innerHTML = `
            <div class="module-card">
                Não foi possível realizar
                a pesquisa jurídica.
            </div>
        `;
        }
    }

    function criarResultadoPesquisa(
        resultado,
        indice
    ) {

        const norma = [
            resultado.tipo || "Documento",
            resultado.numero || ""
        ]
            .filter(Boolean)
            .join(" ");

        const ano =
            resultado.ano
                ? `/${resultado.ano}`
                : "";

        const artigo =
            resultado.marcador ||
            (
                resultado.artigo
                    ? `Artigo ${resultado.artigo}`
                    : "Trecho normativo"
            );

        const texto =
            resultado.texto || "";

        let relevancia = "Relacionada";

        if (indice <= 2) {
            relevancia = "Alta";
        } else if (indice <= 7) {
            relevancia = "Média";
        }


        return `
        <article class="resultado-pesquisa">

            <div class="resultado-topo">

                <div>

                    <h3>
                        📘 ${norma}${ano}
                    </h3>

                    <span class="resultado-artigo">
                        ${artigo}
                    </span>

                </div>

                <span
                    class="relevancia relevancia-${relevancia.toLowerCase()}"
                >
                    Relevância ${relevancia}
                </span>

            </div>

            <p class="resultado-texto">
                ${texto}
            </p>

        </article>
    `;
    }

    async function carregarDocumentos(conteudo) {

        conteudo.innerHTML = `
        <div class="module-card">
            Carregando documentos...
        </div>
    `;

        try {

            const resposta =
                await fetch("/api/admin/biblioteca");

            if (!resposta.ok) {
                throw new Error(
                    "Erro ao carregar documentos."
                );
            }

            const dados = await resposta.json();
            const documentos = dados.documentos || [];

            conteudo.innerHTML = `
            <div class="documentos-toolbar">

                <div class="documentos-contador">
                    <strong>${documentos.length}</strong>
                    <span>documentos na base</span>
                </div>

                <input
                    id="filtroDocumentos"
                    class="module-input"
                    type="text"
                    placeholder="Filtrar documentos..."
                >

            </div>

            <div class="documentos-tabela-container">

                <table class="documentos-tabela">

                    <thead>
                        <tr>
                            <th>Documento</th>
                            <th>Tipo</th>
                            <th>Número</th>
                            <th>Ano</th>
                            <th>Artigos</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody id="listaDocumentos">
                    </tbody>

                </table>

            </div>
        `;

            function renderizar(lista) {

                const corpo =
                    document.getElementById(
                        "listaDocumentos"
                    );

                if (!lista.length) {

                    corpo.innerHTML = `
                    <tr>
                        <td colspan="6">
                            Nenhum documento encontrado.
                        </td>
                    </tr>
                `;

                    return;
                }

                corpo.innerHTML =
                    lista.map(doc => {

                        const artigos =
                            Number(
                                doc.quantidadeArtigos || 0
                            );

                        const status =
                            artigos > 0
                                ? "Indexado"
                                : "Verificar";

                        const classeStatus =
                            artigos > 0
                                ? "status-indexado"
                                : "status-verificar";

                        return `
                        <tr>

                            <td class="nome-documento">
                                📄 ${doc.nomeArquivo || "Documento"}
                            </td>

                            <td>
                                ${doc.tipo || "—"}
                            </td>

                            <td>
                                ${doc.numero || "—"}
                            </td>

                            <td>
                                ${doc.ano || "—"}
                            </td>

                            <td>
                                ${artigos}
                            </td>

                            <td>
                                <span class="documento-status ${classeStatus}">
                                    ${status}
                                </span>
                            </td>

                        </tr>
                    `;

                    }).join("");
            }

            renderizar(documentos);

            const filtro =
                document.getElementById(
                    "filtroDocumentos"
                );

            filtro.addEventListener(
                "input",
                () => {

                    const termo =
                        filtro.value
                            .toLowerCase()
                            .trim();

                    const filtrados =
                        documentos.filter(doc => {

                            const texto = `
                            ${doc.nomeArquivo || ""}
                            ${doc.tipo || ""}
                            ${doc.numero || ""}
                            ${doc.ano || ""}
                        `.toLowerCase();

                            return texto.includes(termo);

                        });

                    renderizar(filtrados);

                }
            );

        } catch (erro) {

            console.error(
                "Erro em Documentos:",
                erro
            );

            conteudo.innerHTML = `
            <div class="module-card">
                Não foi possível carregar
                os documentos da base.
            </div>
        `;
        }
    }

    async function carregarEstatisticas(conteudo) {

        try {

            const resposta =
                await fetch("/api/admin/resumo");

            if (!resposta.ok) {
                throw new Error(
                    "Erro ao consultar estatísticas."
                );
            }

            const dados =
                await resposta.json();

            conteudo.innerHTML = `
                <div class="module-grid">

                    <div class="module-card">
                        <span>Normas</span>
                        <strong>
                            ${dados.normas ?? 0}
                        </strong>
                    </div>

                    <div class="module-card">
                        <span>Artigos</span>
                        <strong>
                            ${dados.artigos ?? 0}
                        </strong>
                    </div>

                    <div class="module-card">
                        <span>Documentos</span>
                        <strong>
                            ${dados.documentos ?? 0}
                        </strong>
                    </div>

                    <div class="module-card">
                        <span>Erros</span>
                        <strong>
                            ${dados.erros ?? 0}
                        </strong>
                    </div>

                </div>
            `;

        } catch (erro) {

            console.error(erro);

            conteudo.innerHTML = `
                <div class="module-card">
                    Não foi possível carregar
                    as estatísticas da base.
                </div>
            `;
        }

    }


    async function carregarConfiguracoes(conteudo) {

        try {

            const resposta =
                await fetch("/api/config");

            const dados =
                await resposta.json();

            conteudo.innerHTML = `
                <div class="module-card">

                    <h3>
                        ⚙ Configurações do sistema
                    </h3>

                    <p>
                        <strong>Modelo de IA:</strong>
                        ${dados.modelo || "Não informado"}
                    </p>

                    <p>
                        <strong>Base:</strong>
                        Local
                    </p>

                    <p>
                        <strong>Aplicação:</strong>
                        SupervisorGPT
                    </p>

                </div>
            `;

        } catch (erro) {

            conteudo.innerHTML = `
                <div class="module-card">
                    Não foi possível carregar
                    as configurações.
                </div>
            `;
        }

    }


    itensMenu.forEach(item => {

        item.addEventListener(
            "click",
            evento => {

                evento.preventDefault();

                const view =
                    item.dataset.view;

                history.replaceState(
                    null,
                    "",
                    `#${view}`
                );

                if (view === "chat") {
                    mostrarChat();
                } else {
                    mostrarModulo(view);
                }

            }
        );

    });


    const inicial =
        window.location.hash
            .replace("#", "") ||
        "chat";

    if (inicial === "chat") {
        mostrarChat();
    } else {
        mostrarModulo(inicial);
    }

    function criarCardBiblioteca(doc) {

        const titulo =
            `${doc.tipo} ${doc.numero || ""}/${doc.ano || ""}`;

        return `
        <div class="biblioteca-card">

            <div class="biblioteca-icon">
                📘
            </div>

            <div class="biblioteca-info">

                <h3>
                    ${titulo}
                </h3>

                <p>
                    ${doc.quantidadeArtigos}
                    artigos indexados
                </p>

                <button
                    class="module-button"
                    onclick="abrirDocumentoBiblioteca(
                        '${encodeURIComponent(
            doc.nomeArquivo
        )}'
                    )"
                >
                    Visualizar
                </button>

            </div>

        </div>
    `;
    }
    async function abrirDocumentoBiblioteca(
        nomeArquivoCodificado
    ) {

        const nomeArquivo =
            decodeURIComponent(
                nomeArquivoCodificado
            );

        const conteudo =
            document.getElementById(
                "moduleContent"
            );

        if (!conteudo) {
            return;
        }

        conteudo.innerHTML = `
        <div class="module-card">
            Carregando documento...
        </div>
    `;

        try {

            const resposta =
                await fetch(
                    "/api/admin/biblioteca/documento/" +
                    encodeURIComponent(
                        nomeArquivo
                    )
                );

            if (!resposta.ok) {
                throw new Error(
                    "Documento não encontrado."
                );
            }

            const documento =
                await resposta.json();

            conteudo.innerHTML = `
            <div class="documento-header">

                <button
                    class="module-button secondary-button"
                    onclick="voltarBiblioteca()"
                >
                    ← Voltar
                </button>

                <h2>
                    ${documento.tipo}
                    ${documento.numero}/${documento.ano}
                </h2>

                <p>
                    ${documento.artigos.length}
                    artigos disponíveis
                </p>

            </div>

            <div class="artigos-lista">

                ${documento.artigos
                    .map(artigo => `
                        <div class="artigo-card">

                            <h3>
                                ${artigo.marcador ||
                        "Artigo " +
                        artigo.numero}
                            </h3>

                            <p>
                                ${artigo.texto || ""}
                            </p>

                        </div>
                    `)
                    .join("")}

            </div>
        `;

        } catch (erro) {

            console.error(erro);

            conteudo.innerHTML = `
            <div class="module-card">
                Não foi possível abrir
                este documento.
            </div>
        `;
        }
    }
    async function abrirDocumentoBiblioteca(
        nomeArquivoCodificado
    ) {

        const nomeArquivo =
            decodeURIComponent(
                nomeArquivoCodificado
            );

        const conteudo =
            document.getElementById(
                "moduleContent"
            );

        if (!conteudo) {
            return;
        }

        conteudo.innerHTML = `
        <div class="module-card">
            Carregando documento...
        </div>
    `;

        try {

            const resposta =
                await fetch(
                    "/api/admin/biblioteca/documento/" +
                    encodeURIComponent(
                        nomeArquivo
                    )
                );

            if (!resposta.ok) {
                throw new Error(
                    "Documento não encontrado."
                );
            }

            const documento =
                await resposta.json();

            conteudo.innerHTML = `
            <div class="documento-header">

                <button
                    class="module-button secondary-button"
                    onclick="voltarBiblioteca()"
                >
                    ← Voltar
                </button>

                <h2>
                    ${documento.tipo}
                    ${documento.numero}/${documento.ano}
                </h2>

                <p>
                    ${documento.artigos.length}
                    artigos disponíveis
                </p>

            </div>

            <div class="artigos-lista">

                ${documento.artigos
                    .map(artigo => `
                        <div class="artigo-card">

                            <h3>
                                ${artigo.marcador ||
                        "Artigo " +
                        artigo.numero}
                            </h3>

                            <p>
                                ${artigo.texto || ""}
                            </p>

                        </div>
                    `)
                    .join("")}

            </div>
        `;

        } catch (erro) {

            console.error(erro);

            conteudo.innerHTML = `
            <div class="module-card">
                Não foi possível abrir
                este documento.
            </div>
        `;
        }
    }
    window.abrirDocumentoBiblioteca =
        abrirDocumentoBiblioteca;

    window.voltarBiblioteca =
        voltarBiblioteca;
});
