/**
 * Real product records captured from the live storefront during the audit, before
 * the store was password-protected. Used by 00-preview-offline.mjs so the rewrite
 * rules can be reviewed without Admin API access.
 *
 * Titles, option names, option values, and prices are verbatim. Descriptions are
 * shortened to the structural parts that matter (the supplier spec block, the
 * centimetre size table, and the hotlinked Alibaba CDN images).
 */

const SUPPLIER_IMG =
  "https://shopifyfile.oss-accelerate.aliyuncs.com/attached/pingtai/202608/F1BDF495BC55B2F1854C1B6BBFD374AC.jpg";

function supplierDescription({ specs = [], sizeTable = null, images = 3 }) {
  const specHtml = specs.map((s) => `<p><strong>${s}</strong></p>`).join("");
  const imgHtml = Array.from({ length: images }, () => `<img src="${SUPPLIER_IMG}">`).join(" \n ");
  return `${specHtml}${sizeTable ?? ""}<p>${imgHtml}</p>`;
}

const KIDS_SIZE_TABLE = `<table>
<thead><tr class="firstRow"><th>Costume size</th><th>Chest/Bust</th><th>Clothing length</th><th>Height</th></tr></thead>
<tbody>
<tr><td>XS/2-4yrs</td><td>82</td><td>85</td><td>95-110</td></tr>
<tr><td>S/4-6yrs</td><td>90</td><td>97</td><td>110-125</td></tr>
<tr><td>M/8-10yrs</td><td>98</td><td>113</td><td>125-140</td></tr>
<tr><td>L/10-12yrs</td><td>106</td><td>128</td><td>140-150</td></tr>
</tbody>
</table>`;

const WOMENS_SIZE_TABLE = `<table>
<thead><tr class="firstRow"><th>Size</th><th>Bust</th><th>Length</th><th>Waist</th></tr></thead>
<tbody>
<tr><td>S</td><td>104</td><td>60</td><td>66-76</td></tr>
<tr><td>M</td><td>108</td><td>61</td><td>68-78</td></tr>
<tr><td>L</td><td>112</td><td>62</td><td>70-80</td></tr>
</tbody>
</table>`;

let idCounter = 9785953517813;
const nextId = () => `gid://shopify/Product/${idCounter++}`;

function product({
  title,
  price,
  options,
  images = 3,
  specs = [],
  sizeTable = KIDS_SIZE_TABLE,
}) {
  const optionRecords = Object.entries(options).map(([name, values], index) => ({
    id: `gid://shopify/ProductOption/${idCounter}${index}`,
    name,
    position: index + 1,
    optionValues: values.map((v) => ({ id: `${idCounter}${index}${v}`, name: v })),
  }));

  const combos = optionRecords.reduce(
    (acc, option) =>
      acc.flatMap((combo) => option.optionValues.map((v) => [...combo, { name: option.name, value: v.name }])),
    [[]],
  );

  return {
    id: nextId(),
    handle: title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 70),
    title,
    vendor: "eprolo",
    productType: "",
    status: "ACTIVE",
    tags: [],
    descriptionHtml: supplierDescription({ specs, sizeTable, images }),
    options: optionRecords,
    media: [],
    images: Array.from({ length: images }, (_, i) => ({
      id: `gid://shopify/MediaImage/${idCounter}${i}`,
      alt: "",
      mediaContentType: "IMAGE",
      image: { url: `https://cdn.shopify.com/s/files/fake-${i}.jpg`, width: 800, height: 1200 },
    })),
    variants: combos.map((selectedOptions, i) => ({
      id: `gid://shopify/ProductVariant/${idCounter}${i}`,
      title: selectedOptions.map((o) => o.value).join(" / "),
      sku: `EP-${idCounter}-${i}`,
      price: String(price),
      compareAtPrice: null,
      inventoryQuantity: 999,
      selectedOptions,
    })),
  };
}

