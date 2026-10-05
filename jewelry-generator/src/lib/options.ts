/** Turkish UI options mapped to English prompt slots. */

export const PRODUCT_TYPES = [
  { value: "ring", label: "Yüzük", en: "ring" },
  { value: "earring", label: "Küpe", en: "earring" },
  { value: "necklace", label: "Kolye", en: "necklace" },
  { value: "bracelet", label: "Bileklik", en: "bracelet" },
] as const;

export const MODEL_OPTIONS = [
  { value: "female", label: "Kadın", en: "female" },
  { value: "male", label: "Erkek", en: "male" },
  { value: "none", label: "Modelsiz", en: "none" },
] as const;

export const SHOOT_STYLES = [
  { value: "editorial", label: "Editöryal", en: "editorial fashion" },
  { value: "lifestyle", label: "Lifestyle", en: "luxury lifestyle" },
  { value: "minimal", label: "Minimal stüdyo", en: "minimal studio" },
  { value: "bridal", label: "Bridal", en: "bridal collection" },
  { value: "everyday", label: "Günlük lüks", en: "everyday luxury" },
] as const;

export const BACKGROUND_TONES = [
  {
    value: "powder-blue",
    label: "Pastel mavi",
    palette: "Powder blue, soft periwinkle, cool ivory, subtle pearl reflections",
    background:
      "Soft powder-blue Italian marble backdrop with cool ivory gradients and fine marble texture",
  },
  {
    value: "lavender",
    label: "Lavanta",
    palette: "Soft lavender, pale lilac, warm ivory, subtle pearl reflections",
    background:
      "Soft lavender marble backdrop with warm ivory transitions and premium studio atmosphere",
  },
  {
    value: "coral-rose",
    label: "Mercan / pembe",
    palette: "Coral rose, soft blush pink, warm ivory, champagne highlights",
    background:
      "Soft coral-rose marble backdrop with champagne ivory transitions and elegant studio light",
  },
  {
    value: "mint",
    label: "Mint",
    palette: "Soft mint, pale sage, warm white, subtle pearl reflections",
    background:
      "Soft mint marble backdrop with warm white gradients and fine stone texture",
  },
  {
    value: "cream-champagne",
    label: "Krem / şampanya",
    palette: "Cream, champagne, soft ivory, warm white, subtle pearl reflections",
    background:
      "Premium cream and champagne Italian marble backdrop with warm ivory transitions",
  },
  {
    value: "white-marble",
    label: "Beyaz mermer",
    palette:
      "Pure white, warm white, soft ivory, light stone gray, subtle pearl reflections, soft neutral gradients",
    background:
      "Premium White Italian Marble backdrop, soft luxury white gradients, fine white marble texture, warm ivory transitions, minimal architectural details, premium studio atmosphere",
  },
  {
    value: "black-graphite",
    label: "Siyah / grafit",
    palette:
      "Matte Black, Charcoal, Graphite, Dark Slate Gray, Black Onyx, Gunmetal, Deep Shadow Gray, Soft Metallic Silver Highlights",
    background:
      "Premium Black Italian Marble, Black Onyx stone, Graphite stone texture, Matte Black ceramic, dark architectural elements, luxury black gradients, minimal premium studio atmosphere",
  },
] as const;

export const CLOTHING_STYLES = [
  {
    value: "silk-blouse",
    label: "İpek bluz",
    female: "Luxury white silk blouse, soft satin finish, no logos, no patterns, softly out of focus",
    male: "Premium silk-blend dress shirt in a refined monochrome tone, no logos, softly out of focus",
  },
  {
    value: "linen-shirt",
    label: "Keten gömlek",
    female: "Luxury white linen shirt, clean open collar, no logos, no bold patterns, softly out of focus",
    male: "Premium black or charcoal linen shirt, clean collar, no logos, no bold patterns, softly out of focus",
  },
  {
    value: "cashmere",
    label: "Kaşmir",
    female: "Soft cashmere knit in a neutral luxury tone, minimal silhouette, no logos, softly out of focus",
    male: "Soft black cashmere knit, quiet luxury silhouette, no logos, softly out of focus",
  },
  {
    value: "blazer",
    label: "Blazer",
    female: "Elegant tailored blazer with clean sleeves, neutral luxury fabric, no logos, softly out of focus",
    male: "Tailored black blazer or premium black overshirt, sleeves framing the jewelry, no logos, softly out of focus",
  },
  {
    value: "black-tee",
    label: "Siyah tişört",
    female: "Minimal premium black crew-neck top, clean luxury casual, no logos, softly out of focus",
    male: "Premium black crew neck t-shirt, luxury monochrome casual wear, no logos, no bold patterns, softly out of focus",
  },
  {
    value: "bridal-silk",
    label: "Bridal ipek",
    female:
      "Soft ivory bridal silk, delicate ribbon accents, refined open neckline, no logos, no bold patterns, softly out of focus",
    male: "Ivory silk formal shirt with refined collar, understated bridal-adjacent luxury, no logos, softly out of focus",
  },
] as const;

