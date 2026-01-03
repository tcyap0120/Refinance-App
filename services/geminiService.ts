
import { GoogleGenAI } from "@google/genai";
import { ClientData, DecisionResult } from "../types";

// NOTE: In a real production app, this call should happen on the backend to protect the API Key.
// For this frontend demo, we assume the environment variable is available.

const apiKey = process.env.API_KEY || ''; 

export const generateClientCommunication = async (
  client: ClientData, 
  results: DecisionResult,
  type: 'EMAIL' | 'WHATSAPP'
): Promise<string> => {
  if (!apiKey) return "Error: API Key is missing.";

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are a professional mortgage refinance banker.
    Write a ${type === 'WHATSAPP' ? 'short, friendly WhatsApp message' : 'formal email'} 
    to a client named ${client.name}.

    Client Profile:
    - Employment: ${client.employmentType}
    - Goal: ${client.request.goal}
    
    Banking Analysis Results:
    - Status: ${results.approved ? 'APPROVED' : 'REJECTED'}
    - DSR: ${results.dsr.toFixed(1)}% (Limit 70%)
    - Stress DSR: ${results.stressDsr.toFixed(1)}% (Limit 75%)
    - Net Disposable Income: $${results.ndi.toFixed(0)}
    - Max Eligible Loan: $${results.maxEligibleLoan.toLocaleString()}
    
    Rejection Reasons (if any): ${results.reason.join(', ')}

    Instructions:
    1. If Approved: Congratulate them, mention the estimated monthly saving ($${Math.round(results.monthlySavings)}) or cash out amount.
    2. If Rejected: Politely explain why (e.g., DSR too high), and suggest a lower loan amount or adding a guarantor.
    3. Be professional but empathetic.
    4. Do not use placeholders.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Could not generate message.";
  } catch (error) {
    // Sanitize error object to prevent circular JSON error in console
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Gemini API Error:", msg);
    return "Error generating communication. Please check API configuration.";
  }
};
