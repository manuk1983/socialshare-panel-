import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import {
  type GenerateFormInput,
  ASPECT_RATIOS,
  IMAGE_SIZES,
  findOption,
} from "@/lib/options";
import { composePrompt, validateGenerateInput } from "@/lib/prompt-engine";

export const runtime = "nodejs";
export const maxDuration = 120;

const MODEL_ID = "gemini-3-pro-image";

type GenerateBody = GenerateFormInput & {
  imageBase64: string;
  mimeType: string;
};

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY tanımlı değil. .env.local dosyasına anahtar ekleyip sunucuyu yeniden başlatın.",
        code: "MISSING_API_KEY",
      },
      { status: 503 },
    );
  }

  let body: GenerateBody;
  try {
    body = (await request.json()) as GenerateBody;
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON gövdesi" }, { status: 400 });
  }

  const validationError = validateGenerateInput(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  if (!body.imageBase64 || !body.mimeType) {
    return NextResponse.json(
      { error: "Ürün görseli zorunludur (imageBase64 + mimeType)" },
      { status: 400 },
    );
  }

  if (!findOption(ASPECT_RATIOS, body.aspectRatio)) {
    return NextResponse.json({ error: "Geçersiz aspect ratio" }, { status: 400 });
  }
  if (!findOption(IMAGE_SIZES, body.imageSize)) {
    return NextResponse.json({ error: "Geçersiz image size" }, { status: 400 });
  }

  const allowedMime = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedMime.includes(body.mimeType)) {
    return NextResponse.json(
      { error: "Desteklenen görseller: JPEG, PNG, WebP" },
      { status: 400 },
    );
  }

  // Strip data-URL prefix if the client sent one
  const base64 = body.imageBase64.replace(/^data:[^;]+;base64,/, "");

  let composed;
  try {
    composed = composePrompt(body);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Prompt oluşturulamadı" },
      { status: 400 },
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: body.mimeType,
                data: base64,
              },
            },
            { text: composed.prompt },
          ],
        },
      ],
      config: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: {
          aspectRatio: body.aspectRatio,
          imageSize: body.imageSize,
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    let imageData: string | null = null;
    let imageMime = "image/png";
    const textNotes: string[] = [];

    for (const part of parts) {
      if (part.text) textNotes.push(part.text);
      if (part.inlineData?.data) {
        imageData = part.inlineData.data;
        if (part.inlineData.mimeType) imageMime = part.inlineData.mimeType;
      }
    }

    if (!imageData) {
      return NextResponse.json(
        {
          error:
            "Model görsel döndürmedi. Prompt veya güvenlik filtresini kontrol edin.",
          details: textNotes.join("\n").slice(0, 2000) || undefined,
          promptPreview: composed.prompt.slice(0, 500),
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      imageBase64: imageData,
      mimeType: imageMime,
      model: MODEL_ID,
      prompt: composed.prompt,
      meta: {
        productLabel: composed.productLabel,
        styleLabel: composed.styleLabel,
        effectiveGender: composed.effectiveGender,
        aspectRatio: body.aspectRatio,
        imageSize: body.imageSize,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const status = /api key|permission|auth|401|403/i.test(message) ? 401 : 502;
    return NextResponse.json(
      {
        error: "Gemini API çağrısı başarısız",
        details: message.slice(0, 1500),
      },
      { status },
    );
  }
}
