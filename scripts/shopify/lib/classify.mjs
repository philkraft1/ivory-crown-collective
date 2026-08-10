/**
 * Classification and rewrite rules for the eProlo-imported catalog.
 *
 * The supplier feed gives us keyword-stuffed machine-translated titles averaging
 * 88 characters, zero tags, zero product type, and centimetre-only size charts.
 * Everything here maps that raw feed onto the store's actual niche: children's
 * storybook and stage costumes for school plays, book character day, pageants,
 * and recitals.
 *
 * Rules are applied at runtime against whatever the Admin API returns, so this
 * stays correct as the catalog changes.
 */

// ---------------------------------------------------------------------------
// Occasions
// ---------------------------------------------------------------------------

export const OCCASIONS = {
  SCHOOL_PLAY: "school-play",
  BOOK_CHARACTER_DAY: "book-character-day",
  CHRISTMAS_PAGEANT: "christmas-pageant",
  RECITAL: "recital",
  HALLOWEEN: "halloween",
  WORLD_CULTURES: "world-cultures-day",
  ST_PATRICKS: "st-patricks-day",
};

export const THEMES = {
  STORYBOOK: "storybook",
  HISTORICAL: "historical",
  MYTHOLOGY: "mythology",
  ANIMALS: "animals",
  NATIVITY: "nativity",
  SPOOKY: "spooky",
  DECADES: "decades",
  SCIFI: "sci-fi",
};

// ---------------------------------------------------------------------------
// Character catalog
//
// Ordered most-specific first: `detectCharacter` returns the first match, so
// "Queen of Hearts" must be tested before a generic "queen".
// ---------------------------------------------------------------------------

