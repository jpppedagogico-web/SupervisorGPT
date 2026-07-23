const SearchService = require("../app/search/SearchService");
const AIService = require("../app/ai/AIService");

async function testar() {

    const busca = new SearchService();

    const documentos = busca.buscar("Conselho de Classe");

    console.log("Documentos encontrados:", documentos.length);

    const ia = new AIService();

    const resposta = await ia.responder(
        "O que é Conselho de Classe?",
        documentos
    );

    console.log("\n==============================");
    console.log("RESPOSTA DA IA");
    console.log("==============================");
    console.log(resposta);

}

testar();