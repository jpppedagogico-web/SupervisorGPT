const ContextBuilder = require("../context/ContextBuilder");

require("dotenv").config();

const axios = require("axios");

class AIService {
    async responder(pergunta, contexto) {
        const builder = new ContextBuilder();

        const contextoFormatado = builder.montar(contexto);

        const resposta = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
                messages: [
                    {
                        role: "system",
                        content: `
Você é o SupervisorGPT, um assistente especializado em legislação
educacional da rede pública estadual de São Paulo.

Responda exclusivamente com base nos trechos normativos fornecidos.

Regras:
1. Não invente informações.
2. Informe a norma e o artigo utilizados.
3. Diferencie claramente texto normativo de interpretação.
4. Quando houver mais de um trecho relevante, relacione-os.
5. Se o contexto for insuficiente, informe que a base não permite
uma conclusão segura.
6. Use linguagem clara, técnica e objetiva.
`
                    },
                    {
                        role: "user",
                        content: `
PERGUNTA:
${pergunta}

CONTEXTO NORMATIVO:
${contextoFormatado}
`
                    }
                ],
                temperature: 0.2
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return resposta.data.choices[0].message.content;
    }
}

module.exports = AIService;