export const CHARACTERS = [
  {
    id: "tin-man",
    name: "Tin Man",
    work: "The Wizard of Oz",
    match: /tin\s?man|iron man outfit/i,
    theme: THEMES.STORYBOOK,
    occasions: [OCCASIONS.SCHOOL_PLAY, OCCASIONS.BOOK_CHARACTER_DAY, OCCASIONS.HALLOWEEN],
  },
  {
    id: "scarecrow",
    name: "Scarecrow",
    work: "The Wizard of Oz",
    match: /scarecrow/i,
    theme: THEMES.STORYBOOK,
    occasions: [OCCASIONS.SCHOOL_PLAY, OCCASIONS.BOOK_CHARACTER_DAY, OCCASIONS.HALLOWEEN],
  },
  {
    id: "queen-of-hearts",
    name: "Queen of Hearts",
    work: "Alice in Wonderland",
    match: /queen of hearts|poker queen/i,
    theme: THEMES.STORYBOOK,
    occasions: [OCCASIONS.SCHOOL_PLAY, OCCASIONS.BOOK_CHARACTER_DAY, OCCASIONS.HALLOWEEN],
  },
  {
    id: "cheshire-cat",
    name: "Cheshire Cat",
    work: "Alice in Wonderland",
    match: /smiling cat|cheshire/i,
    theme: THEMES.STORYBOOK,
    occasions: [OCCASIONS.SCHOOL_PLAY, OCCASIONS.BOOK_CHARACTER_DAY, OCCASIONS.HALLOWEEN],
  },
  {
    id: "alice",
    name: "Alice",
    work: "Alice in Wonderland",
    match: /alice|wonderland/i,
    theme: THEMES.STORYBOOK,
    occasions: [OCCASIONS.SCHOOL_PLAY, OCCASIONS.BOOK_CHARACTER_DAY],
  },
  {
    id: "little-match-girl",
    name: "Little Match Girl",
    work: "Hans Christian Andersen",
    match: /match girl/i,
    theme: THEMES.STORYBOOK,
    occasions: [OCCASIONS.SCHOOL_PLAY, OCCASIONS.BOOK_CHARACTER_DAY, OCCASIONS.CHRISTMAS_PAGEANT],
  },
  {
    id: "cinderella",
    name: "Cinderella",
    work: "Cinderella",
    match: /cinderella/i,
    theme: THEMES.STORYBOOK,
    occasions: [OCCASIONS.SCHOOL_PLAY, OCCASIONS.BOOK_CHARACTER_DAY, OCCASIONS.RECITAL],
  },
  {
    id: "sherlock-holmes",
    name: "Sherlock Holmes",
    work: "Sherlock Holmes",
    match: /sherlock|detective/i,
    theme: THEMES.STORYBOOK,
    occasions: [OCCASIONS.SCHOOL_PLAY, OCCASIONS.BOOK_CHARACTER_DAY],
  },
  {
    id: "robin-hood",
    name: "Robin Hood",
    work: "Robin Hood",
    match: /robin hood|peter pan|archer|hunter/i,
    theme: THEMES.STORYBOOK,
    occasions: [OCCASIONS.SCHOOL_PLAY, OCCASIONS.BOOK_CHARACTER_DAY],
  },
  {
    // Ordered above red-riding-hood on purpose: supplier titles bundle both names
    // ("Big Bad Wolf and Little Red Riding Hood") on what is actually a wolf costume.
    id: "big-bad-wolf",
    name: "Big Bad Wolf",
    work: "Brothers Grimm",
    match: /big bad wolf|werewolf|wolf/i,
    theme: THEMES.ANIMALS,
    occasions: [OCCASIONS.SCHOOL_PLAY, OCCASIONS.BOOK_CHARACTER_DAY, OCCASIONS.HALLOWEEN],
  },
  {
    id: "red-riding-hood",
    name: "Little Red Riding Hood",
    work: "Brothers Grimm",
    match: /red riding hood/i,
    theme: THEMES.STORYBOOK,
    occasions: [OCCASIONS.SCHOOL_PLAY, OCCASIONS.BOOK_CHARACTER_DAY],
  },
  {
    id: "street-urchin",
    name: "Victorian Street Urchin",
    work: "Oliver Twist",
    // The supplier calls these "beggar", "poor man", and "poor commoner". They are
    // the Oliver Twist / Les Miserables / A Christmas Carol street-child look that
    // schools stage constantly, so they are renamed rather than cut.
    match: /beggar|poor man|poor commoner|rustic farm maid|little match/i,
    theme: THEMES.STORYBOOK,
    occasions: [OCCASIONS.SCHOOL_PLAY, OCCASIONS.BOOK_CHARACTER_DAY, OCCASIONS.CHRISTMAS_PAGEANT],
  },
  {
    id: "farm-maid",
    name: "Storybook Farm Girl",
    work: "Little House on the Prairie",
    match: /cottage maid|farm maid|farm girl|farm theme|floral maid|maid dress|maid costume/i,
    theme: THEMES.STORYBOOK,
    occasions: [OCCASIONS.SCHOOL_PLAY, OCCASIONS.BOOK_CHARACTER_DAY],
  },
  {
    id: "pantomime-clown",
    name: "Pantomime Clown",
    work: "Pantomime",
    match: /pantomime|clown/i,
    theme: THEMES.STORYBOOK,
    occasions: [OCCASIONS.SCHOOL_PLAY, OCCASIONS.RECITAL, OCCASIONS.HALLOWEEN],
  },
  {
    id: "shepherd",
    name: "Nativity Shepherd",
    work: "Nativity",
    match: /shepherd|elder outfit|grandpa/i,
    theme: THEMES.NATIVITY,
    occasions: [OCCASIONS.CHRISTMAS_PAGEANT, OCCASIONS.SCHOOL_PLAY],
  },
  {
    id: "choir",
    name: "Choir Robe",
    work: "Church and choral",
    match: /choir|pastor|black robe/i,
    theme: THEMES.NATIVITY,
    occasions: [OCCASIONS.CHRISTMAS_PAGEANT, OCCASIONS.RECITAL],
  },
  {
    id: "nun",
    name: "Nun",
    work: "The Sound of Music",
    match: /\bnun\b/i,
    theme: THEMES.NATIVITY,
    occasions: [OCCASIONS.SCHOOL_PLAY, OCCASIONS.CHRISTMAS_PAGEANT],
  },
  {
    id: "zeus",
    name: "Zeus",
    work: "Greek mythology",
    match: /zeus/i,
    theme: THEMES.MYTHOLOGY,
    occasions: [OCCASIONS.SCHOOL_PLAY, OCCASIONS.WORLD_CULTURES],
  },
  {
    id: "athena",
    name: "Athena",
    work: "Greek mythology",
    match: /athena|greek goddess/i,
    theme: THEMES.MYTHOLOGY,
    occasions: [OCCASIONS.SCHOOL_PLAY, OCCASIONS.WORLD_CULTURES],
  },
  {
    id: "greek-toga",
    name: "Greek Toga",
    work: "Ancient Greece and Rome",
    match: /toga|ancient greek|greek mythology|roman/i,
    theme: THEMES.MYTHOLOGY,
    occasions: [OCCASIONS.SCHOOL_PLAY, OCCASIONS.WORLD_CULTURES],
  },
  {
    id: "pirate",
    name: "Pirate",
    work: "Treasure Island",
    match: /pirate|caribbean/i,
    theme: THEMES.STORYBOOK,
    occasions: [OCCASIONS.SCHOOL_PLAY, OCCASIONS.BOOK_CHARACTER_DAY, OCCASIONS.HALLOWEEN],
  },
  {
    id: "knight",
    name: "Medieval Knight",
    work: "Medieval",
    match: /knight|warrior|medieval/i,
    theme: THEMES.HISTORICAL,
    occasions: [OCCASIONS.SCHOOL_PLAY, OCCASIONS.WORLD_CULTURES],
  },
  {
    id: "princess",
    name: "Storybook Princess",
    work: "Fairy tale",
    match: /princess|court gown|ball gown|twilight princess/i,
    theme: THEMES.STORYBOOK,
    occasions: [OCCASIONS.SCHOOL_PLAY, OCCASIONS.RECITAL, OCCASIONS.BOOK_CHARACTER_DAY],
  },
  {
    id: "irish-fairy",
    name: "Irish Fairy",
    work: "Irish folklore",
    match: /irish|st\.? patrick|leprechaun/i,
    theme: THEMES.STORYBOOK,
    occasions: [OCCASIONS.ST_PATRICKS, OCCASIONS.SCHOOL_PLAY],
  },
  {
    id: "scottish",
    name: "Scottish Highlander",
    work: "World cultures",
    match: /scottish|highland|plaid skirt/i,
    theme: THEMES.HISTORICAL,
    occasions: [OCCASIONS.WORLD_CULTURES, OCCASIONS.SCHOOL_PLAY],
  },
  {
    id: "bavarian",
    name: "Bavarian Folk Dress",
    work: "World cultures",
    // Supplier titles this a "Beer Festival Performance Dress" for children. It is
    // an Oktoberfest dirndl; the alcohol framing is removed for a kids store.
    match: /beer festival|oktoberfest|dirndl|bavarian/i,
    theme: THEMES.HISTORICAL,
    occasions: [OCCASIONS.WORLD_CULTURES, OCCASIONS.SCHOOL_PLAY],
  },
  {
    id: "vampire",
    name: "Vampire",
    work: "Gothic fiction",
    match: /vampire|dracula/i,
    theme: THEMES.SPOOKY,
    occasions: [OCCASIONS.HALLOWEEN, OCCASIONS.SCHOOL_PLAY],
  },
  {
    id: "ghost-bride",
    name: "Victorian Ghost Bride",
    work: "Gothic fiction",
    match: /ghost princess|skeleton bride|ghost bride/i,
    theme: THEMES.SPOOKY,
    occasions: [OCCASIONS.HALLOWEEN],
  },
  {
    id: "bat",
    name: "Bat",
    work: "Animals",
    match: /\bbat\b/i,
    theme: THEMES.ANIMALS,
    occasions: [OCCASIONS.HALLOWEEN, OCCASIONS.SCHOOL_PLAY],
  },
  {
    id: "reindeer",
    name: "Reindeer",
    work: "Christmas",
    match: /reindeer|\bdeer\b/i,
    theme: THEMES.ANIMALS,
    occasions: [OCCASIONS.CHRISTMAS_PAGEANT, OCCASIONS.SCHOOL_PLAY],
  },
  {
    id: "christmas-tree",
    name: "Christmas Tree",
    work: "Christmas",
    match: /christmas tree/i,
    theme: THEMES.NATIVITY,
    occasions: [OCCASIONS.CHRISTMAS_PAGEANT],
  },
  {
    id: "lion",
    name: "Lion",
    work: "Animals",
    match: /lion/i,
    theme: THEMES.ANIMALS,
    occasions: [OCCASIONS.SCHOOL_PLAY, OCCASIONS.BOOK_CHARACTER_DAY, OCCASIONS.HALLOWEEN],
  },
  {
    id: "rabbit",
    name: "Rabbit",
    work: "Peter Rabbit",
    match: /rabbit|bunny/i,
    theme: THEMES.ANIMALS,
    occasions: [OCCASIONS.SCHOOL_PLAY, OCCASIONS.BOOK_CHARACTER_DAY],
  },
  {
    id: "cat",
    name: "Cat",
    work: "Animals",
    match: /\bcat\b|cat paw|kitten/i,
    theme: THEMES.ANIMALS,
    occasions: [OCCASIONS.SCHOOL_PLAY, OCCASIONS.HALLOWEEN],
  },
  {
    id: "mantis",
    name: "Praying Mantis",
    work: "Animals",
    match: /mantis|insect/i,
    theme: THEMES.ANIMALS,
    occasions: [OCCASIONS.SCHOOL_PLAY, OCCASIONS.HALLOWEEN],
  },
  {
    id: "robot",
    name: "Robot",
    work: "Sci-fi",
    match: /robot|alien|\bai\b/i,
    theme: THEMES.SCIFI,
    occasions: [OCCASIONS.SCHOOL_PLAY, OCCASIONS.RECITAL, OCCASIONS.HALLOWEEN],
  },
  {
    id: "disco-70s",
    name: "70s Disco",
    work: "Decades",
    match: /disco|70s|hippie|hip hop|retro/i,
    theme: THEMES.DECADES,
    occasions: [OCCASIONS.SCHOOL_PLAY, OCCASIONS.RECITAL],
  },
];

