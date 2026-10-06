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

UI Türkçedir. Fiyatlar USD ($) olarak gösterilir. Kesim görselleri yerel SVG silüetlerdir.

Veri kaynağı: [diamondsizecharts.com](https://diamondsizecharts.com/).

## Görseller

```bash
python3 scripts/generate_silhouettes.py
```

Temiz kesim silüetleri `public/images/*.svg` altına yazılır (bulanık chart fotoğrafları yerine).
