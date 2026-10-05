import assert from "node:assert/strict";
import { composePrompt } from "../src/lib/prompt-engine";

const femaleEditorial = composePrompt({
  productType: "ring",
  modelGender: "female",
  shootStyle: "editorial",
  backgroundTone: "white-marble",
  clothingStyle: "silk-blouse",
  clothingColor: "white",
  environment: "white-marble",
  aspectRatio: "4:5",
  imageSize: "2K",
});

assert.match(femaleEditorial.prompt, /exact product reference/i);
assert.match(femaleEditorial.prompt, /female model/i);
assert.match(femaleEditorial.prompt, /Negative prompt:/i);
assert.match(femaleEditorial.prompt, /DO NOT redesign/i);
assert.equal(femaleEditorial.effectiveGender, "female");

const minimal = composePrompt({
  productType: "earring",
  modelGender: "female",
  shootStyle: "minimal",
  backgroundTone: "cream-champagne",
  clothingStyle: "linen-shirt",
  clothingColor: "ivory",
  environment: "travertine",
  aspectRatio: "1:1",
  imageSize: "2K",
});

assert.equal(minimal.effectiveGender, "none");
assert.match(minimal.prompt, /without any human model/i);
assert.doesNotMatch(minimal.prompt, /female model naturally wearing/);

const male = composePrompt({
  productType: "bracelet",
  modelGender: "male",
  shootStyle: "lifestyle",
  backgroundTone: "black-graphite",
  clothingStyle: "black-tee",
  clothingColor: "black",
  environment: "black-marble",
  aspectRatio: "4:5",
  imageSize: "2K",
});

assert.match(male.prompt, /male model/i);
assert.match(male.prompt, /Matte Black|Graphite/i);

console.log("prompt-engine smoke OK");
