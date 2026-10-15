const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});

async function generateEmbeddings(text) {
    try {
        if(text.length==0)return [];
        const response = await ai.models.embedContent({
            model: "gemini-embedding-2",
            config: {
                outputDimensionality: 768
            },
            contents: text,
        });

        return response.embeddings; 
    } catch (err) {
        console.error("Embedding generation failed:", err);
        throw err;
    }
}

module.exports= generateEmbeddings;