/**
 * First match wins, so CHARACTERS is ordered most-specific first. Supplier titles
 * routinely name two characters at once ("Big Bad Wolf and Little Red Riding
 * Hood"), and array order is more predictable to reason about than scoring.
 */
export function detectCharacter(text) {
  return CHARACTERS.find((c) => c.match.test(text)) ?? null;
}

/**
 * Category labels rather than actual titles. These don't earn a `story:` tag,
 * because "story:sci-fi" is not something a shopper would ever browse by.
 */
const GENERIC_WORKS = new Set([
  "Animals",
  "Decades",
  "World cultures",
  "Sci-fi",
  "Christmas",
  "Fairy tale",
  "Pantomime",
  "Medieval",
  "Church and choral",
  "Gothic fiction",
  "Irish folklore",
  "Greek mythology",
  "Ancient Greece and Rome",
  "Nativity",
]);

// ---------------------------------------------------------------------------
// Cut and safety rules
// ---------------------------------------------------------------------------

/**
 * Products removed from the catalog entirely. Two categories: off-niche adult
 * apparel that can't compete on 20 SKUs, and items that are an active liability
 * for a store selling to schools and churches.
 */
export const CUT_RULES = [
  {
    id: "culturally-appropriative",
    severity: "liability",
    match: /indian chief|indigenous|aboriginal|savage|native (american )?(performance )?costume|tribal/i,
    reason:
      "Native American headdress/chief costume. Widely considered cultural appropriation and explicitly banned by most US school districts, which are exactly this store's customers. Cut, do not rename.",
  },
  {
    id: "school-violence-imagery",
    severity: "liability",
    match: /blood.?stain(ed)? student|bloody school|blood.?stained.*uniform/i,
    reason:
      "Blood-stained student uniform for children. In a US school context this reads as school-shooting imagery and would be banned on sight. Cut.",
  },
  {
    id: "adult-nightlife",
    severity: "off-brand",
    match: /nightclub|night club|\bbar\b|pole danc|lingerie|bodysuit.*(nightclub|club)|puffy tail dress/i,
    reason:
      "Adult nightlife/club wear. Incompatible with a children's costume store sharing the same storefront.",
  },
  {
    id: "adult-womenswear",
    severity: "off-niche",
    // Everyday adult apparel with no costume, character, or kids signal at all.
    match: /^(?=.*\b(dress|blouse|cardigan|top|skirt|pants|jumpsuit|shirt|t-shirt|bodysuit|set|bag)\b)(?!.*\b(costume|cosplay|halloween|performance|stage|role.?play|child|kid|boy|girl|toddler|family|parent)\b).*$/i,
    reason:
      "Everyday adult womenswear. 20 SKUs cannot compete with Shein or Temu, and it dilutes the children's costume niche.",
  },
];

