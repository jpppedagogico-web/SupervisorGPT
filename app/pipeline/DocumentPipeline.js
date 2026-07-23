const path = require("path");

const Config = require("../config/Config");
const Logger = require("../utils/Logger");
const Document = require("../models/Document");
const LegalDocumentParser = require("../parsers/LegalDocumentParser");

const { extrairTextoPDF } = require("../extractors/PDFExtractor");

class DocumentPipeline {
    constructor() {
        this.parser = new LegalDocumentParser();
    }

    async processarPDF(nomeArquivo) {
        Logger.info(`Iniciando processamento: ${nomeArquivo}`);

        const caminhoPDF = path.join(Config.PDF_PATH, nomeArquivo);
        const nomeTXT = nomeArquivo.replace(/\.pdf$/i, ".txt");
        const nomeJSON = nomeArquivo.replace(/\.pdf$/i, ".json");

        const caminhoTXT = path.join(Config.TXT_PATH, nomeTXT);
        const caminhoJSON = path.join(Config.JSON_PATH, nomeJSON);

        const documento = new Document({
            nomeArquivo,
            caminhoPDF,
            caminhoTXT
        });

        Logger.info("Extraindo texto do PDF...");
        documento.textoBruto = await extrairTextoPDF(caminhoPDF);

        Logger.sucesso(
            `Texto extraído: ${documento.textoBruto.length} caracteres.`
        );

        Logger.info("Estruturando documento jurídico...");
        const estruturado = this.parser.parse(documento.textoBruto, nomeArquivo);

console.log("===== DEBUG =====");
console.log(estruturado);
console.log("=================");

        Logger.sucesso(
            `${estruturado.artigos.length} artigo(s) identificado(s).`
        );

        documento.estruturado = estruturado;
        documento.caminhoJSON = caminhoJSON;

        return documento;
    }
}

module.exports = DocumentPipeline;