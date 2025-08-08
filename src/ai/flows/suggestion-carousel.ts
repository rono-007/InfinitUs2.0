'use server';
/**
 * @fileOverview A flow that provides suggestion carousel of example questions.
 *
 * - getSuggestions - A function that returns a list of suggested questions.
 * - SuggestionOutput - The return type for the getSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestionOutputSchema = z.array(z.string().describe('A suggested question to ask the chatbot.'));
export type SuggestionOutput = z.infer<typeof SuggestionOutputSchema>;

const suggestionCarouselPrompt = ai.definePrompt({
  name: 'suggestionCarouselPrompt',
  output: {schema: SuggestionOutputSchema},
  prompt: `You are a chatbot assistant that is helpful and friendly.

Generate a list of example questions a user might ask to start a conversation and explore the chatbot's capabilities. These questions should be diverse and engaging.

Return the questions as a JSON array of strings. Do not include any other text or formatting.`,
});

const suggestionCarouselFlow = ai.defineFlow(
  {
    name: 'suggestionCarouselFlow',
    outputSchema: SuggestionOutputSchema,
  },
  async () => {
    const {output} = await suggestionCarouselPrompt({});
    return output!;
  }
);

export async function getSuggestions(): Promise<SuggestionOutput> {
  return suggestionCarouselFlow();
}
