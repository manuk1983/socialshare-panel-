import {
  BACKGROUND_TONES,
  CLOTHING_COLORS,
  CLOTHING_STYLES,
  ENVIRONMENTS,
  MODEL_OPTIONS,
  PRODUCT_TYPES,
  SHOOT_STYLES,
  findOption,
  type ClothingColor,
  type ClothingStyle,
  type GenerateFormInput,
  type ModelGender,
  type ProductType,
  type ShootStyle,
} from "./options";

type AnatomyProfile = {
  wearSurface: string;
  frameIncludes: string;
  fitRules: string;
  doNot: string;
  importantClose: string;
  negativeExtra: string;
};

const ANATOMY: Record<ProductType, AnatomyProfile> = {
  ring: {
    wearSurface: "finger",
    frameIncludes:
      "the fingers, hand, wrist, lower forearm, part of the shoulder, neck, jawline, or lower face, while keeping the ring as the primary subject",
    fitRules: `The ring MUST fit the {{genderAdj}} finger perfectly and anatomically correctly.
The ring MUST physically sit on the finger naturally.

The ring should:
follow natural finger anatomy,
show realistic contact with skin,
create natural pressure points,
display believable fit,
maintain authentic wearing proportions.

DO NOT:
make the ring float,
embed the ring into skin,
oversize the ring,
make fingers unnaturally thin,
stretch ring proportions,
create impossible finger positions.

The ring MUST look truly worn on a real human body.

Scale Accuracy:
Maintain true-to-life ring-to-finger ratio.
Ring dimensions must remain identical to reference.
Do not enlarge jewelry for visibility.
Product scale must remain commercially accurate.`,
    doNot: `Do not change width.
Do not change thickness.
Do not change engraving.
Do not change stone placement.
Do not change proportions.
Do not change construction.`,
    importantClose:
      "Ring MUST integrate naturally with the {{genderAdj}} body.\nNo deformation.\nNo floating ring.\nNo clipping into skin.\nNo duplicated jewelry.\nNo blurry details.",
    negativeExtra:
      "oversized ring, tiny ring, floating ring, distorted fingers, extra fingers, incorrect ring fit",
  },
  earring: {
    wearSurface: "earlobe",
    frameIncludes:
      "the ear, cheekbone, jawline, neck, fingers, hand, wrist, and subtle portions of the upper body",
    fitRules: `The earring MUST fit the {{genderAdj}} ear lobe naturally and anatomically correctly.
The earring MUST physically sit on the ear naturally.

The earring should:
follow natural ear anatomy,
show realistic contact with the earlobe skin,
display believable weight and fit,
maintain authentic wearing proportions.

DO NOT:
make the earring float,
embed the earring into skin unrealistically,
oversize the earring,
stretch earring proportions,
create impossible ear positions or distorted earlobes.

The earring MUST look truly worn on a real human body.

Scale Accuracy:
Maintain true-to-life earring-to-ear ratio.
Earring dimensions must remain identical to reference.
Do not enlarge jewelry for visibility.
Product scale must remain commercially accurate.`,
    doNot: `Do not change size.
Do not change post or backing structure.
Do not change metal color or texture.
Do not change proportions.
Do not change construction.`,
    importantClose:
      "Earring MUST integrate naturally with the {{genderAdj}} ear.\nNo deformation.\nNo floating earring.\nNo clipping into skin.\nNo duplicated jewelry.\nNo blurry details.",
    negativeExtra:
      "oversized earring, tiny earring, floating earring, distorted ear, extra ears, incorrect earring fit",
  },
  necklace: {
    wearSurface: "neck",
    frameIncludes:
      "the collarbone, neck, shoulders, upper chest, jawline, lower face, and subtle portions of the hair",
    fitRules: `The necklace MUST rest naturally around the model's neck.
The necklace MUST physically touch the skin exactly as a real necklace would.
The chain MUST follow realistic gravity.
The pendant MUST hang naturally.

The chain should:
follow natural neck anatomy,
rest naturally around the collarbone,
create realistic contact with the skin,
show authentic chain tension,
maintain identical chain length,
maintain identical pendant position,
maintain authentic weight distribution,
preserve the exact proportions from the reference image.

DO NOT:
make the necklace float,
make the chain hover,
embed the chain into skin,
embed the pendant into clothing,
stretch the chain,
shorten the chain,
lengthen the chain,
change pendant size,
change chain thickness,
create impossible chain curves,
create unrealistic tension,
move the pendant away from its natural hanging position.

The necklace MUST look truly worn on a real human body.

Scale Accuracy:
Maintain true-to-life necklace-to-body ratio.
Necklace dimensions must remain identical to reference.
Do not enlarge jewelry for visibility.
Product scale must remain commercially accurate.`,
    doNot: `Do not change chain length.
Do not change chain thickness.
Do not change pendant size.
Do not change pendant orientation.
Do not change polishing.
Do not change stone placement.
Do not change proportions.
Do not change construction.`,
    importantClose:
      "The necklace MUST integrate naturally with the {{genderAdj}} body.\nNo deformation.\nNo floating chain.\nNo floating pendant.\nNo clipping into skin.\nNo duplicated jewelry.\nNo blurry details.",
    negativeExtra:
      "floating necklace, floating chain, floating pendant, distorted neck, unrealistic chain tension, oversized pendant, tiny pendant, stretched chain, shortened chain, embedded jewelry, neckline hiding the necklace",
  },
  bracelet: {
    wearSurface: "wrist",
    frameIncludes:
      "the hand, wrist, forearm, elbow, shoulder, jawline, lower face, and subtle portions of the hair",
    fitRules: `The bracelet MUST wrap naturally around the wrist.
The bracelet MUST physically touch the skin exactly as a real bracelet would.
The bracelet MUST follow the natural anatomy of the wrist.

The bracelet should:
maintain identical circumference,
maintain identical chain thickness,
maintain identical clasp position,
maintain identical link structure,
maintain identical charm placement,
maintain identical stone placement,
create realistic contact with the skin,
show authentic bracelet tension,
preserve authentic weight distribution,
preserve the exact proportions from the reference image.

DO NOT:
make the bracelet float,
make the bracelet hover,
embed the bracelet into skin,
stretch the bracelet,
tighten the bracelet unnaturally,
make the bracelet oversized,
make the bracelet too loose,
change bracelet diameter,
change bracelet thickness,
change clasp position,
change link size,
change charm position,
change stone placement,
create impossible wrist bending,
create unrealistic bracelet tension.

The bracelet MUST look naturally worn on a real human wrist.

Scale Accuracy:
Maintain true-to-life bracelet-to-body ratio.
Bracelet dimensions must remain identical to the reference image.
Do not enlarge the bracelet for visibility.
Commercial scale accuracy is mandatory.`,
    doNot: `Do not change bracelet diameter.
Do not change bracelet thickness.
Do not change clasp position.
Do not change link structure.
Do not change charm placement.
Do not change stone placement.
Do not change polishing.
Do not change proportions.
Do not change construction.`,
    importantClose:
      "The bracelet MUST integrate naturally with the wrist.\nNo deformation.\nNo floating bracelet.\nNo clipping into skin.\nNo duplicated jewelry.\nNo blurry details.",
    negativeExtra:
      "floating bracelet, hovering bracelet, distorted wrist, oversized bracelet, undersized bracelet, stretched bracelet, tight bracelet, embedded bracelet, oversized sleeves hiding the bracelet, hands covering the bracelet, unrealistic wrist anatomy",
  },
};