export function findCutRule(text) {
  return CUT_RULES.find((rule) => rule.match.test(text)) ?? null;
}

/**
 * Supplier phrasing that must never reach a customer, even on products we keep.
 * Applied to titles and descriptions.
 */
export const BANNED_PHRASES = [
  { pattern: /\bsavage\b/gi, replacement: "" },
  { pattern: /\bbeggar\b/gi, replacement: "street urchin" },
  { pattern: /\bpoor man\b/gi, replacement: "street urchin" },
  { pattern: /\bpoor commoner\b/gi, replacement: "street urchin" },
  { pattern: /\bbeer festival\b/gi, replacement: "Bavarian folk" },
  { pattern: /\bforeign trade\b/gi, replacement: "" },
  { pattern: /\bforeign fashion\b/gi, replacement: "" },
  { pattern: /\bcolor grading\b/gi, replacement: "" },
  { pattern: /\bblack girl\b/gi, replacement: "" },
  { pattern: /\bexotic\b/gi, replacement: "" },
];

export function stripBannedPhrases(text) {
  let out = String(text ?? "");
  for (const { pattern, replacement } of BANNED_PHRASES) {
    out = out.replace(pattern, replacement);
  }
  return out.replace(/\s{2,}/g, " ").trim();
}

// ---------------------------------------------------------------------------
// Audience and age
// ---------------------------------------------------------------------------

const KIDS_PATTERN = /kid'?s?|children'?s?|\bchild\b|boy'?s?|girl'?s?|toddler|\byrs\b|juvenile/i;
const FAMILY_PATTERN = /parent.?child|family|adults? and kids|matching outfits/i;
const ADULT_PATTERN = /\badult\b|\bwomen'?s?\b|\bmen'?s?\b|\bladies\b/i;

export const AUDIENCE = { KIDS: "kids", FAMILY: "family", ADULT: "adult" };

export function detectAudience(text) {
  if (FAMILY_PATTERN.test(text)) return AUDIENCE.FAMILY;
  if (KIDS_PATTERN.test(text)) return AUDIENCE.KIDS;
  if (ADULT_PATTERN.test(text)) return AUDIENCE.ADULT;
  return AUDIENCE.KIDS;
}

export function detectGender(text) {
  const boys = /boy'?s?|\bmale\b|\bmen'?s?\b/i.test(text);
  const girls = /girl'?s?|\bfemale\b|\bwomen'?s?\b|dress\b|skirt\b|gown\b/i.test(text);
  if (boys && girls) return "unisex";
  if (boys) return "boys";
  if (girls) return "girls";
  return "unisex";
}

/**
 * US children's size buckets. Supplier charts express size as an age range
 * ("XS/2-4yrs"), a letter, or a height range in centimetres.
 */
export const SIZE_BUCKETS = [
  { label: "2-3T", minAge: 2, maxAge: 3, heightCm: [92, 98] },
  { label: "4-5", minAge: 4, maxAge: 5, heightCm: [104, 110] },
  { label: "6-7", minAge: 6, maxAge: 7, heightCm: [116, 122] },
  { label: "8-10", minAge: 8, maxAge: 10, heightCm: [128, 140] },
  { label: "11-12", minAge: 11, maxAge: 12, heightCm: [146, 152] },
  { label: "13-14", minAge: 13, maxAge: 14, heightCm: [158, 164] },
];

/** Maps a supplier size label such as "XS/2-4yrs" or "S" to a US kids bucket. */
export function mapSizeLabel(rawLabel) {
  const label = String(rawLabel ?? "").trim();
  if (!label) return null;

  // Family matching sets size by wearer, not measurement: "Adult" / "Children".
  if (/^adults?$/i.test(label)) return "Adult";
  if (/^(kids?|child(ren)?)$/i.test(label)) return "Child";

  const ageRange = label.match(/(\d{1,2})\s*-\s*(\d{1,2})\s*(?:yrs?|years?|y\b)/i);
  if (ageRange) {
    const midpoint = (Number(ageRange[1]) + Number(ageRange[2])) / 2;
    return pickBucketByAge(midpoint);
  }

  const singleAge = label.match(/(\d{1,2})\s*(?:yrs?|years?)/i);
  if (singleAge) return pickBucketByAge(Number(singleAge[1]));

  const heightCm = label.match(/(\d{2,3})\s*-\s*(\d{2,3})\s*cm/i);
  if (heightCm) {
    const midpoint = (Number(heightCm[1]) + Number(heightCm[2])) / 2;
    const bucket = SIZE_BUCKETS.find(
      (b) => midpoint >= b.heightCm[0] - 6 && midpoint <= b.heightCm[1] + 6,
    );
    if (bucket) return bucket.label;
  }

  // Letter sizes on kids costumes skew small; XS is a toddler, not an adult XS.
  const letters = {
    XXS: "2-3T",
    XS: "2-3T",
    S: "4-5",
    M: "6-7",
    L: "8-10",
    XL: "11-12",
    XXL: "13-14",
    XXXL: "13-14",
  };
  const upper = label.toUpperCase().replace(/[^A-Z]/g, "");
  if (letters[upper]) return letters[upper];

  return null;
}

function pickBucketByAge(age) {
  const bucket =
    SIZE_BUCKETS.find((b) => age >= b.minAge && age <= b.maxAge) ??
    (age < 2 ? SIZE_BUCKETS[0] : SIZE_BUCKETS.at(-1));
  return bucket.label;
}

/** "Adult" and "Child" are wearer roles on family sets, not age brackets. */
export function ageTagsForSizes(sizeLabels) {
  return [
    ...new Set(
      sizeLabels
        .filter((label) => label && !["Adult", "Child"].includes(label))
        .map((label) => `age:${label}`),
    ),
  ];
}

