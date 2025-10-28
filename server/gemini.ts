import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateAIResponse(message: string): Promise<string> {
  try {
    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY not found, using fallback response");
      return getFallbackResponse(message);
    }

    const systemPrompt = `You are a helpful AI assistant for a healthcare platform called MedicateConnect.
    You can help users with:
    - General health questions and information (provide educational information about common symptoms, causes, and general wellness tips)
    - Understanding medical terms
    - Appointment scheduling guidance
    - Prescription information (but never provide medical advice)
    - Platform navigation help

    For health-related questions, provide informative, educational responses about common conditions, symptoms, and general health information. Always emphasize that this is not medical advice and users should consult healthcare professionals for personal health concerns.

    Keep responses concise, helpful, and healthcare-focused. Be informative and educational rather than giving medical advice.`;

    const model = ai.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: message }
    ]);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini API response:", text); // Debug log

    return text || "I'm sorry, I couldn't process that request. Please try again.";
  } catch (error) {
    console.error("Gemini API error:", error);
    console.log("Falling back to keyword-based response for:", message);
    return getFallbackResponse(message);
  }
}

function getFallbackResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
    return "Hello! I'm your AI health assistant for MedicateConnect. How can I help you today?";
  }

  if (lowerMessage.includes("appointment")) {
    return "To book an appointment, go to the Doctors page, select a doctor, and click 'Book Appointment'. For specific medical concerns, please consult with a healthcare professional.";
  }

  if (lowerMessage.includes("doctor") || lowerMessage.includes("find")) {
    return "You can find doctors by visiting the Doctors page. Use the search bar or filter by specialty to find the right healthcare professional for your needs.";
  }

  if (lowerMessage.includes("prescription")) {
    return "Prescription management is available through your dashboard. Always follow your doctor's instructions and consult them before making any changes.";
  }

  if (lowerMessage.includes("headache") || lowerMessage.includes("pain")) {
    return "Headaches can be caused by various factors including stress, dehydration, lack of sleep, eye strain, or tension. Common causes include muscle tension, poor posture, or environmental factors. For persistent or severe headaches, please consult a healthcare professional for proper diagnosis and treatment.";
  }

  if (lowerMessage.includes("fever") || lowerMessage.includes("temperature")) {
    return "Fever is often a sign that your body is fighting an infection. Common causes include viral or bacterial infections. Stay hydrated, rest, and monitor your temperature. If fever is high (above 103°F/39.4°C) or persistent, consult a healthcare professional.";
  }

  if (lowerMessage.includes("cough") || lowerMessage.includes("cold")) {
    return "Coughs are often caused by viral infections, allergies, or irritants. Stay hydrated, use honey for soothing, and rest. If cough persists for more than a week or is accompanied by high fever, consult a healthcare professional.";
  }

  return "I'm here to help with general health information and platform navigation. For specific medical concerns, please consult with a healthcare professional. How else can I assist you?";
}
