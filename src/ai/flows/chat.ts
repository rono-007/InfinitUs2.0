'use server';
/**
 * @fileOverview A flow that provides chat functionality.
 *
 * - chat - A function that returns a response to a user's message.
 */

import {ai} from '@/ai/genkit';
import {
  ChatInput,
  ChatInputSchema,
  ChatOutput,
  ChatOutputSchema,
} from '@/lib/ai-types';

const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  prompt: `You are a helpful and friendly AI assistant named Lexi.

Continue the following conversation.

{{#each history}}
  {{#if this.isUser}}
    User: {{{this.text}}}
  {{else}}
    Lexi: {{{this.text}}}
  {{/if}}
{{/each}}

User: {{{message}}}
Lexi:
`,
  model: 'googleai/gemini-2.0-flash',
  config: {},
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const {output} = await chatPrompt(input);
    return output!;
  }
);

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}
