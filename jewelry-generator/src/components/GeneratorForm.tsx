"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ASPECT_RATIOS,
  BACKGROUND_TONES,
  CLOTHING_COLORS,
  CLOTHING_STYLES,
  ENVIRONMENTS,
  IMAGE_SIZES,
  MODEL_OPTIONS,
  PRODUCT_TYPES,
  SHOOT_STYLES,
  type GenerateFormInput,
} from "@/lib/options";

type HealthState = {
  hasApiKey: boolean;
  message: string;
} | null;

type GenerateResponse = {
  imageBase64?: string;
  mimeType?: string;
  prompt?: string;
  error?: string;
  details?: string;
  code?: string;
  meta?: {
    productLabel: string;
    styleLabel: string;
    effectiveGender: string;
    aspectRatio: string;
    imageSize: string;
  };
};

const DEFAULTS: GenerateFormInput = {
  productType: "ring",
  modelGender: "female",
  shootStyle: "editorial",
  backgroundTone: "white-marble",
  clothingStyle: "silk-blouse",
  clothingColor: "white",
  environment: "white-marble",
  aspectRatio: "4:5",
  imageSize: "2K",
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

export default function GeneratorForm() {
  const [form, setForm] = useState<GenerateFormInput>(DEFAULTS);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultMime, setResultMime] = useState("image/png");
  const [promptUsed, setPromptUsed] = useState<string | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [health, setHealth] = useState<HealthState>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((data) =>
        setHealth({
          hasApiKey: Boolean(data.hasApiKey),
          message: data.message ?? "",
        }),
      )
      .catch(() =>
        setHealth({
          hasApiKey: false,
          message: "Sağlık kontrolü başarısız",
        }),
      );
  }, []);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const update = useCallback(<K extends keyof GenerateFormInput>(key: K, value: GenerateFormInput[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // Minimal studio implies modelsiz; bridal defaults female clothing cues
      if (key === "shootStyle" && value === "minimal") {
        next.modelGender = "none";
      }
      if (key === "modelGender" && value === "none") {
        // keep style as-is; prompt engine forces studio path
      }
      if (key === "shootStyle" && value === "bridal") {
        next.clothingStyle = "bridal-silk";
        next.clothingColor = "ivory";
        next.environment = "bridal-props";
        next.backgroundTone = "cream-champagne";
      }
      if (key === "modelGender" && value === "male") {
        next.backgroundTone = "black-graphite";
        next.clothingStyle = "black-tee";
        next.clothingColor = "black";
        next.environment = "black-marble";
      }
      if (key === "modelGender" && value === "female" && prev.modelGender === "male") {
        next.backgroundTone = "white-marble";
        next.clothingStyle = "silk-blouse";
        next.clothingColor = "white";
        next.environment = "white-marble";
      }
      return next;
    });
  }, []);

  const canGenerate = useMemo(() => Boolean(file) && !loading, [file, loading]);

  async function fileToBase64(f: File): Promise<string> {
    const buffer = await f.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
    return btoa(binary);
  }

  async function onGenerate() {
    setError(null);
    if (!file) {
      setError("Lütfen bir ürün fotoğrafı yükleyin.");
      return;
    }
    setLoading(true);
    setResultUrl(null);
    setPromptUsed(null);

    try {
      const imageBase64 = await fileToBase64(file);
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          imageBase64,
          mimeType: file.type || "image/jpeg",
        }),
      });
      const data = (await res.json()) as GenerateResponse;
      if (!res.ok) {
        const detail = data.details ? ` — ${data.details}` : "";
        setError(`${data.error ?? "Üretim başarısız"}${detail}`);
        return;
      }
      if (!data.imageBase64) {
        setError("Yanıtta görsel yok.");
        return;
      }
      const mime = data.mimeType || "image/png";
      setResultMime(mime);
      setResultUrl(`data:${mime};base64,${data.imageBase64}`);
      setPromptUsed(data.prompt ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ağ hatası");
    } finally {
      setLoading(false);
    }
  }

  function onDownload() {
    if (!resultUrl) return;
    const ext = resultMime.includes("jpeg") ? "jpg" : "png";
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `etsy-${form.productType}-${form.shootStyle}-${form.imageSize}.${ext}`;
    a.click();
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Etsy Takı Görsel Üretici</p>
          <h1>Ürün fotoğrafından 2K liste görseli</h1>
        </div>
        <div
          className={`status-pill ${health?.hasApiKey ? "ok" : "warn"}`}
          title={health?.message}
        >
          {health == null
            ? "Kontrol ediliyor…"
            : health.hasApiKey
              ? "API anahtarı hazır"
              : "API anahtarı yok"}
        </div>
      </header>

      <div className="layout">
        <section className="panel form-panel">
          <Field label="Ürün fotoğrafı">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setFile(f);
                setResultUrl(null);
                setError(null);
              }}
            />
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Yüklenen ürün" className="thumb" />
            ) : (
              <p className="hint">JPEG / PNG / WebP — ürün net görünmeli</p>
            )}
          </Field>

          <div className="grid-2">
            <Field label="Ürün tipi">
              <select
                value={form.productType}
                onChange={(e) => update("productType", e.target.value as GenerateFormInput["productType"])}
              >
                {PRODUCT_TYPES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Model">
              <select
                value={form.modelGender}
                onChange={(e) => update("modelGender", e.target.value as GenerateFormInput["modelGender"])}
              >
                {MODEL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Çekim stili">
              <select
                value={form.shootStyle}
                onChange={(e) => update("shootStyle", e.target.value as GenerateFormInput["shootStyle"])}
              >
                {SHOOT_STYLES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Arka plan tonu">
              <select
                value={form.backgroundTone}
                onChange={(e) =>
                  update("backgroundTone", e.target.value as GenerateFormInput["backgroundTone"])
                }
              >
                {BACKGROUND_TONES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Kıyafet stili">
              <select
                value={form.clothingStyle}
                onChange={(e) =>
                  update("clothingStyle", e.target.value as GenerateFormInput["clothingStyle"])
                }
                disabled={form.modelGender === "none" || form.shootStyle === "minimal"}
              >
                {CLOTHING_STYLES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Kıyafet rengi">
              <select
                value={form.clothingColor}
                onChange={(e) =>
                  update("clothingColor", e.target.value as GenerateFormInput["clothingColor"])
                }
                disabled={form.modelGender === "none" || form.shootStyle === "minimal"}
              >
                {CLOTHING_COLORS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Ortam">
              <select
                value={form.environment}
                onChange={(e) =>
                  update("environment", e.target.value as GenerateFormInput["environment"])
                }
              >
                {ENVIRONMENTS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Boyut / oran">
              <div className="inline-pair">
                <select
                  value={form.aspectRatio}
                  onChange={(e) =>
                    update("aspectRatio", e.target.value as GenerateFormInput["aspectRatio"])
                  }
                >
                  {ASPECT_RATIOS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <select
                  value={form.imageSize}
                  onChange={(e) =>
                    update("imageSize", e.target.value as GenerateFormInput["imageSize"])
                  }
                >
                  {IMAGE_SIZES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </Field>
          </div>

          {form.shootStyle === "minimal" || form.modelGender === "none" ? (
            <p className="hint">
              Minimal stüdyo / modelsiz: kıyafet alanları kullanılmaz; ürün sergi yüzeyi üzerinden üretilir.
            </p>
          ) : null}

          <div className="actions">
            <button
              type="button"
              className="btn primary"
              disabled={!canGenerate}
              onClick={onGenerate}
            >
              {loading ? "Üretiliyor…" : "Görsel üret"}
            </button>
            <button
              type="button"
              className="btn"
              disabled={!resultUrl}
              onClick={onDownload}
            >
              İndir
            </button>
          </div>

          {error ? <p className="error">{error}</p> : null}
          {!health?.hasApiKey && health ? (
            <p className="warn-text">
              Arayüz anahtarsız açılır. Üretim için `GEMINI_API_KEY` ekleyin (bkz. README).
            </p>
          ) : null}
        </section>

        <section className="panel preview-panel">
          <h2>Önizleme</h2>
          {resultUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resultUrl} alt="Üretilen görsel" className="result" />
          ) : (
            <div className="empty-preview">
              {loading
                ? "Gemini görsel üretiyor — bu 30–90 sn sürebilir…"
                : "Üretilen görsel burada görünecek"}
            </div>
          )}

          {promptUsed ? (
            <div className="prompt-box">
              <button
                type="button"
                className="linkish"
                onClick={() => setShowPrompt((v) => !v)}
              >
                {showPrompt ? "İngilizce prompt’u gizle" : "İngilizce prompt’u göster"}
              </button>
              {showPrompt ? <pre>{promptUsed}</pre> : null}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
