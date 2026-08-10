const KIDS_PATTERN =
  /\b(kid'?s?|children'?s?|child|boy'?s?|girl'?s?|toddler|youth|family|parent[- ]?child)\b/iu;
const COSTUME_PATTERN =
  /\b(costume|cosplay|role[- ]?play|dress[- ]?up|stage|performance|pantomime|pageant|character)\b/iu;
const FAMILY_PATTERN = /\b(family|parent[- ]?child|matching|teacher)\b/iu;
const SUPPLIER_IMAGE_PATTERN =
  /<(?:img|source)\b[^>]*(?:aliyuncs|alicdn|shopifyfile\.oss-accelerate)[^>]*\/?>/giu;

const CHARACTER_RULES = [
  [/\b(tin man|wizard of oz)\b/iu, "Tin Man"],
  [/\b(cinderella)\b/iu, "Cinderella"],
  [/\b(alice in wonderland|queen of hearts|wonderland)\b/iu, "Alice in Wonderland"],
  [/\b(robin hood|peter pan)\b/iu, "Robin Hood"],
  [/\b(sherlock holmes|detective)\b/iu, "Detective"],
  [/\b(little match girl|match girl)\b/iu, "Little Match Girl"],
  [/\b(red riding hood|big bad wolf)\b/iu, "Big Bad Wolf"],
  [/\b(scarecrow)\b/iu, "Scarecrow"],
  [/\b(zeus)\b/iu, "Zeus"],
  [/\b(athena)\b/iu, "Athena"],
  [/\b(greek|roman|toga)\b/iu, "Greek Toga"],
  [/\b(pirate|caribbean)\b/iu, "Pirate"],
  [/\b(princess)\b/iu, "Princess"],
  [/\b(queen)\b/iu, "Queen"],
  [/\b(king)\b/iu, "King"],
  [/\b(knight)\b/iu, "Knight"],
  [/\b(archer|hunter)\b/iu, "Archer"],
  [/\b(reindeer|deer)\b/iu, "Reindeer"],
  [/\b(werewolf|wolf)\b/iu, "Wolf"],
  [/\b(lion)\b/iu, "Lion"],
  [/\b(rabbit|bunny)\b/iu, "Rabbit"],
  [/\b(cat)\b/iu, "Cat"],
  [/\b(bat)\b/iu, "Bat"],
  [/\b(mantis)\b/iu, "Mantis"],
  [/\b(clown)\b/iu, "Clown"],
  [/\b(nun)\b/iu, "Nun"],
  [/\b(pastor|choir)\b/iu, "Choir"],
  [/\b(shepherd)\b/iu, "Shepherd"],
  [/\b(maid|farm girl)\b/iu, "Farm Maid"],
  [/\b(grandpa|elder)\b/iu, "Grandpa"],
  [/\b(vampire)\b/iu, "Vampire"],
  [/\b(ghost|skeleton bride)\b/iu, "Ghost Bride"],
  [/\b(alien|robot)\b/iu, "Robot"],
  [/\b(hippie|disco|70s)\b/iu, "1970s Disco"],
];

const PROBLEM_OPTION_VALUES = new Map(
  [
    "black girl",
    "complete set",
    "set includes wig and glasses",
    "including socks",
    "adult",
    "children",
    "kids",
    "britney",
  ].map((value) => [value, true]),
);

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function textFor(product) {
  return `${product.title || ""} ${stripHtml(product.descriptionHtml || "")}`;
}

function detectedCharacter(text) {
  return CHARACTER_RULES.find(([pattern]) => pattern.test(text))?.[1] || null;
}

function garmentFor(text) {
  if (/\b(dress|gown)\b/iu.test(text)) return "Dress";
  if (/\b(jumpsuit|onesie|pajamas)\b/iu.test(text)) return "Jumpsuit";
  if (/\b(robe|toga)\b/iu.test(text)) return "Robe";
  if (/\b(set)\b/iu.test(text)) return "Costume Set";
  return "Costume";
}

