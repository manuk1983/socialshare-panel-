import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** UI can load without a key; this only reports whether generate is ready. */
export async function GET() {
  const hasKey = Boolean(process.env.GEMINI_API_KEY?.trim());
  return NextResponse.json({
    ok: true,
    hasApiKey: hasKey,
    model: "gemini-3-pro-image",
    message: hasKey
      ? "Gemini API anahtarı yüklü — üretim hazır."
      : "GEMINI_API_KEY yok — arayüz çalışır; üretim için anahtar gerekir.",
  });
}
