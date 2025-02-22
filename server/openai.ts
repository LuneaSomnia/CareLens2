import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeSymptoms(symptoms: string[], userProfile?: {
  age?: number;
  gender?: string;
  medicalHistory?: string[];
  familyHistory?: string[];
  lifestyle?: {
    smoking: boolean;
    alcohol: boolean;
    diet: string[];
    exercise: {
      type: string;
      frequency: string;
      duration: string;
    };
  };
}) {
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
          content: `Analyze these symptoms: ${symptoms.join(", ")}
          ${userProfile ? `
          Consider the following patient information:
          - Age: ${userProfile.age || 'Not provided'}
          - Gender: ${userProfile.gender || 'Not provided'}
          - Medical History: ${userProfile.medicalHistory?.join(", ") || 'None'}
          - Family History: ${userProfile.familyHistory?.join(", ") || 'None'}
          - Lifestyle:
            * Smoking: ${userProfile.lifestyle?.smoking ? 'Yes' : 'No'}
            * Alcohol: ${userProfile.lifestyle?.alcohol ? 'Yes' : 'No'}
            * Diet: ${userProfile.lifestyle?.diet?.join(", ") || 'Not specified'}
            * Exercise: ${userProfile.lifestyle?.exercise.type} ${userProfile.lifestyle?.exercise.frequency} ${userProfile.lifestyle?.exercise.duration}
          ` : ''}`
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