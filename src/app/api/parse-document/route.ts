import { NextRequest, NextResponse } from 'next/server';
import { IncomingForm } from 'formidable';
import { parseDocumentFlow } from '@/ai/flows/document-parser';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    const formData = await new Promise<any>((resolve, reject) => {
      const form = new IncomingForm();
      form.parse(req as any, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const file = formData.files.file[0];

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const result = await parseDocumentFlow({
      filePath: file.filepath,
      mimeType: file.mimetype,
    });
    
    return NextResponse.json({ text: result.text });
  } catch (error: any) {
    console.error('Error parsing document:', error);
    return NextResponse.json(
      { error: 'Failed to parse document', details: error.message },
      { status: 500 }
    );
  }
}
