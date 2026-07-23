const fs = require("fs");
const path = require("path");

class AdminService {

    getResumo() {

        const pastaJson = path.join(__dirname, "../../base_conhecimento/json");

        const arquivos = fs.readdirSync(pastaJson)
            .filter(a => a.endsWith(".json"));

        let normas = 0;
        let artigos = 0;
        let erros = 0;

        const documentos = [];

        arquivos.forEach(arquivo => {

            try {

                const caminho = path.join(pastaJson, arquivo);

                const json = JSON.parse(
                    fs.readFileSync(caminho, "utf8")
                );

                const quantidadeArtigos =
                    json.artigos?.length || 0;

                normas++;

                artigos += quantidadeArtigos;

                documentos.push({

                    documento: json.titulo || arquivo,

                    tipo: json.tipo || "-",

                    ano: json.ano || "-",

                    artigos: quantidadeArtigos,

                    status:
                        quantidadeArtigos > 0
                            ? "OK"
                            : "ERRO"

                });

                if (quantidadeArtigos === 0)
                    erros++;

            }
            catch {

                erros++;

            }

        });

        return {

            normas,

            artigos,

            erros,

            documentos,

            atualizacao: new Date()

        };

    }

}

module.exports = AdminService;