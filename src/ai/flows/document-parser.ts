'use server';
/**
 * @fileOverview A flow that parses documents to extract text.
 *
 * - parseDocument - A function that handles document parsing.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import pdf from 'pdf-parse';
import mammoth from 'mammoth';

const DocumentInputSchema = z.object({
  fileContentBase64: z.string().describe('The Base64 encoded content of the file.'),
  mimeType: z.string().describe('The MIME type of the file.'),
});

const DocumentOutputSchema = z.object({
  text: z.string().describe('The extracted text from the document.'),
});

export const parseDocumentFlow = ai.defineFlow(
  {
    name: 'parseDocumentFlow',
    inputSchema: DocumentInputSchema,
    outputSchema: DocumentOutputSchema,
  },
  async ({ fileContentBase64, mimeType }) => {
    const fileBuffer = Buffer.from(fileContentBase64, 'base64');

    let text = '';
    if (mimeType === 'application/pdf') {
      const data = await pdf(fileBuffer);
      text = data.text;
    } else if (
      mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      text = result.value;
    } else if (mimeType.startsWith('text/')) {
      text = fileBuffer.toString('utf-8');
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    return { text };
  }
);
