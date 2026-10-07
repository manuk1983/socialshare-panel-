# Diamonds Carat — Karat & Fiyat Hesaplayıcı

Basit web uygulaması: diamondsizecharts.com kesim / mm / karat verilerini yerelde saklar; kesim, ölçü, adet ve karat başına fiyat ile toplam karat ve fiyat hesaplar.

## Çalıştırma

```bash
cd diamond-calculator/public
python3 -m http.server 5173
```

Tarayıcıda: http://localhost:5173

## Veriyi yenileme

```bash
cd diamond-calculator
python3 scripts/scrape.py
```

Çıktı: `data/diamonds.json` ve `public/data/diamonds.json` + `public/images/`.

## Kullanım

1. Taş kesimini seçin
2. Ölçü / boyutu seçin
3. Adet girin
4. Karat başına fiyat girin (**$ / USD**)
5. Toplam karat ve toplam fiyatı ($) görün

UI Türkçedir. Fiyatlar USD ($) olarak gösterilir. Kesim görselleri **gerçekçi stüdyo fotoğraf** stilindedir (style 1).

## Fiyat listesi & Excel

Hesaplama panelinde **Fiyat listesi (Excel)** bölümünden şablon indirip `.xlsx` yükleyin. Fiyatlar tarayıcı `localStorage` içinde kesim + ölçü bazında saklanır; seçimde otomatik dolar.

## Kesim bilgileri

**Kesim bilgileri** sekmesinden kesimlere tıklayın; mm boyutları ve şema panelde açılır (derinlik tahmini olabilir).

Detaylı Excel sütunları: Project docs `diamond-carat-calculator.md`.