function audienceFor(text) {
  if (/\b(girl'?s?)\b/iu.test(text)) return "Girls";
  if (/\b(boy'?s?)\b/iu.test(text)) return "Boys";
  if (FAMILY_PATTERN.test(text)) return "Families";
  return "Kids";
}

function occasionFor(text) {
  if (/\bchristmas|pageant|choir|pastor|shepherd\b/iu.test(text)) {
    return "Christmas Pageant";
  }
  if (/\bbook|storybook|match girl|wonderland|wizard of oz\b/iu.test(text)) {
    return "Book Character Day";
  }
  if (/\bdance|ballet|recital|cheer\b/iu.test(text)) {
    return "Dance Recital";
  }
  if (/\bhalloween\b/iu.test(text)) return "Halloween";
  return "School Play";
}

export function stripHtml(html) {
  return String(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/giu, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/&nbsp;|&#160;/giu, " ")
    .replace(/&amp;/giu, "&")
    .replace(/&quot;|&#34;/giu, '"')
    .replace(/&#39;|&apos;/giu, "'")
    .replace(/&lt;/giu, "<")
    .replace(/&gt;/giu, ">")
    .replace(/\s+/gu, " ")
    .trim();
}

export function normalizeTitle(title) {
  return String(title)
    .toLocaleLowerCase("en-US")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

export function decideDispositions(products) {
  const duplicateGroups = new Map();

  for (const product of products) {
    const key = normalizeTitle(product.title);
    const group = duplicateGroups.get(key) || [];
    group.push(product);
    duplicateGroups.set(key, group);
  }

  const duplicateIds = new Set();
  for (const group of duplicateGroups.values()) {
    if (group.length < 2) continue;
    const ranked = [...group].sort((left, right) => {
      const mediaDifference = right.media.nodes.length - left.media.nodes.length;
      if (mediaDifference !== 0) return mediaDifference;
      return new Date(left.createdAt) - new Date(right.createdAt);
    });
    for (const duplicate of ranked.slice(1)) duplicateIds.add(duplicate.id);
  }

  return products.map((product) => {
    const text = textFor(product);
    const kidsOrFamily = KIDS_PATTERN.test(text);
    const costume = COSTUME_PATTERN.test(text);
    const family = FAMILY_PATTERN.test(text);
    const reasons = [];

    if (product.media.nodes.length === 0) reasons.push("zero-images");
    if (duplicateIds.has(product.id)) reasons.push("duplicate-title");
    if (!kidsOrFamily && !costume) reasons.push("off-niche-apparel");
    if (!kidsOrFamily && costume && !family) reasons.push("adult-only-costume");

    return {
      id: product.id,
      title: product.title,
      currentStatus: product.status,
      proposedStatus: reasons.length > 0 ? "ARCHIVED" : product.status,
      reasons,
    };
  });
}

export function taxonomyFor(product) {
  const text = textFor(product);
  const character = detectedCharacter(text);
  const tags = ["department:kids-costumes"];

  if (/\b(halloween)\b/iu.test(text)) tags.push("occasion:halloween");
  if (/\b(stage|play|performance|pantomime|drama|choir)\b/iu.test(text)) {
    tags.push("occasion:school-play");
  }
  if (
    character &&
    /\b(wizard of oz|wonderland|match girl|robin hood|peter pan|storybook)\b/iu.test(
      text,
    )
  ) {
    tags.push("occasion:book-character-day");
  }
  if (/\b(christmas|pageant|pastor|choir|shepherd|reindeer)\b/iu.test(text)) {
    tags.push("occasion:christmas-pageant");
  }
  if (/\b(dance|ballet|recital|cheer)\b/iu.test(text)) {
    tags.push("occasion:recital");
  }
  if (/\b(family|parent[- ]?child|matching)\b/iu.test(text)) {
    tags.push("audience:family-matching");
  } else {
    tags.push("audience:kids");
  }
  if (/\b(girl'?s?)\b/iu.test(text)) tags.push("gender:girls");
  else if (/\b(boy'?s?)\b/iu.test(text)) tags.push("gender:boys");
  else tags.push("gender:unisex");

  if (character) {
    tags.push(
      `character:${character.toLocaleLowerCase("en-US").replace(/[^a-z0-9]+/gu, "-")}`,
    );
  }
  if (/\b(greek|roman|zeus|athena|goddess)\b/iu.test(text)) {
    tags.push("theme:mythology");
  }
  if (
    /\b(wizard of oz|wonderland|match girl|robin hood|peter pan|storybook|fairy tale)\b/iu.test(
      text,
    )
  ) {
    tags.push("theme:storybook");
  }
  if (/\b(medieval|victorian|vintage|historical|court|1970s|70s)\b/iu.test(text)) {
    tags.push("theme:historical");
  }
  if (/\b(animal|wolf|lion|rabbit|bunny|cat|bat|mantis|reindeer)\b/iu.test(text)) {
    tags.push("theme:animals");
  }
  const ranges = [...ageMappings(product).values()];
  if (ranges.some((range) => range.start <= 4) || /\btoddler\b/iu.test(text)) {
    tags.push("age:2-4");
  }
  if (ranges.some((range) => range.start <= 7 && range.end >= 4)) {
    tags.push("age:4-7");
  }
  if (ranges.some((range) => range.end >= 8)) {
    tags.push("age:8-12");
  }

  return {
    productType: FAMILY_PATTERN.test(text) ? "Family Costumes" : "Kids' Costumes",
    tags: unique([...(product.tags || []), ...tags]).sort(),
  };
}

function truncateTitle(title, maximum = 70) {
  if (title.length <= maximum) return title;
  const shortened = title.slice(0, maximum + 1);
  const boundary = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, boundary > 45 ? boundary : maximum).trim()}…`;
}

export function titleSuggestion(product) {
  const text = textFor(product);
  const character = detectedCharacter(text);

  if (!character || !KIDS_PATTERN.test(text)) {
    return {
      confidence: "review",
      suggestedTitle: truncateTitle(
        product.title
          .replace(/\bforeign trade\b/giu, "")
          .replace(/\s+/gu, " ")
          .trim(),
      ),
      reason: character ? "adult-or-ambiguous-audience" : "character-not-detected",
    };
  }

  const candidate = `${character} ${garmentFor(text)} for ${audienceFor(text)} - ${occasionFor(text)}`;
  return {
    confidence: "safe",
    suggestedTitle: truncateTitle(candidate),
    reason: "character-and-kids-audience-detected",
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;")
    .replace(/'/gu, "&#39;");
}

function convertMeasurement(value) {
  return value.replace(
    /(\d+(?:\.\d+)?)\s*(?:-|–)\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)/gu,
    (match, rangeStart, rangeEnd, single) => {
      if (rangeStart && rangeEnd) {
        return `${rangeStart}-${rangeEnd} cm / ${(Number(rangeStart) / 2.54).toFixed(1)}-${(
          Number(rangeEnd) / 2.54
        ).toFixed(1)} in`;
      }
      if (single) {
        return `${single} cm / ${(Number(single) / 2.54).toFixed(1)} in`;
      }
      return match;
    },
  );
}

export function dualUnitSizeTable(descriptionHtml) {
  const html = String(descriptionHtml || "");
  const match = html.match(/<table\b[^>]*>[\s\S]*?<\/table>/iu);
  if (!match) return "";
  if (!/\bcm\b/iu.test(html) || /\b(?:in|inch|inches)\b/iu.test(match[0])) {
    return match[0];
  }

  return match[0].replace(
    /<tr\b([^>]*)>([\s\S]*?)<\/tr>/giu,
    (row, rowAttributes, cellsHtml) => {
      let cellIndex = 0;
      const convertedCells = cellsHtml.replace(
        /<(td|th)\b([^>]*)>([\s\S]*?)<\/\1>/giu,
        (cell, tag, attributes, contents) => {
          const currentIndex = cellIndex;
          cellIndex += 1;
          if (tag.toLocaleLowerCase("en-US") === "th" || currentIndex === 0) {
            return cell;
          }

          const plain = stripHtml(contents);
          if (!/^\d+(?:\.\d+)?(?:\s*(?:-|–)\s*\d+(?:\.\d+)?)?$/u.test(plain)) {
            return cell;
          }

          return `<${tag}${attributes}>${escapeHtml(convertMeasurement(plain))}</${tag}>`;
        },
      );
      return `<tr${rowAttributes}>${convertedCells}</tr>`;
    },
  );
}

function materialFrom(descriptionHtml) {
  const text = stripHtml(descriptionHtml);
  const match = text.match(
    /(?:fabric name|main fabric composition|material)\s*:\s*([A-Za-z -]{3,40})/iu,
  );
  return match?.[1]?.trim() || null;
}

export function rewrittenDescription(product) {
  const text = textFor(product);
  const character = detectedCharacter(text) || "their character";
  const occasion = occasionFor(text);
  const material = materialFrom(product.descriptionHtml);
  const table = dualUnitSizeTable(
    String(product.descriptionHtml || "").replace(SUPPLIER_IMAGE_PATTERN, ""),
  );

  const paragraphs = [
    `<p><strong>Help your child step confidently into the role of ${escapeHtml(character)}.</strong> This costume is selected for school plays, book character days, recitals, pageants, and dress-up events where comfort and a clear character look matter.</p>`,
    `<h2>Made for the moment</h2><ul><li>Best suited to ${escapeHtml(occasion.toLocaleLowerCase("en-US"))} events</li><li>Choose the exact color, size, and set shown in the selector before adding to cart</li><li>Order early enough to allow for delivery and a try-on before the event</li></ul>`,
    `<h2>Size and fit</h2><p>Measure the child and use the measurements below rather than ordering by age alone. If the child is between sizes, choose the larger size for easier movement and layering.</p>`,
  ];

  if (table) paragraphs.push(table);
  if (material) {
    paragraphs.push(
      `<h2>Material</h2><p>${escapeHtml(material)}. Follow the care label supplied with the garment.</p>`,
    );
  }
  paragraphs.push(
    "<p><em>What is included varies by the selected option. Props, wigs, shoes, and accessories shown in lifestyle photos are not included unless the option explicitly says they are.</em></p>",
  );

  return paragraphs.join("");
}

export function ageMappings(product) {
  const text = stripHtml(product.descriptionHtml || "");
  const found = new Map();
  const pattern =
    /\b(XXL|XL|XS|S|M|L)\s*\/?\s*(\d{1,2})\s*(?:-|–)\s*(\d{1,2})\s*(?:yrs?|years?)\b/giu;

  for (const match of text.matchAll(pattern)) {
    found.set(match[1].toLocaleUpperCase("en-US"), {
      start: Number(match[2]),
      end: Number(match[3]),
    });
  }

  return found;
}

export function sizingPlan(product) {
  const option = product.options.find(
    (candidate) => candidate.name === "Suitable for height",
  );
  if (!option) return null;

  const mappings = ageMappings(product);
  const optionValuesToUpdate = option.optionValues.flatMap((value) => {
    const age = mappings.get(value.name.toLocaleUpperCase("en-US"));
    if (!age) return [];
    return [
      {
        id: value.id,
        name: `${value.name.toLocaleUpperCase("en-US")} / ${age.start}-${age.end} years`,
      },
    ];
  });

  return {
    option: { id: option.id, name: "Size" },
    optionValuesToUpdate,
    unmappedValues: option.optionValues
      .filter(
        (value) =>
          !mappings.has(value.name.toLocaleUpperCase("en-US")),
      )
      .map((value) => value.name),
  };
}

export function roundedRetailPrice(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error(`Invalid price: ${value}`);
  }

  const whole = Math.floor(amount);
  const cents = Math.round((amount - whole) * 100);
  const rounded =
    cents <= 95 ? whole + 0.95 : cents <= 99 ? whole + 0.99 : whole + 1.95;
  return rounded.toFixed(2);
}

export function imageAlt(product, index) {
  const title = titleSuggestion(product).suggestedTitle.replace(/\s+-\s+.*$/u, "");
  return `${title}, product image ${index + 1}`;
}

export function problematicOptions(product) {
  return product.options.flatMap((option) =>
    option.optionValues
      .filter((value) =>
        PROBLEM_OPTION_VALUES.has(value.name.toLocaleLowerCase("en-US")),
      )
      .map((value) => ({
        option: option.name,
        value: value.name,
      })),
  );
}