const PRODUCT_PRESERVE: Record<ProductType, string> = {
  ring: "exact ring proportions, width, thickness, engravings, stone placement, edge profile, texture, polishing, craftsmanship details, and overall silhouette",
  earring:
    "exact earring proportions, width, thickness, engravings, stone placement, metal finish, texture, polishing, craftsmanship details, and overall silhouette",
  necklace:
    "exact pendant proportions, chain thickness, chain length, pendant size, polishing, craftsmanship details, stone placement (if present), clasp position, metal behavior, and overall silhouette",
  bracelet:
    "exact bracelet proportions, circumference, chain thickness, clasp position, link structure, polishing, craftsmanship details, stone placement (if present), charm placement (if present), metal behavior, and overall silhouette",
};

type StyleScene = {
  shootBrief: string;
  sceneModel: string;
  sceneStudio: string;
  composition: string;
  aperture: string;
};

const STYLE_SCENES: Record<ShootStyle, StyleScene> = {
  editorial: {
    shootBrief: "editorial fashion photoshoot",
    sceneModel: `The model is gracefully touching {{gesture}}, allowing the {{product}} to become naturally visible without forced presentation.
The frame may include {{frameIncludes}}.
The pose should feel effortless, sophisticated, and inspired by luxury fashion campaigns from Cartier, Tiffany & Co., and Bvlgari.
The model must not look directly at the camera.
No exaggerated posing.
Natural luxury movement only.`,
    sceneStudio: `Present the {{product}} in a refined luxury editorial styling composition without any human model.
The {{product}} must rest naturally on {{environment}} and obey natural gravity.
Use minimal editorial styling inspired by luxury jewelry boutiques and museum-quality product displays.
The {{product}} must remain the absolute focal point.`,
    composition: `Luxury fashion editorial composition.
The {{product}} remains perfectly sharp while the face, hair, and clothing transition into a soft natural blur.
Elegant asymmetrical framing.
Natural negative space suitable for premium Etsy listings.
Magazine-quality luxury campaign aesthetic.
The jewelry remains the dominant visual element.`,
    aperture: "f/4 realistic macro depth of field",
  },
  lifestyle: {
    shootBrief: "luxury lifestyle photoshoot",
    sceneModel: `The model is interacting naturally with luxury everyday objects or elements, such as holding a fine ceramic coffee cup near the face, gently adjusting a luxury silk scarf, holding a premium hardcover book, or adjusting designer sunglasses.
The interaction must feel spontaneous and effortless, allowing the {{product}} to be highlighted naturally without forced presentation.
The frame may include {{frameIncludes}}.
The {{product}} must remain the dominant visual element while the lifestyle scene enhances the premium atmosphere.
The image should feel like a candid luxury lifestyle photograph captured in an elegant boutique hotel, designer residence, or premium café.`,
    sceneStudio: `Present the {{product}} in a refined lifestyle still-life without any human model.
Surround it with secondary lifestyle props (ceramic cup, hardcover book, silk scarf, clutch) while keeping the {{product}} dominant.
The {{product}} must physically touch {{environment}} and obey natural gravity.`,
    composition: `Luxury lifestyle editorial composition.
The {{product}} remains perfectly sharp and centered within the composition.
Supporting objects must remain secondary to the jewelry.
Elegant negative space.
Natural movement.
High-end luxury campaign framing suitable for premium Etsy listings.`,
    aperture: "f/4 realistic macro depth of field",
  },
  minimal: {
    shootBrief: "luxury studio jewelry photoshoot",
    sceneModel: `Present the {{product}} in a refined luxury styling composition without any human model.
The {{product}} must rest naturally on {{environment}} or lean gently against a matte ceramic display element or sculptural travertine block.
The {{product}} must physically touch the supporting surface and obey natural gravity.
Use minimal editorial styling inspired by luxury jewelry boutiques and museum-quality product displays.
Create a visually rich yet clean luxury atmosphere.
The {{product}} must remain the absolute focal point.`,
    sceneStudio: `Present the {{product}} in a refined luxury styling composition without any human model.
The {{product}} must rest naturally on {{environment}} or lean gently against a matte ceramic display element or sculptural travertine block.
The {{product}} must physically touch the supporting surface and obey natural gravity.
Use minimal editorial styling inspired by luxury jewelry boutiques and museum-quality product displays.
Create a visually rich yet clean luxury atmosphere.
The {{product}} must remain the absolute focal point.

VERY IMPORTANT:
The {{product}} MUST NEVER appear floating, suspended, standing upright unsupported, levitating, or artificially balanced.

The {{product}} MUST always:
physically touch a surface,
lean naturally against a display object,
rest on premium marble,
or be supported by a realistic luxury display structure.

Allowed supports:
Premium White Italian Marble,
travertine pedestal,
matte white ceramic display,
natural limestone block,
soft white linen,
editorial styling props.

The support must:
feel physically believable,
create realistic contact points,
create natural pressure and weight,
cast realistic contact shadows,
follow gravity correctly.

DO NOT:
make the {{product}} float,
create invisible supports,
create impossible balancing,
stand the {{product}} vertically unsupported,
distort the {{product}}.`,
    composition: `Museum-quality editorial composition.
Balanced negative space.
Architectural luxury styling.
Minimal premium presentation.
Clean luxury framing suitable for Etsy hero images.
The {{product}} occupies approximately 20–30% of the frame, allowing elegant breathing room while remaining the dominant visual element.`,
    aperture: "f/5.6 for maximum detail retention",
  },
  bridal: {
    shootBrief: "bridal jewelry photoshoot",
    sceneModel: `The model gently holds a single white rose, soft ivory silk ribbon, or a delicate bridal bouquet with effortless elegance.
The interaction must feel authentic and refined, never staged or exaggerated.
The frame may include {{frameIncludes}}.
The atmosphere should evoke timeless romance inspired by luxury bridal campaigns from Tiffany & Co., Cartier, and De Beers.
The model should never directly present the {{product}} to the camera.
Every gesture must feel graceful, natural, and emotionally elegant.`,
    sceneStudio: `Present the {{product}} in a refined bridal still-life without any human model.
Use a single white rose, soft ivory silk ribbon, or delicate bridal styling props around {{environment}}.
No ceremony venue. No staged wedding hall.
The {{product}} must remain the absolute focal point and obey natural gravity.`,
    composition: `Luxury bridal editorial composition.
The {{product}} remains perfectly sharp while supporting bridal elements stay softly secondary.
Elegant asymmetrical framing.
Soft romantic negative space suitable for premium Etsy bridal listings.`,
    aperture: "f/4 realistic macro depth of field",
  },
  everyday: {
    shootBrief: "everyday luxury jewelry photoshoot",
    sceneModel: `Capture an authentic everyday luxury moment rather than a posed jewelry presentation.
The model may be gently adjusting a blazer sleeve, holding the collar of a premium linen shirt, resting a hand naturally on a knee, lightly touching a marble countertop, opening a luxury handbag, or holding a minimalist leather notebook.
Every movement must feel spontaneous, effortless, and naturally elegant.
The frame may include {{frameIncludes}}.
The {{product}} must remain the dominant visual element while blending naturally into a refined everyday luxury lifestyle.
The atmosphere should resemble a quiet morning in a luxury residence, boutique hotel, or designer apartment.`,
    sceneStudio: `Present the {{product}} in an everyday luxury still-life without any human model.
Place it naturally on {{environment}} with quiet-luxury residential cues (countertop edge, notebook, soft fabric).
The {{product}} must obey gravity and remain the absolute focal point.`,
    composition: `Everyday luxury editorial composition.
The {{product}} remains perfectly sharp while lifestyle context stays soft and secondary.
Natural asymmetrical framing.
Clean negative space suitable for premium Etsy listings.`,
    aperture: "f/4 realistic macro depth of field",
  },
};

