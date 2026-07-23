const path = require("path");

class Config {
    static BASE = path.join(__dirname, "..", "..");

    static PDF_PATH = path.join(
        Config.BASE,
        "base_conhecimento",
        "pdf"
    );

    static TXT_PATH = path.join(
        Config.BASE,
        "base_conhecimento",
        "txt"
    );

    static METADATA_PATH = path.join(
        Config.BASE,
        "base_conhecimento",
        "metadados"
    );

    static VECTOR_PATH = path.join(
        Config.BASE,
        "base_conhecimento",
        "vetores"
    );

    static JSON_PATH = path.join(
    Config.BASE,
    "base_conhecimento",
    "json"
    );
    
    static INDEX_FILE = path.join(
        Config.BASE,
        "base_conhecimento",
        "indice.json"
    );
}

module.exports = Config;