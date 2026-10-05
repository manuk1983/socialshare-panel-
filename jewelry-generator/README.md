# Etsy Takı Görsel Üretici (v1)

Türkçe panel: ürün fotoğrafı yükle → stil/seçenekler → Gemini 3 Pro Image (`gemini-3-pro-image`) ile 2K görsel üret → indir.

## Gereksinimler

- Node.js 20+
- Google AI Studio / Gemini API anahtarı (`GEMINI_API_KEY`)
- Ücretli Gemini billing (Pro Image free tier yok)

Anahtar **olmasa da** arayüz açılır; **Üret** çağrısı net bir hata döner (`MISSING_API_KEY`).

## Kurulum

```bash
cd jewelry-generator
cp .env.example .env.local
# .env.local içine GEMINI_API_KEY=... yazın
npm install
npm run dev
```

Tarayıcı: [http://localhost:3000](http://localhost:3000)

## Ortam değişkenleri

| Değişken | Zorunlu | Açıklama |
|----------|---------|----------|
| `GEMINI_API_KEY` | Üretim için evet | Gemini Developer API anahtarı |

## Kullanım

1. Ürün fotoğrafı yükle (JPEG/PNG/WebP)
2. Ürün tipi, model (Kadın/Erkek/Modelsiz), çekim stili, arka plan, kıyafet, ortam, oran/boyut seç
3. **Görsel üret** → önizleme
4. **İndir** (varsayılan `image_size`: 2K; oranlar: 1:1, 4:5, …)

Prompt motoru Türkçe seçimleri İngilizce şablonlara doldurur (fidelity + negative bloklar sabit).

## API

- `GET /api/health` — anahtar yüklü mü
- `POST /api/generate` — `{ ...form, imageBase64, mimeType }` → `{ imageBase64, mimeType, prompt, meta }`

## Prod

```bash
npm run build
npm start
```