const GENDER_ADJ: Record<Exclude<ModelGender, "none">, string> = {
  female: "female",
  male: "male",
};

const GENDER_GESTURE: Record<Exclude<ModelGender, "none">, Record<ProductType, string>> = {
  female: {
    ring: "her jawline or lightly tucking her hair behind her ear",
    earring: "her hair near the ear or lightly adjusting a scarf",
    necklace: "her jawline, gently tucking her hair behind her ear, lightly adjusting her shirt collar, or softly resting her fingertips near her neck",
    bracelet: "her jawline, gently tucking her hair behind her ear, lightly adjusting the sleeve of a silk blouse, or softly resting one hand near her face",
  },
  male: {
    ring: "his jawline, casually adjusting a shirt cuff, or hooking a thumb into a trouser pocket with the fingers naturally visible",
    earring: "near the ear with a natural confident gesture — no exaggerated posing",
    necklace: "his collar, lightly adjusting the shirt placket, or resting fingertips near the collarbone",
    bracelet: "his cuff, casually rolling a sleeve, or resting the forearm across the body",
  },
};

const FIXED_STYLE_BLOCK = `Style:
100% photorealistic
absolutely natural luxury photography look
NO AI-generated appearance
NO CGI feeling
NO fantasy styling
NO artificial luxury effects
NO exaggerated reflections
NO unrealistic skin smoothing

The {{product}} must remain the absolute focal point.
Maintain authentic metal reflections.
Keep realistic micro scratches.
Preserve natural polishing behavior.
Show true premium jewelry material response.

Macro Photography Details:
Luxury macro commercial jewelry photography
ultra detailed metal texture
visible craftsmanship details
realistic edge reflections
controlled highlight rolloff
premium editorial aesthetic

Lighting:
Professional luxury jewelry lighting
soft diffused daylight key light
subtle neutral rim lighting
controlled reflections
soft cinematic shadows
balanced exposure
natural {{skinTone}} skin tones

Camera:
Shot on Sony A1
100mm true macro lens
{{aperture}}
extreme detail preservation
sharp focus locked on {{product}}
soft natural background separation
high-end commercial framing

Quality:
8K ultra detailed
extremely sharp macro focus
high dynamic range
commercial grade realism
premium luxury jewelry campaign
natural cinematic realism`;