export const CLOTHING_COLORS = [
  { value: "white", label: "Beyaz", en: "white" },
  { value: "ivory", label: "Fildişi", en: "ivory" },
  { value: "cream", label: "Krem", en: "cream" },
  { value: "blush", label: "Pudra", en: "soft blush" },
  { value: "black", label: "Siyah", en: "black" },
  { value: "charcoal", label: "Antrasit", en: "charcoal" },
  { value: "navy", label: "Lacivert", en: "navy" },
] as const;

export const ENVIRONMENTS = [
  {
    value: "white-marble",
    label: "Beyaz mermer",
    en: "Premium White Italian Marble surface and backdrop",
  },
  {
    value: "travertine",
    label: "Traverten",
    en: "Sculptural travertine block or pedestal with natural stone texture",
  },
  {
    value: "ceramic",
    label: "Seramik",
    en: "Matte white ceramic display element with clean architectural lines",
  },
  {
    value: "linen-fold",
    label: "Kumaş kıvrımı",
    en: "Soft white linen fabric folds as a luxury support surface",
  },
  {
    value: "black-marble",
    label: "Siyah mermer",
    en: "Premium Black Italian Marble / Black Onyx surface and backdrop",
  },
  {
    value: "lifestyle-props",
    label: "Lifestyle props",
    en: "Refined lifestyle props (ceramic cup, hardcover book, silk scarf, sunglasses, clutch) kept secondary to the jewelry",
  },
  {
    value: "bridal-props",
    label: "Bridal props",
    en: "Single white rose, soft ivory silk ribbon, or delicate bridal bouquet — no ceremony venue",
  },
] as const;

export const ASPECT_RATIOS = [
  { value: "1:1", label: "1:1 (kare)" },
  { value: "4:5", label: "4:5 (Etsy önerilen)" },
  { value: "3:4", label: "3:4" },
  { value: "9:16", label: "9:16" },
] as const;

export const IMAGE_SIZES = [
  { value: "1K", label: "1K" },
  { value: "2K", label: "2K (önerilen)" },
  { value: "4K", label: "4K" },
] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number]["value"];
export type ModelGender = (typeof MODEL_OPTIONS)[number]["value"];
export type ShootStyle = (typeof SHOOT_STYLES)[number]["value"];
export type BackgroundTone = (typeof BACKGROUND_TONES)[number]["value"];
export type ClothingStyle = (typeof CLOTHING_STYLES)[number]["value"];
export type ClothingColor = (typeof CLOTHING_COLORS)[number]["value"];
export type Environment = (typeof ENVIRONMENTS)[number]["value"];
export type AspectRatio = (typeof ASPECT_RATIOS)[number]["value"];
export type ImageSize = (typeof IMAGE_SIZES)[number]["value"];

export type GenerateFormInput = {
  productType: ProductType;
  modelGender: ModelGender;
  shootStyle: ShootStyle;
  backgroundTone: BackgroundTone;
  clothingStyle: ClothingStyle;
  clothingColor: ClothingColor;
  environment: Environment;
  aspectRatio: AspectRatio;
  imageSize: ImageSize;
};

export function findOption<T extends { value: string }>(
  list: readonly T[],
  value: string,
): T | undefined {
  return list.find((item) => item.value === value);
}
