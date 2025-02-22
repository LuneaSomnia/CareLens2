import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeSymptoms(symptoms: string[]) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a medical assistant. Analyze symptoms and provide potential conditions and recommendations in JSON format with the following structure: { conditions: [{ name: string, confidence: number, severity: 'low' | 'medium' | 'high' }], recommendations: string[], emergencyWarning?: string }"
        },
        {
          role: "user",
          content: `Analyze these symptoms: ${symptoms.join(", ")}`
        }
      ],
      response_format: { type: "json_object" }
    });

    // Ensure response.choices[0].message.content is not null before parsing
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response content from OpenAI");
    }

    return JSON.parse(content);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error("Failed to analyze symptoms: " + errorMessage);
  }
}

export async function assessHealthRisks(profile: any) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        {
          role: "system",
          content: "You are a health risk assessment expert. Analyze the health profile and provide risk assessment in JSON format with the following structure: { riskFactors: [{ condition: string, risk: number, factors: string[], recommendations: string[] }], overallHealth: { score: number, summary: string } }"
        },
        {
          role: "user",
          content: `Analyze this health profile: ${JSON.stringify(profile)}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response content from OpenAI");
    }

    return JSON.parse(content);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    throw new Error("Failed to assess health risks: " + errorMessage);
  }
}