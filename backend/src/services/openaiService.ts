import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Generate alternative food suggestion explanation
export async function generateAlternativeExplanation(
  originalFood: string,
  alternativeFood: string
): Promise<string> {
  try {
    const prompt = `You are a kidney disease nutritionist. Explain why ${alternativeFood} is a better choice than ${originalFood} for someone with CKD. Keep it to one sentence, friendly and encouraging tone.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 50,
      temperature: 0.7,
    });

    return response.choices[0].message.content || `${alternativeFood} has lower potassium, making it kidney-friendly!`;
  } catch (error) {
    console.error('OpenAI error:', error);
    return `${alternativeFood} is a kidney-friendly alternative with lower mineral content.`;
  }
}

// Detect food from text description (fallback if image API fails)
export async function detectFoodFromDescription(description: string): Promise<string[]> {
  try {
    const prompt = `List the food items in this description: "${description}". Return only the food names separated by commas.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
      temperature: 0.5,
    });

    const content = response.choices[0].message.content || '';
    return content.split(',').map(food => food.trim()).filter(Boolean);
  } catch (error) {
    console.error('OpenAI error:', error);
    return [];
  }
}

// Generate personalized dashboard message
export async function generateDashboardMessage(
  userName: string,
  ckdStage: string,
  nutrientStatus: Record<string, number>
): Promise<string> {
  try {
    const prompt = `Generate a brief, encouraging message for ${userName}, a CKD stage ${ckdStage} patient. Their nutrient intake today: ${JSON.stringify(nutrientStatus)}. Keep it under 30 words, warm and supportive.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 60,
      temperature: 0.8,
    });

    return response.choices[0].message.content || `Great job today, ${userName}! Keep following your plan.`;
  } catch (error) {
    console.error('OpenAI error:', error);
    return `Great job today, ${userName}! Stay consistent with your diet.`;
  }
}

export default openai;