const FIXED_NEGATIVE_CORE =
  "cartoon, CGI, AI look, fake reflections, plastic skin, blurry jewelry, overexposed highlights, fantasy styling, low quality rendering";

function fill(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? "");
}

function resolveEffectiveGender(
  modelGender: ModelGender,
  shootStyle: ShootStyle,
): ModelGender {
  if (shootStyle === "minimal") return "none";
  if (modelGender === "none") return "none";
  if (shootStyle === "bridal" && modelGender === "male") return "female";
  return modelGender;
}

function clothingBlock(
  modelGender: Exclude<ModelGender, "none">,
  clothingStyle: ClothingStyle,
  clothingColor: ClothingColor,
): string {
  const style = findOption(CLOTHING_STYLES, clothingStyle);
  const color = findOption(CLOTHING_COLORS, clothingColor);
  const base =
    modelGender === "male"
      ? style?.male ?? "Premium monochrome luxury clothing, no logos, softly out of focus"
      : style?.female ?? "Luxury neutral clothing, no logos, softly out of focus";

  const modest =
    modelGender === "female"
      ? `\nNo deep plunging neckline.\nNo excessive cleavage.\nNo transparent fabrics.\nNo lingerie-inspired styling.\nNo provocative poses.`
      : `\nNo logos.\nNo bold patterns.\nNo bright colors.\nSleeves should naturally frame the jewelry without covering it.`;

  return `Clothing:
${base}
Preferred clothing color: ${color?.en ?? clothingColor}.
No logos.
No bold patterns.
Neutral luxury styling.
Softly out of focus.${modest}`;
}

