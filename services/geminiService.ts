import { GoogleGenAI } from "@google/genai";
import { ClientData, CalculationResult } from "../types";

// NOTE: In a real production app, this call should happen on the backend to protect the API Key.
// For this frontend demo, we assume the environment variable is available.

const apiKey = process.env.API_KEY || ''; 

export const generateClientCommunication = async (
  client: ClientData, 
  results: CalculationResult,
  type: 'EMAIL' | 'WHATSAPP'
): Promise<string> => {
  if (!apiKey) return "Error: API Key is missing.";

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are a professional mortgage refinance consultant.
    Write a ${type === 'WHATSAPP' ? 'short, friendly WhatsApp message' : 'formal email'} 
    to a client named ${client.name}.

    Client Details:
    - Goal: ${client.goal}
    - Property Value: $${client.propertyValue.toLocaleString()}
    - Current Loan Balance: $${client.currentLoanBalance.toLocaleString()}
    
    Refinance Analysis Results:
    - Eligibility Confidence: ${results.confidence}
    - Estimated Monthly Payment: $${results.monthlyPayment.toFixed(2)}
    - Potential Monthly Savings: $${results.monthlySavings.toFixed(2)} (if positive)
    - Cash Out Potential: $${results.cashOutAmount.toFixed(2)} (if applicable)
    
    The message should summarize these findings and ask them to schedule a call to proceed. 
    Do not include placeholders. Write the final ready-to-send text.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Could not generate message.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating communication. Please check API configuration.";
  }
};
