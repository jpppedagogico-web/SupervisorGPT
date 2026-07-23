class Logger {
    static info(mensagem) {
        console.log(`ℹ️ ${mensagem}`);
    }

    static sucesso(mensagem) {
        console.log(`✅ ${mensagem}`);
    }

    static erro(mensagem) {
        console.log(`❌ ${mensagem}`);
    }

    static aviso(mensagem) {
        console.log(`⚠️ ${mensagem}`);
    }
}

module.exports = Logger;