import { OpenAI } from 'openai';

export const openai: OpenAI = (() => {
  if (process.env.OPENAI_TOKEN) {
    return new OpenAI({
      apiKey: process.env.OPENAI_TOKEN,
    });
  }
})() as OpenAI;
