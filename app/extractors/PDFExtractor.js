const fs = require("fs");

async function extrairTextoPDF(caminhoPDF) {
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

    const dados = new Uint8Array(fs.readFileSync(caminhoPDF));

    const documento = await pdfjsLib.getDocument({
        data: dados
    }).promise;

    let texto = "";

    for (let i = 1; i <= documento.numPages; i++) {
        const pagina = await documento.getPage(i);
        const conteudo = await pagina.getTextContent();

        const textoPagina = conteudo.items
            .map(item => item.str)
            .join(" ");

        texto += textoPagina + "\n\n";
    }

    return texto;
}

module.exports = {
    extrairTextoPDF
};