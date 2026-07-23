class Document {
    constructor({
        nomeArquivo,
        caminhoPDF,
        caminhoTXT,
        textoBruto = "",
        textoLimpo = "",
        metadados = {},
        artigos = []
    }) {
        this.nomeArquivo = nomeArquivo;
        this.caminhoPDF = caminhoPDF;
        this.caminhoTXT = caminhoTXT;
        this.textoBruto = textoBruto;
        this.textoLimpo = textoLimpo;
        this.metadados = metadados;
        this.artigos = artigos;
        this.dataProcessamento = new Date().toISOString();
    }

    temTextoBruto() {
        return this.textoBruto && this.textoBruto.length > 0;
    }

    temTextoLimpo() {
        return this.textoLimpo && this.textoLimpo.length > 0;
    }

    resumo() {
        return {
            nomeArquivo: this.nomeArquivo,
            tamanhoTextoBruto: this.textoBruto.length,
            tamanhoTextoLimpo: this.textoLimpo.length,
            quantidadeArtigos: this.artigos.length,
            dataProcessamento: this.dataProcessamento
        };
    }
}

module.exports = Document;