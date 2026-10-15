const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});
const History=[];

async function transformQuery(question){

    History.push({
        role: 'user',
        parts: [{text:question}]
    })

    const response= await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: History,
        config:{
            systemInstruction: `You are a query rewriting expert. Based on the provided chat history, rephrasethe "follow up user question" into a complete, standalone question that can be understood without the chat history.
            Only output the rewritten question and nothing else.
`
        }
    });

    History.pop();
    
    return response.text;    
}

async function chat(question, context){

    History.push({
        role: 'user',
        parts: [{text:question}]
    })

    const response= await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: History,
        config:{
            systemInstruction: `You are an AI assistant for a Personal Knowledge Base.

Rules:

1. Notes are provided in context, Answer only using the provided notes.

2. If answer is unavailable,
say

"I couldn't find that in your notes." (or something similar)

3. Never hallucinate.

Context: ${context}
`
        }
    });

    History.push({
        role:'model',
        parts:[{text: response.text}]
    })

    return response.text;
}

module.exports= {chat, transformQuery};