import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateAIResponse(message: string): Promise<string> {
  try {
    const systemPrompt = `You are a helpful AI assistant for a healthcare platform called Medicate. 
    You can help users with:
    - General health questions and information
    - Understanding medical terms
    - Appointment scheduling guidance
    - Prescription information (but never provide medical advice)
    - Platform navigation help
    
    Always remind users that for specific medical concerns, they should consult with a healthcare professional.
    Keep responses concise, helpful, and healthcare-focused.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: message,
    });

    return response.text || "I'm sorry, I couldn't process that request. Please try again.";
  } catch (error) {
    console.error("Gemini API error:", error);
    return "I'm currently experiencing technical difficulties. Please try again later or contact support.";
  }
}