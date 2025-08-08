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
  prompt: `You are a helpful and friendly AI assistant named InfinitUs 2.0.

Continue the following conversation.

{{#each history}}
  {{#if this.isUser}}
    User: {{{this.text}}}
  {{else}}
    InfinitUs 2.0: {{{this.text}}}
  {{/if}}
{{/each}}

User: {{{message}}}
InfinitUs 2.0:
`,
  config: {},
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const {output} = await chatPrompt(input, { model: input.model });
    return output!;
  }
);

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}
