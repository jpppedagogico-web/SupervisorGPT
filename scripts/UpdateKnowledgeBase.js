
const DocumentManager = require("../app/managers/DocumentManager");
const IndexGenerator = require("../app/index/IndexGenerator");

async function atualizarBase() {

    console.log("=================================");
    console.log(" SupervisorGPT - Atualização");
    console.log("=================================\n");

    const manager = new DocumentManager();

    await manager.processarTodosPDFs();

    console.log("\nGerando índice invertido...");

    const index = new IndexGenerator();

    index.gerar();

    console.log("\n✅ Base atualizada com sucesso!");

}

atualizarBase();