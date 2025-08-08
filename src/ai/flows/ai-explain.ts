'use server';
// This file implements the Genkit flow for the AI Explain feature, allowing users to get structured explanations of selected messages or documents.

import {ai} from '@/ai/genkit';
import {
  ExplainInput,
  ExplainInputSchema,
  ExplainOutput,
  ExplainOutputSchema,
} from '@/lib/ai-types';

const explainPrompt = ai.definePrompt({
  name: 'explainPrompt',
  input: {schema: ExplainInputSchema},
  output: {schema: ExplainOutputSchema},
  prompt: `You are an AI assistant designed to provide structured explanations of various types of content.

  Based on the provided input (either a message, document, or text), generate a detailed and well-formatted explanation. Summarize the content, identify key information, and provide step-by-step reasoning to aid understanding.

  If explaining code, provide debugging steps and potential solutions.
  If explaining a document, reference specific sections or pages.
  If explaining a message, provide context and elaborate on the key points.

  Input: {{{text}}}
  Message ID: {{{targetMessageId}}}
  Attachment ID: {{{attachmentId}}}
  `,
});

const aiExplainFlow = ai.defineFlow(
  {
    name: 'aiExplainFlow',
    inputSchema: ExplainInputSchema,
    outputSchema: ExplainOutputSchema,
  },
  async input => {
    const {output} = await explainPrompt(input);
    return output!;
  }
);

export async function aiExplain(input: ExplainInput): Promise<ExplainOutput> {
  return aiExplainFlow(input);
}