export const FIXTURE_PRODUCTS = [
  // --- On-niche kids storybook and stage costumes -------------------------
  product({
    title:
      "Cosplay Halloween Tin Man Costume for Kids, The Wizard of Oz Iron Man Outfit, Children's Costume for Boys",
    price: "42.64",
    options: { Color: ["Silver"], "Suitable for height": ["XS", "S", "M", "L"] },
    specs: [
      "Fabric name: Polyester",
      "Main Fabric Composition: Polyester Fiber",
      "Color: Silver",
      "Sleeve length: long sleeved",
      "Product Category: Children's Performance Clothing/Dance Clothing",
      "Unit: cm",
    ],
  }),
  product({
    title: "Children's Little Match Girl Costume Stage Play Performance Rustic Farm Maid Poor Commoner Clothing",
    price: "38.20",
    options: { Color: ["Brown", "Khaki"], "Suitable for height": ["XS", "S", "M", "L"] },
    specs: ["Main fabric composition: cotton", "Unit: cm", "Applicable gender: Female"],
  }),
  product({
    title: "Halloween Costume Girls Fairy Tale Alice in Wonderland Role Play Queen of Hearts Performance Dress",
    price: "47.70",
    options: { Color: ["Red and Black", "Red Checkered"], Size: ["S", "M", "L", "XL"] },
    specs: ["Fabric name: Polyester", "Unit: cm", "Package includes: dress, headband"],
  }),
  product({
    title: "Lolita Style British Cosplay Costume Children's Detective Sherlock Holmes Outfit with Cape and Glasses",
    price: "53.42",
    options: { Color: ["Brown", "Set includes wig and glasses"], Size: ["S", "M", "L"] },
    specs: ["Material: tweed blend", "Set includes: coat, cape, hat, glasses", "Unit: cm"],
  }),
  product({
    title: "Boy's Greek Zeus Costume Halloween Party Role Play Costume",
    price: "37.82",
    options: { Color: ["White (without beard wig)"], "Suitable for height": ["XS", "S", "M", "L"] },
    images: 0,
    specs: [
      "Fabric name: Polyester",
      "Color: White (excluding beard and wig)",
      "Sleeve length: short sleeved",
      "Unit: cm",
    ],
  }),
  product({
    title: "Halloween Kids' Costume Animal Werewolf Outfit for Boys and Girls, Cosplay Big Bad Wolf and Little Red Riding Hood",
    price: "44.46",
    options: { Color: ["Gray", "Red"], Size: ["S", "M", "L", "XL"] },
    specs: ["Main fabric composition: polyester", "Unit: cm"],
  }),
  product({
    title: "Pantomime Clown Costume for Kids - Halloween Comedy Performance Outfit for Children's Stage Play",
    price: "35.64",
    options: { Color: ["Complete Set"], "Suitable for height": ["XS", "S", "M"] },
    images: 2,
    specs: ["Complete Set includes: jumpsuit, ruff, hat", "Unit: cm"],
  }),
  product({
    title: "Boy's Foreign Fashion Halloween Costume Choir Outfit Pastor Black Role Play Cosplay Clothing",
    price: "36.54",
    options: { Color: ["Black"], "Suitable for height": ["XS", "S", "M", "L"] },
    specs: ["Fabric name: Polyester", "Unit: cm"],
  }),
  product({
    title: "Halloween Costume Brown Children's Overalls Scarecrow Festival Party Stage Performance Costume for Boys",
    price: "39.66",
    options: { Color: ["Brown"], "Suitable for height": ["S", "M", "L"] },
    specs: ["Main fabric composition: cotton blend", "Unit: cm"],
  }),
  product({
    title: "Christmas Unisex Cosplay Animal Costume Deer Reindeer Children's Performance Costume",
    price: "41.20",
    options: { Color: ["Brown"], Size: ["S", "M", "L", "XL"] },
    specs: ["Material: plush", "Unit: cm"],
  }),
  product({
    title: "Halloween Children's Black Nun Costume Cosplay Dress for Girls, Fairy Tale Play Performance Outfit",
    price: "40.32",
    options: { Color: ["Black"], Size: ["S", "M", "L"] },
    specs: ["Fabric name: Polyester", "Unit: cm"],
  }),
  product({
    title: "Halloween Costume Children's Poker Queen with Crown Necklace Girl Stage Performance Dress Fairy Princess Dress",
    price: "51.88",
    options: { Color: ["Red", "Black girl"], Size: ["S", "M", "L", "XL"] },
    specs: ["Package includes: dress, crown, necklace", "Unit: cm"],
  }),
  product({
    title: "Halloween Kids Alien Robot Costume Cheerleader Dance Ballet Skirt AI Gradient Tulle Skirt",
    price: "46.40",
    options: { Color: ["AI Robot Tulle Skirt", "Silver"], Size: ["S", "M", "L"] },
    specs: ["Material: tulle", "Unit: cm"],
  }),
  product({
    title: "Halloween Costume Children's Beer Festival Performance Dress Multi-color Short Skirt",
    price: "43.70",
    options: { Color: ["Red", "Blue"], "Suitable for height": ["S", "M", "L"] },
    specs: ["Main fabric composition: polyester", "Unit: cm"],
  }),

  // --- Family / parent-child matching ------------------------------------
  product({
    title:
      "Caribbean Pirates Costume Set for Men and Children, Parent-Child Matching Outfits for Halloween Party and Costume Ball",
    price: "76.34",
    options: { Color: ["Brown"], Size: ["Adult", "Children"] },
    specs: ["Material: polyester", "Unit: cm"],
  }),
  product({
    title: "Family Wolf Costume Dress for Adults and Kids, Gray Werewolf Cosplay Outfit for Halloween Stage Animal Performance",
    price: "68.80",
    options: { Color: ["Gray"], Size: ["Adult", "Kids"] },
    specs: ["Material: plush", "Unit: cm"],
  }),

  // --- Liability: must be cut, not renamed -------------------------------
  product({
    title: "Halloween Savage Costume Children's Day Native Performance Costume Indigenous Indian Chief",
    price: "45.10",
    options: { Color: ["Brown"], "Suitable for height": ["S", "M", "L"] },
    specs: ["Material: polyester", "Unit: cm"],
  }),
  product({
    title: "Children's Halloween Stage Performance Costume Native  Indian Chief Costume for Boys",
    price: "44.20",
    options: { Color: ["Brown"], "Suitable for height": ["S", "M", "L"] },
    specs: ["Unit: cm"],
  }),
  product({
    title: "Halloween Children's Costume Blood-Stained Student Uniform Set Cosplay Outfit for Girls",
    price: "39.72",
    options: { Color: ["Bloodstain"], Size: ["S", "M", "L"] },
    specs: ["Unit: cm"],
  }),

  // --- Adult nightlife: off-brand for a children's store -----------------
  product({
    title: "Bunny Girl Pink Puffy Tail Dress for Nightclub, Bar, Party and Stage Performance",
    price: "39.72",
    options: { Color: ["Pink"], Size: ["S", "M", "L"] },
    sizeTable: WOMENS_SIZE_TABLE,
    specs: ["Main fabric composition: polyester", "Unit: cm"],
  }),

  // --- Adult womenswear: off-niche, cut ----------------------------------
  product({
    title: "Solid color V-neck lace up loose pants set for women",
    price: "53.42",
    options: { Color: ["Coffee", "Black", "Light Khaki"], Size: ["S", "M", "L", "XL", "XXL"] },
    sizeTable: WOMENS_SIZE_TABLE,
    specs: [
      "Color: Coffee, Black, Light Khaki",
      "Pattern: Solid color",
      "Style: Commuting style",
      "Main fabric composition: polyester",
      "Applicable gender: Female",
      "Unit: cm",
    ],
  }),
  product({
    title: "Elegant Women's V-Neck Ruffle Blouse with Tie Waist, Lantern Sleeves Long Sleeve Top",
    price: "61.88",
    options: {
      Color: ["Red", "White", "Black", "Navy blue", "Bean paste color", "Light blue"],
      Size: ["S", "M", "L", "XL", "XXL", "XXXL"],
    },
    sizeTable: WOMENS_SIZE_TABLE,
    specs: ["Main fabric composition: polyester", "Unit: cm"],
  }),
  product({
    title: "Straw beach bag",
    price: "21.22",
    options: { Color: ["Beige"] },
    sizeTable: null,
    images: 1,
    specs: ["Material: straw"],
  }),
  product({
    title: "Long sleeved lapel dress",
    price: "48.64",
    options: { Color: ["Black", "Apricot"], Size: ["S", "M", "L", "XL"] },
    sizeTable: WOMENS_SIZE_TABLE,
    images: 0,
    specs: ["Unit: cm"],
  }),
];

export default FIXTURE_PRODUCTS;