function skinBlock(modelGender: Exclude<ModelGender, "none">, product: ProductType): string {
  if (modelGender === "female") {
    const extra =
      product === "earring"
        ? "realistic earlobe texture"
        : product === "necklace"
          ? "realistic neck texture\nsubtle collarbone definition"
          : "realistic finger folds";
    return `Skin Details:
Natural feminine skin texture
visible pores
${extra}
healthy warm skin tone
NO plastic skin
NO excessive retouching
NO beauty filter
NO over smoothing

Nails:
Short or medium elegant natural manicure
neutral nude tones
clean luxury appearance
nails must remain secondary to jewelry`;
  }

  return `Skin Details:
Natural masculine skin texture
visible pores and subtle knuckle creases
subtle finger and arm hair
healthy skin tone
NO plastic skin
NO excessive retouching
NO beauty filter

Hands:
Elegant masculine hands
Natural finger proportions and natural knuckles
Well-groomed short nails
No additional rings and no other jewelry that could compete with or duplicate the product
Hands should appear naturally relaxed`;
}

function studioFitRules(product: string): string {
  return `VERY IMPORTANT:
The ${product} MUST NEVER appear floating, suspended, standing upright unsupported, levitating, or artificially balanced.

The ${product} MUST always:
physically touch a surface,
lean naturally against a display object,
rest on a premium support,
or be supported by a realistic luxury display structure.

The support must:
feel physically believable,
create realistic contact points,
create natural pressure and weight,
cast realistic contact shadows,
follow gravity correctly.

DO NOT:
make the ${product} float,
create invisible supports,
create impossible balancing,
distort the ${product}.

Scale Accuracy:
Maintain true-to-life ${product} proportions.
${product} dimensions must remain identical to the reference image.
Do not enlarge the ${product} for visibility.
Commercial scale accuracy is mandatory.`;
}

export type ComposeResult = {
  prompt: string;
  effectiveGender: ModelGender;
  productLabel: string;
  styleLabel: string;
};