// ---------------------------------------------------------------------------
// Option value cleanup
//
// The `Color` option is a junk drawer: real live values include "Complete Set",
// "Including socks", "Adult", "Britney", and "Black girl".
// ---------------------------------------------------------------------------

export const OPTION_KIND = {
  COLOR: "Color",
  PATTERN: "Pattern",
  BUNDLE: "Set",
  SIZE: "Size",
  STYLE: "Style",
};

const COLOR_WORDS =
  /^(black|white|red|blue|green|yellow|pink|purple|brown|grey|gray|orange|beige|khaki|apricot|burgundy|wine|navy|ivory|cream|gold|silver|tan|coffee|turquoise|teal|lilac|lavender|maroon|olive|rose|sky ?blue|light|dark|deep|pale|bright)/i;

const PATTERN_WORDS =
  /stripe|checker|plaid|floral|print|plaid|plaid|polka|leopard|camo|gradient|tie.?dye|bloodstain/i;

const BUNDLE_WORDS =
  /complete set|includ|\bset\b|\bwith\b|\bplus\b|wig|glasses|socks|accessor|bundle/i;

const AUDIENCE_WORDS = /^(adult|adults|children|child|kids?|boy'?s?|girl'?s?|men|women|unisex)/i;

/** Decides which option a supplier value actually belongs to. */
export function classifyOptionValue(rawValue) {
  const value = String(rawValue ?? "").trim();
  if (!value) return { kind: OPTION_KIND.COLOR, cleaned: value, moved: false };

  // Explicit liability case: not a colour, not a pattern, just removed.
  if (/black girl|black boy/i.test(value)) {
    return {
      kind: OPTION_KIND.COLOR,
      cleaned: null,
      moved: true,
      drop: true,
      note: "Non-colour value with racial connotation; remove from the Color option.",
    };
  }

  if (BUNDLE_WORDS.test(value)) {
    return { kind: OPTION_KIND.BUNDLE, cleaned: normalizeCase(value), moved: true };
  }
  if (PATTERN_WORDS.test(value)) {
    return { kind: OPTION_KIND.PATTERN, cleaned: normalizeCase(value), moved: true };
  }
  if (AUDIENCE_WORDS.test(value)) {
    return { kind: OPTION_KIND.SIZE, cleaned: normalizeCase(value), moved: true };
  }
  if (COLOR_WORDS.test(value)) {
    return { kind: OPTION_KIND.COLOR, cleaned: normalizeCase(value), moved: false };
  }
  return { kind: OPTION_KIND.STYLE, cleaned: normalizeCase(value), moved: true };
}

function normalizeCase(value) {
  return value
    .toLowerCase()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .trim();
}

// ---------------------------------------------------------------------------
// Size chart parsing
// ---------------------------------------------------------------------------

const CM_TO_IN = 2.54;

export function cmToInches(cm) {
  return Math.round((Number(cm) / CM_TO_IN) * 10) / 10;
}

/**
 * Pulls the supplier's HTML size table into structured rows and adds inch
 * conversions. 117 of 118 products carry a "Unit: cm" table and 103 give no
 * inch equivalent at all, while the store ships US-only.
 */
