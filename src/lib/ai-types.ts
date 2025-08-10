import {z} from 'zod';

export const ExplainInputSchema = z.object({
  targetMessageId: z
    .string()
    .optional()
    .describe('The ID of the message to explain.'),
  attachmentId: z
    .string()
    .optional()
    .describe('The ID of the attachment to explain.'),
  text: z
    .string()
    .optional()
    .describe('The text to explain, if no message or attachment is selected.'),
});
export type ExplainInput = z.infer<typeof ExplainInputSchema>;

export const ExplainOutputSchema = z.object({
  explanation: z
    .string()
    .describe('A structured, AI-powered explanation of the content.'),
});
export type ExplainOutput = z.infer<typeof ExplainOutputSchema>;

export const ChatInputSchema = z.object({
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        text: z.string(),
        isUser: z.boolean(),
      })
    )
    .describe('The chat history.'),
  message: z.string().describe('The user message.'),
  model: z.string().optional().describe('The model to use for the response.'),
  imageUrl: z.string().optional().describe("An image to be included in the prompt, as a data URI."),
  documentText: z.string().optional().describe("The extracted text from an attached document."),
  thinkLonger: z.boolean().optional().describe("Whether to generate a longer, more detailed response.")
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.object({
  message: z.string().describe('The assistant response.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export const SuggestionOutputSchema = z
  .array(z.string().describe('A suggested question to ask the chatbot.'))
  .describe('An array of suggested questions.');
export type SuggestionOutput = z.infer<typeof SuggestionOutputSchema>;
