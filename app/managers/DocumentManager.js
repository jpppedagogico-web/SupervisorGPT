const fs = require("fs");
const path = require("path");

const Config = require("../config/Config");
const Logger = require("../utils/Logger");
const DocumentPipeline = require("../pipeline/DocumentPipeline");

class DocumentManager {
    constructor() {
        this.pipeline = new DocumentPipeline();
    }

    listarPDFs() {
        Logger.info("Procurando PDFs em: " + Config.PDF_PATH);

        const arquivos = fs
            .readdirSync(Config.PDF_PATH)
            .filter(arquivo =>
                arquivo.toLowerCase().endsWith(".pdf")
            );

        Logger.sucesso(`${arquivos.length} PDF(s) encontrado(s).`);
        return arquivos;
    }

    async processarTodosPDFs() {
        const arquivos = this.listarPDFs();

        for (const arquivo of arquivos) {
            const documento = await this.pipeline.processarPDF(arquivo);

            fs.writeFileSync(
                documento.caminhoTXT,
                documento.textoBruto,
                "utf8"
            );

            fs.writeFileSync(
                documento.caminhoJSON,
                JSON.stringify(documento.estruturado, null, 2),
                "utf8"
            );

            Logger.sucesso(`TXT salvo: ${path.basename(documento.caminhoTXT)}`);
            Logger.sucesso(`JSON salvo: ${path.basename(documento.caminhoJSON)}`);
        }

        Logger.sucesso("Processamento finalizado.");
    }
}

module.exports = DocumentManager;