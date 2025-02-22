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
          content: "You are a medical assistant. Analyze symptoms and provide potential conditions and recommendations in JSON format."
        },
        {
          role: "user",
          content: `Analyze these symptoms: ${symptoms.join(", ")}`
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    throw new Error("Failed to analyze symptoms: " + error.message);
  }
}

export async function assessHealthRisks(profile: any) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        {
          role: "system",
          content: "You are a health risk assessment expert. Analyze the health profile and provide risk assessment in JSON format."
        },
        {
          role: "user",
          content: `Analyze this health profile: ${JSON.stringify(profile)}`
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    throw new Error("Failed to assess health risks: " + error.message);
  }
}
