import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { getSystemContext } from '@/lib/ai/context';

export const maxDuration = 30;

// Configure the OpenAI provider to use OpenRouter's base URL
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  headers: {
    'HTTP-Referer': process.env.AUTH_URL || '', // Optional: Site URL for rankings
    'X-Title': 'Globit Transient', // Optional: Site title for rankings
  },
});

export async function POST(req: Request) {
  const { messages } = await req.json();
  const systemContext = await getSystemContext();

  const result = await streamText({
    model: openrouter('google/gemma-3-27b-it:free'),
    system: systemContext,
    messages,
  });

  // Using toTextStreamResponse as a fallback for compatibility
  return result.toTextStreamResponse();
}