export function parseSizeChart(descriptionHtml) {
  const html = String(descriptionHtml ?? "");
  const tableMatch = html.match(/<table[\s\S]*?<\/table>/i);
  if (!tableMatch) return null;

  const rows = [...tableMatch[0].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((tr) =>
    [...tr[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((cell) =>
      cell[1]
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
    ),
  );

  const nonEmpty = rows.filter((r) => r.some((c) => c));
  if (nonEmpty.length < 2) return null;

  const [header, ...body] = nonEmpty;

  return {
    header: header.map(cleanHeader),
    rows: body.map((cells) =>
      cells.map((cell, index) => (index === 0 ? cell : withInches(cell))),
    ),
  };
}

function cleanHeader(cell) {
  return cell.replace(/\s*\(cm\)\s*/i, "").trim() || "Size";
}

/**
 * "82" or "82cm" becomes "82 cm / 32.3 in". Values that already carry an inch
 * conversion are left alone.
 */
function withInches(cell) {
  if (/in\b|inch/i.test(cell)) return cell;

  const range = cell.match(/^(\d{2,3})\s*-\s*(\d{2,3})\s*(?:cm)?$/i);
  if (range) {
    return `${range[1]}-${range[2]} cm / ${cmToInches(range[1])}-${cmToInches(range[2])} in`;
  }

  const single = cell.match(/^(\d{2,3}(?:\.\d)?)\s*(?:cm)?$/i);
  if (single) {
    return `${single[1]} cm / ${cmToInches(single[1])} in`;
  }

  return cell;
}

// ---------------------------------------------------------------------------
// Title generation
// ---------------------------------------------------------------------------

/**
 * Multi-piece indicators are tested before individual garments. Otherwise a
 * Sherlock Holmes costume that happens to include a cape gets titled
 * "Sherlock Holmes Cape", which undersells a four-piece set.
 */
const SET_INDICATORS = /\bset\b|includes?\b|complete|with cape|with hat|\bwith .*(and|&)/i;

const GARMENT_WORDS = [
  ["tulle skirt", "Tutu"],
  ["ballet skirt", "Tutu"],
  ["tutu", "Tutu"],
  ["jumpsuit", "Jumpsuit"],
  ["onesie", "Onesie"],
  ["pajama", "Onesie"],
  ["ball gown", "Gown"],
  ["court gown", "Gown"],
  ["gown", "Gown"],
  ["overalls", "Overalls"],
  ["dress", "Dress"],
  ["robe", "Robe"],
  ["tunic", "Tunic"],
  ["toga", "Toga"],
  ["trench coat", "Coat"],
  ["apron", "Apron Set"],
  ["uniform", "Uniform"],
  ["skirt", "Skirt"],
  ["shirt", "Shirt"],
  // Accessory-only garments last: they are usually one piece of a larger costume.
  ["cape", "Cape"],
  ["cloak", "Cape"],
  ["coat", "Coat"],
];

function detectGarment(text) {
  const lower = text.toLowerCase();

  for (const [needle, label] of GARMENT_WORDS) {
    if (lower.includes(needle)) {
      // A cape or coat named alongside set language means it's a bundle.
      if (["Cape", "Coat"].includes(label) && SET_INDICATORS.test(text)) return "Costume Set";
      return label;
    }
  }

  if (SET_INDICATORS.test(text)) return "Costume Set";
  return "Costume";
}

const OCCASION_SUFFIX = {
  [OCCASIONS.SCHOOL_PLAY]: "School Play Costume",
  [OCCASIONS.BOOK_CHARACTER_DAY]: "Book Character Day",
  [OCCASIONS.CHRISTMAS_PAGEANT]: "Christmas Pageant",
  [OCCASIONS.RECITAL]: "Recital Costume",
  [OCCASIONS.HALLOWEEN]: "Halloween Costume",
  [OCCASIONS.WORLD_CULTURES]: "World Cultures Day",
  [OCCASIONS.ST_PATRICKS]: "St. Patrick's Day",
};

export const TITLE_MAX = 70;

/**
 * Builds a "Character + Garment + Audience - Occasion" title under 70 characters.
 * Supplier titles average 88 characters and 95 of 118 exceed 70, so Google
 * truncates nearly all of them in search results.
 */
export function buildTitle(product, classification) {
  const { character, audience, primaryOccasion } = classification;
  const source = stripBannedPhrases(product.title);

  const subject = character ? character.name : fallbackSubject(source);
  const garment = detectGarment(source);
  const audienceLabel =
    audience === AUDIENCE.KIDS ? "Kids" : audience === AUDIENCE.FAMILY ? "Family" : "Adult";

  const head =
    subject.toLowerCase().includes(garment.toLowerCase())
      ? `${subject} for ${audienceLabel}`
      : `${subject} ${garment} for ${audienceLabel}`;

  const suffix = OCCASION_SUFFIX[primaryOccasion];
  const full = suffix ? `${head} - ${suffix}` : head;

  if (full.length <= TITLE_MAX) return full;
  if (head.length <= TITLE_MAX) return head;
  return head.slice(0, TITLE_MAX - 1).trimEnd().replace(/[,\-]$/, "");
}

/** Last resort when no known character matches: take the first meaningful words. */
function fallbackSubject(title) {
  const noise =
    /halloween|costume|cosplay|role.?play|performance|stage|party|outfit|clothing|children'?s?|kids?|boys?|girls?|for|and|the|with|set|new|style|fashion|dress.?up/gi;
  const words = title
    .replace(noise, " ")
    .replace(/[^A-Za-z\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
  const subject = words.slice(0, 3).join(" ").trim();
  return subject ? normalizeCase(subject) : "Storybook";
}

// ---------------------------------------------------------------------------
// Tags and product type
// ---------------------------------------------------------------------------

/** Shopify standard product taxonomy paths, used for Google Shopping mapping. */
export const PRODUCT_TYPES = {
  COSTUME: "Costumes & Accessories > Costumes",
  COSTUME_SET: "Costumes & Denim > Costume Sets",
  ACCESSORY: "Costumes & Accessories > Costume Accessories",
};

export function buildProductType() {
  return "Costumes & Accessories > Costumes";
}

export function buildTags(product, classification) {
  const { character, audience, gender, occasions, theme, sizeLabels } = classification;

  const tags = [
    `audience:${audience}`,
    `gender:${gender}`,
    `theme:${theme}`,
    ...occasions.map((o) => `occasion:${o}`),
    ...ageTagsForSizes(sizeLabels),
  ];

  if (character) {
    tags.push(`character:${character.id}`);
    if (character.work && !GENERIC_WORKS.has(character.work)) {
      tags.push(`story:${slug(character.work)}`);
    }
  }

  // Merchandising flags the storefront and automated collections rely on.
  if (product.images?.length >= 4) tags.push("has-gallery");
  if (occasions.includes(OCCASIONS.SCHOOL_PLAY)) tags.push("collection:school-plays");
  if (occasions.includes(OCCASIONS.BOOK_CHARACTER_DAY)) tags.push("collection:book-character-day");
  if (occasions.includes(OCCASIONS.CHRISTMAS_PAGEANT)) tags.push("collection:pageants");
  if (occasions.includes(OCCASIONS.RECITAL)) tags.push("collection:recitals");
  if (occasions.includes(OCCASIONS.HALLOWEEN)) tags.push("collection:halloween");
  if (audience === AUDIENCE.FAMILY) tags.push("collection:family-matching");

  return [...new Set(tags)].sort();
}

export function slug(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ---------------------------------------------------------------------------
// Description generation
// ---------------------------------------------------------------------------

/**
 * Extracts the handful of genuinely useful facts from the supplier spec dump
 * before the rest is discarded.
 */
export function extractSpecs(descriptionHtml) {
  const text = String(descriptionHtml ?? "")
    .replace(/<table[\s\S]*?<\/table>/gi, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&");

  const specs = {};
  const wanted = [
    ["fabric", /(?:main fabric composition|fabric name|main fabric component\s*\d*)\s*[:：]\s*([^\n]+)/i],
    ["material", /(?:material)\s*[:：]\s*([^\n]+)/i],
    ["includes", /(?:package includes?|set includes?|includes?)\s*[:：]\s*([^\n]+)/i],
    ["sleeve", /sleeve length\s*[:：]\s*([^\n]+)/i],
    ["category", /product category\s*[:：]\s*([^\n]+)/i],
    ["color", /(?:^|\n)\s*colou?r\s*[:：]\s*([^\n]+)/i],
  ];

  for (const [key, pattern] of wanted) {
    const match = text.match(pattern);
    if (match) {
      const value = match[1].replace(/\s+/g, " ").trim();
      if (value && value.length < 120) specs[key] = value;
    }
  }

  return specs;
}

const OCCASION_COPY = {
  [OCCASIONS.SCHOOL_PLAY]: "school plays and drama club productions",
  [OCCASIONS.BOOK_CHARACTER_DAY]: "Book Character Day and World Read Aloud Day",
  [OCCASIONS.CHRISTMAS_PAGEANT]: "Christmas pageants and nativity programs",
  [OCCASIONS.RECITAL]: "dance recitals and stage performances",
  [OCCASIONS.HALLOWEEN]: "Halloween and costume parties",
  [OCCASIONS.WORLD_CULTURES]: "World Cultures Day and history projects",
  [OCCASIONS.ST_PATRICKS]: "St. Patrick's Day parades and assemblies",
};

/**
 * Builds the replacement description. Everything the supplier gave us is
 * discarded except the parsed size chart and a few specs, because all 118
 * descriptions hotlink images from the supplier's Alibaba CDN
 * (shopifyfile.oss-accelerate.aliyuncs.com) which can vanish at any time.
 */
export function buildDescriptionHtml(product, classification) {
  const { character, audience, occasions, sizeChart } = classification;
  const specs = extractSpecs(product.descriptionHtml);

  const subject = character?.name ?? "This costume";
  const work = character?.work;
  const audienceWord =
    audience === AUDIENCE.FAMILY ? "the whole family" : audience === AUDIENCE.ADULT ? "adults" : "kids";

  const parts = [];

  const intro = work
    ? `<p>A ${subject.toLowerCase()} costume for ${audienceWord}, cut for the stage. ${work === "Animals" || work === "Decades" || work === "World cultures" ? "" : `Instantly recognisable as ${subject} from <em>${work}</em>, `}so your child walks out and everyone knows exactly who they are.</p>`
    : `<p>A stage-ready costume for ${audienceWord}, built to read clearly from the back row of an auditorium.</p>`;
  parts.push(intro.replace(/\s{2,}/g, " "));

  const occasionList = occasions
    .map((o) => OCCASION_COPY[o])
    .filter(Boolean)
    .slice(0, 3);
  if (occasionList.length) {
    parts.push(`<p><strong>Made for:</strong> ${formatList(occasionList)}.</p>`);
  }

  const bullets = [];
  if (specs.fabric || specs.material) {
    bullets.push(`<li><strong>Fabric:</strong> ${specs.fabric ?? specs.material}</li>`);
  }
  if (specs.includes) bullets.push(`<li><strong>Included:</strong> ${specs.includes}</li>`);
  if (specs.sleeve) bullets.push(`<li><strong>Sleeves:</strong> ${specs.sleeve}</li>`);
  bullets.push("<li><strong>Sizing:</strong> US kids sizes, measured in inches below</li>");
  bullets.push("<li><strong>Care:</strong> Cold hand wash, hang dry, do not tumble dry</li>");
  parts.push(`<ul>${bullets.join("")}</ul>`);

  if (sizeChart) parts.push(renderSizeChart(sizeChart));

  parts.push(
    [
      "<p><strong>Getting the size right.</strong> Costume sizing runs small, so order by your",
      "child's chest measurement and height rather than their usual clothing size. If they fall",
      "between two sizes, size up — a costume that is slightly loose still reads correctly on",
      'stage. See our <a href="/pages/size-guide">Size Guide</a> for how to measure.</p>',
    ].join(" "),
  );

  parts.push(
    [
      '<p><strong>Need it by a date?</strong> Order at least four weeks ahead with standard shipping,',
      'or two weeks with expedited. Add your event date in the order notes and we will flag it. See',
      'the <a href="/pages/costume-by-date">Costume by Date guide</a>.</p>',
    ].join(" "),
  );

  parts.push(
    [
      "<p><strong>Safety.</strong> A dress-up and stage garment, not flame-resistant and not",
      "sleepwear. Keep away from open flames and supervise children while wearing, especially with",
      "capes, hoods, or small accessories.</p>",
    ].join(" "),
  );

  return parts.join("\n");
}

function renderSizeChart(chart) {
  const head = chart.header.map((h) => `<th>${escapeHtml(h)}</th>`).join("");
  const body = chart.rows
    .map((row) => `<tr>${row.map((c) => `<td>${escapeHtml(c)}</td>`).join("")}</tr>`)
    .join("");

  return [
    "<h3>Size chart</h3>",
    '<table class="size-chart">',
    `<thead><tr>${head}</tr></thead>`,
    `<tbody>${body}</tbody>`,
    "</table>",
    "<p><em>Measurements are the flat garment, not the body. Allow room for movement.</em></p>",
  ].join("\n");
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatList(items) {
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

// ---------------------------------------------------------------------------
// Alt text
// ---------------------------------------------------------------------------

/** All 370 live images have empty alt text. */
export function buildAltText(product, classification, index) {
  const { character, audience, gender } = classification;
  const subject = character?.name ?? "Storybook";
  const who =
    audience === AUDIENCE.FAMILY
      ? "family"
      : audience === AUDIENCE.ADULT
        ? "adult"
        : gender === "unisex"
          ? "child"
          : gender === "boys"
            ? "boy"
            : "girl";

  const view = ["front view", "side view", "back view", "detail view", "styled on stage"][index] ?? `view ${index + 1}`;
  return `${subject} costume worn by a ${who} - ${view}`;
}

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

/**
 * Supplier prices are raw markup output: $36.54, $37.82, $21.22, $228.04.
 * Round to charm endings and set a compare-at anchor, since zero of the 891
 * live variants currently have one.
 */
export function repriceVariant(currentPrice, { anchorMultiplier = 1.3 } = {}) {
  const price = Number(currentPrice);
  if (!Number.isFinite(price) || price <= 0) return null;

  const charm = charmPrice(price);
  const anchor = charmPrice(charm * anchorMultiplier, { anchor: true });

  return {
    price: charm.toFixed(2),
    compareAtPrice: anchor.toFixed(2),
  };
}

function charmPrice(value, { anchor = false } = {}) {
  if (value < 20) return floorTo(value, 0.99, 1);
  if (value < 100) return floorTo(value, anchor ? 0.0 : 0.99, 1);
  return floorTo(value, anchor ? 0.0 : 0.95, 5);
}

/** Rounds to the nearest `step` then applies a fixed cents ending. */
function floorTo(value, cents, step) {
  const whole = Math.max(step, Math.round(value / step) * step);
  return cents === 0 ? whole : whole - 1 + cents;
}

// ---------------------------------------------------------------------------
// Top-level classification
// ---------------------------------------------------------------------------

export const DECISION = { KEEP: "keep", CUT: "cut", REVIEW: "review" };

export function classify(product) {
  const haystack = `${product.title} ${stripHtml(product.descriptionHtml).slice(0, 400)}`;

  const character = detectCharacter(product.title) ?? detectCharacter(haystack);
  const audience = detectAudience(haystack);
  const gender = detectGender(haystack);
  const cutRule = findCutRule(product.title) ?? findCutRule(haystack);

  const sizeChart = parseSizeChart(product.descriptionHtml);
  const sizeLabels = collectSizeLabels(product);

  const occasions = deriveOccasions(product, character);
  const theme = character?.theme ?? THEMES.STORYBOOK;

  const reasons = [];
  let decision = DECISION.KEEP;

  if (cutRule) {
    decision = DECISION.CUT;
    reasons.push(`[${cutRule.id}] ${cutRule.reason}`);
  } else if (audience === AUDIENCE.ADULT) {
    // Adult costumes survive only as the parent/teacher and family-matching line.
    decision = DECISION.REVIEW;
    reasons.push(
      "Adult-only costume. Keep only if it supports the parent/teacher or family-matching line.",
    );
  }

  if (!product.images?.length) {
    reasons.push("No images. Cannot be sold as-is; re-import from the supplier or draft it.");
    if (decision === DECISION.KEEP) decision = DECISION.REVIEW;
  } else if (product.images.length <= 2) {
    reasons.push(`Only ${product.images.length} image(s). Apparel needs 5 or more.`);
  }

  const classification = {
    character,
    audience,
    gender,
    occasions,
    primaryOccasion: occasions[0] ?? OCCASIONS.SCHOOL_PLAY,
    theme,
    sizeChart,
    sizeLabels,
    decision,
    reasons,
    cutRule,
  };

  classification.newTitle = buildTitle(product, classification);
  classification.newTags = buildTags(product, classification);
  classification.newProductType = buildProductType();
  classification.newDescriptionHtml = buildDescriptionHtml(product, classification);

  return classification;
}

function deriveOccasions(product, character) {
  const text = product.title;
  const found = new Set(character?.occasions ?? []);

  if (/halloween/i.test(text)) found.add(OCCASIONS.HALLOWEEN);
  if (/christmas|nativity|advent/i.test(text)) found.add(OCCASIONS.CHRISTMAS_PAGEANT);
  if (/st\.? patrick|irish/i.test(text)) found.add(OCCASIONS.ST_PATRICKS);
  if (/stage|drama|play|theatre|theater|pantomime/i.test(text)) found.add(OCCASIONS.SCHOOL_PLAY);
  if (/dance|ballet|recital|catwalk|cheerlead/i.test(text)) found.add(OCCASIONS.RECITAL);

  if (!found.size) found.add(OCCASIONS.SCHOOL_PLAY);

  // School-play and book-character-day lead, because those are the low-competition
  // searches. Halloween is last: that market belongs to Spirit Halloween and Amazon.
  const priority = [
    OCCASIONS.SCHOOL_PLAY,
    OCCASIONS.BOOK_CHARACTER_DAY,
    OCCASIONS.CHRISTMAS_PAGEANT,
    OCCASIONS.RECITAL,
    OCCASIONS.WORLD_CULTURES,
    OCCASIONS.ST_PATRICKS,
    OCCASIONS.HALLOWEEN,
  ];
  return priority.filter((o) => found.has(o));
}

function collectSizeLabels(product) {
  const sizeOption = product.options?.find((o) =>
    /size|height|age/i.test(o.name),
  );
  const values = sizeOption?.optionValues?.map((v) => v.name) ?? [];
  return values.map(mapSizeLabel).filter(Boolean);
}

export function stripHtml(html) {
  return String(html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Supplier CDN hosts that must not appear in any description we publish. */
export const SUPPLIER_CDN_PATTERN =
  /(aliyuncs\.com|alicdn\.com|ae01\.alicdn|shopifyfile\.oss|cjdropshipping|eprolo)/i;

export function hasSupplierCdn(html) {
  return SUPPLIER_CDN_PATTERN.test(String(html ?? ""));
}