export function composePrompt(input: GenerateFormInput): ComposeResult {
  const productOpt = findOption(PRODUCT_TYPES, input.productType);
  const styleOpt = findOption(SHOOT_STYLES, input.shootStyle);
  const toneOpt = findOption(BACKGROUND_TONES, input.backgroundTone);
  const envOpt = findOption(ENVIRONMENTS, input.environment);

  if (!productOpt || !styleOpt || !toneOpt || !envOpt) {
    throw new Error("Geçersiz form seçenekleri");
  }

  const effectiveGender = resolveEffectiveGender(input.modelGender, input.shootStyle);
  const product = productOpt.en;
  const anatomy = ANATOMY[input.productType];
  const style = STYLE_SCENES[input.shootStyle];
  const genderAdj =
    effectiveGender === "none" ? "human" : GENDER_ADJ[effectiveGender];

  const vars: Record<string, string> = {
    product,
    genderAdj,
    frameIncludes: anatomy.frameIncludes,
    environment: envOpt.en,
    aperture: style.aperture,
    skinTone: effectiveGender === "male" ? "masculine" : "feminine",
    gesture:
      effectiveGender === "none"
        ? ""
        : GENDER_GESTURE[effectiveGender][input.productType],
  };

  const referenceLock = `Use the uploaded ${product} image as the exact product reference.
DO NOT redesign, reshape, reinterpret, resize, thicken, slim down, or modify the ${product} in any way.
Preserve the ${PRODUCT_PRESERVE[input.productType]} exactly as shown in the reference image.`;

  const audience =
    effectiveGender === "male"
      ? "men's"
      : effectiveGender === "female"
        ? "women's"
        : "luxury";

  const shootBrief = `Create an ultra realistic premium ${audience} jewelry ${style.shootBrief} for Etsy product listing.`;

  let scene: string;
  if (effectiveGender === "none" || input.shootStyle === "minimal") {
    scene = `Scene:
${fill(style.sceneStudio, vars)}

${studioFitRules(product)}`;
  } else {
    scene = `Scene:
An elegant ${genderAdj} model naturally wearing the ${product}.
${fill(style.sceneModel, vars)}

VERY IMPORTANT:
${fill(anatomy.fitRules, vars)}`;
  }

  const palette = `Color Palette:
${toneOpt.palette}`;

  const background = `Background:
${toneOpt.background}
Shoot environment support: ${envOpt.en}.`;

  const clothing =
    effectiveGender === "none"
      ? ""
      : clothingBlock(effectiveGender, input.clothingStyle, input.clothingColor);

  const skin =
    effectiveGender === "none" ? "" : skinBlock(effectiveGender, input.productType);

  const composition = `Composition:
${fill(style.composition, vars)}`;

  const qualityStyle = fill(FIXED_STYLE_BLOCK, vars);

  const important = `Important:
The ${product} design MUST stay IDENTICAL to the uploaded reference image.
${anatomy.doNot}

${fill(anatomy.importantClose, vars)}`;

  const modestNeg =
    effectiveGender === "female"
      ? ", revealing clothing, deep cleavage, provocative pose, lingerie, transparent fabric, sexualized styling"
      : "";

  const negative = `Negative prompt:
${FIXED_NEGATIVE_CORE}, ${anatomy.negativeExtra}${modestNeg}.`;

  const prompt = [
    referenceLock,
    "",
    shootBrief,
    "",
    scene,
    "",
    palette,
    "",
    qualityStyle,
    skin ? `\n${skin}` : "",
    "",
    composition,
    "",
    background,
    clothing ? `\n${clothing}` : "",
    "",
    important,
    "",
    negative,
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    prompt,
    effectiveGender,
    productLabel: productOpt.label,
    styleLabel: styleOpt.label,
  };
}

export function validateGenerateInput(body: Partial<GenerateFormInput>): string | null {
  const required: (keyof GenerateFormInput)[] = [
    "productType",
    "modelGender",
    "shootStyle",
    "backgroundTone",
    "clothingStyle",
    "clothingColor",
    "environment",
    "aspectRatio",
    "imageSize",
  ];
  for (const key of required) {
    if (!body[key]) return `Eksik alan: ${key}`;
  }
  if (!findOption(PRODUCT_TYPES, body.productType!)) return "Geçersiz ürün tipi";
  if (!findOption(MODEL_OPTIONS, body.modelGender!)) return "Geçersiz model";
  if (!findOption(SHOOT_STYLES, body.shootStyle!)) return "Geçersiz çekim stili";
  if (!findOption(BACKGROUND_TONES, body.backgroundTone!)) return "Geçersiz arka plan tonu";
  if (!findOption(CLOTHING_STYLES, body.clothingStyle!)) return "Geçersiz kıyafet stili";
  if (!findOption(CLOTHING_COLORS, body.clothingColor!)) return "Geçersiz kıyafet rengi";
  if (!findOption(ENVIRONMENTS, body.environment!)) return "Geçersiz ortam";
  return null;
}
