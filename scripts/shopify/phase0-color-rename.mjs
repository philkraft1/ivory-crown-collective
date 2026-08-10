/**
 * Renames non-colour Color option values to shopper-safe labels.
 * Does not restructure the variant matrix (true "move to Pattern/Set" stays manual).
 */
import { fetchAllProducts, mutate } from "./lib/client.mjs";
import { PRODUCT_OPTION_UPDATE } from "./lib/mutations.mjs";
import { log, FLAGS } from "./lib/cli.mjs";

const RENAMES = new Map([
  ["complete set", "Standard"],
  ["including socks", "With socks"],
  ["set includes wig and glasses", "With wig & glasses"],
  ["black wig with glasses", "With wig & glasses"],
  ["clothing + hat (props not included)", "With hat"],
  ["includes glasses + magnifier", "With accessories"],
  ["green with packaging", "Green"],
  ["white (without beard wig)", "White"],
  ["white background with red roses", "Red floral"],
  ["ai robot tulle skirt", "Multicolor"],
  ["britney", "Standard"],
  ["red checkered", "Red"],
  ["blue checkered", "Blue"],
  ["black and white stripes", "Black/White"],
  ["pink blue stripes", "Pink/Blue"],
  ["purple blue stripe", "Purple/Blue"],
  ["floral print", "Floral"],
  ["bloodstain", "Red"],
  ["children", "Kids"],
  ["kids", "Kids"],
  ["adult", "Adult"],
  ["children's king", "Gold"],
  ["peacock blue", "Peacock Blue"],
  ["barbie pink", "Pink"],
  ["bean paste color", "Mauve"],
  ["matcha green", "Green"],
  ["chestnut", "Brown"],
  ["brick red", "Brick Red"],
  ["champagne color", "Champagne"],
  ["shiny pink", "Pink"],
  ["caramel color", "Caramel"],
  ["lime green", "Lime"],
]);

log.banner("Color option renames", "Make Color values look like colours without changing the matrix");

const products = await fetchAllProducts();
let updated = 0;

for (const product of products) {
  if (product.status !== "ACTIVE") continue;
  const color = product.options?.find((o) => o.name.toLowerCase() === "color");
  if (!color) continue;

  const optionValuesToUpdate = [];
  for (const value of color.optionValues || []) {
    const next = RENAMES.get(value.name.trim().toLowerCase());
    if (!next || next === value.name) continue;
    optionValuesToUpdate.push({ id: value.id, name: next });
    log.warn(`${product.title}`);
    log.detail(`"${value.name}" -> "${next}"`);
  }

  if (!optionValuesToUpdate.length) continue;
  if (FLAGS.dryRun) continue;

  // Deduplicate target names: keep first update, skip collisions by appending index.
  const used = new Set(
    (color.optionValues || [])
      .filter((v) => !optionValuesToUpdate.some((u) => u.id === v.id))
      .map((v) => v.name.toLowerCase()),
  );
  for (const u of optionValuesToUpdate) {
    let name = u.name;
    let i = 2;
    while (used.has(name.toLowerCase())) {
      name = `${u.name} ${i++}`;
    }
    used.add(name.toLowerCase());
    u.name = name;
  }

  await mutate(
    PRODUCT_OPTION_UPDATE,
    {
      productId: product.id,
      option: { id: color.id },
      optionValuesToUpdate,
      variantStrategy: "MANAGE",
    },
    "productOptionUpdate",
  );
  updated += 1;
  log.ok(product.handle);
}

log.summary([
  ["products updated", updated],
  ["mode", FLAGS.dryRun ? "dry-run" : "apply"],
]);
