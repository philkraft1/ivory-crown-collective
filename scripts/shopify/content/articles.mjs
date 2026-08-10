/**
 * Blog articles for the store. 13-blog.mjs publishes these to the "News" blog,
 * which currently has zero posts.
 *
 * These target the searches the niche actually wins. Competing for "halloween
 * costumes" means competing with Spirit Halloween, Party City, and Amazon. Competing
 * for "book character day costume ideas for boys" or "wizard of oz school play
 * costumes" means competing with Pinterest boards and mommy blogs that don't sell
 * anything. Each post exists to rank for one of those, then route to a collection.
 */

const CTA = (handle, label) =>
  `<p><a href="/collections/${handle}"><strong>${label}</strong></a></p>`;

export const ARTICLES = [
  {
    handle: "book-character-day-costume-ideas",
    title: "27 Book Character Day Costume Ideas That Aren't a Cape and a Mask",
    summary:
      "Costume ideas for Book Character Day, sorted by how recognizable they are and how little work they take. Plus what to do when you find out the night before.",
    tags: ["book character day", "school", "costume ideas"],
    seoTitle: "27 Book Character Day Costume Ideas for Kids (2026)",
    seoDescription:
      "Book Character Day costume ideas sorted by recognizability and effort, for boys and girls, toddler through age 12. Plus a last-minute plan.",
    body: `
<p>Book Character Day has a specific failure mode: your child picks a character nobody
can identify, spends the day explaining it, and comes home deflated. The costume itself
was fine. The <em>recognizability</em> wasn't.</p>

<p>So this list is sorted by how instantly a room full of eight-year-olds will get it.</p>

<h2>Instantly recognizable, minimal effort</h2>

<p>These read from across a gymnasium, which is the actual test.</p>

<ul>
  <li><strong>The Tin Man</strong> — <em>The Wizard of Oz.</em> Silver, funnel hat, done.
  One of the few characters where the silhouette alone identifies it.</li>
  <li><strong>The Scarecrow</strong> — <em>The Wizard of Oz.</em> Overalls, straw at the
  cuffs, a bit of burlap. Comfortable enough to sit through a whole school day in.</li>
  <li><strong>Little Red Riding Hood</strong> — Brothers Grimm. The red hood does all the
  work. Pair siblings as Red and the wolf.</li>
  <li><strong>The Queen of Hearts</strong> — <em>Alice in Wonderland.</em> Red, black,
  hearts, crown.</li>
  <li><strong>The Cheshire Cat</strong> — <em>Alice in Wonderland.</em> Stripes and a grin.</li>
  <li><strong>Sherlock Holmes</strong> — deerstalker, cape, magnifying glass. Reads as
  "detective" even to kids who haven't read it.</li>
  <li><strong>Robin Hood</strong> — green tunic, bow. Doubles as Peter Pan with a hat swap.</li>
  <li><strong>The Big Bad Wolf</strong> — Three Little Pigs or Red Riding Hood.</li>
</ul>

${CTA("book-character-day", "Shop Book Character Day costumes")}

<h2>Strong picks that show some thought</h2>

<ul>
  <li><strong>The Little Match Girl</strong> — Hans Christian Andersen. Genuinely moving,
  and almost nobody else picks it.</li>
  <li><strong>Oliver Twist</strong> or any Victorian street urchin — flat cap, waistcoat,
  a bit of stage dirt. Covers <em>Oliver!</em>, <em>A Christmas Carol</em>, and
  <em>Les Misérables</em>.</li>
  <li><strong>Cinderella before the ball</strong> — the apron-and-headscarf version. More
  interesting than the gown and far more comfortable.</li>
  <li><strong>Zeus or Athena</strong> — for a class doing a mythology unit. A toga plus one
  prop, and the child gets to explain something they actually learned.</li>
  <li><strong>Laura Ingalls</strong> — <em>Little House on the Prairie.</em> Prairie dress,
  bonnet.</li>
  <li><strong>A pirate</strong> — <em>Treasure Island</em> or <em>Peter Pan.</em> Always works.</li>
</ul>

<h2>By age</h2>

<p><strong>Toddlers (2–3T).</strong> One-piece costumes only. Anything with a separate
cape, belt, or prop will be lost or shed by 10 a.m. Animals are the safe pick.</p>

<p><strong>Ages 4–7.</strong> The sweet spot. Kids this age commit fully to a character.
Prioritize recognizability — this is the age where being identified matters most socially.</p>

<p><strong>Ages 8–12.</strong> Old enough to want something with a bit of status.
Sherlock, Robin Hood, and mythology figures land better than storybook animals.</p>

${CTA("little-kids-costumes", "Shop by age")}

<h2>Rules that are easy to miss</h2>

<p>Most schools require the character to come <strong>from a book</strong>, which quietly
disqualifies film-only characters. Superheroes are usually banned outright. Weapon props
— including a bow, a sword, or Sherlock's pipe — are frequently not allowed.</p>

<p>Check the note that came home before you buy. Asking the teacher which characters are
already taken is also worth the email; three Tin Men in one class is a real outcome.</p>

<h2>When you find out the night before</h2>

<p>It happens. Ranked by likely success with what's already in the house:</p>

<ol>
  <li><strong>A character defined by one object.</strong> Red hood, deerstalker, straw hat.</li>
  <li><strong>Pajama characters.</strong> Several picture-book characters wear nightclothes,
  and this is entirely legitimate.</li>
  <li><strong>A named sign.</strong> Genuinely acceptable at most schools if the outfit
  gestures at the character. Better than nothing and better than staying home.</li>
</ol>

<p>For next year, note that these days move barely at all: Book Character Day usually sits
near <strong>Read Across America on March 2</strong>, and World Read Aloud Day is in early
February. Ordering in January costs nothing and removes the panic entirely. Our
<a href="/pages/costume-by-date">Costume by Date guide</a> has the order-by dates.</p>

<h2>Getting the size right</h2>

<p>Costume sizing runs smaller than regular kids' clothing. Order by your child's
<strong>chest measurement</strong>, not their usual size, and size up if they're between
two. Our <a href="/pages/size-guide">Size Guide</a> shows how to measure in about a minute,
and we cover return shipping on your first size exchange.</p>
`,
  },

  {
    handle: "wizard-of-oz-school-play-costume-guide",
    title: "The Wizard of Oz School Play: A Costume Guide for Every Part",
    summary:
      "What each role in a school production of The Wizard of Oz actually needs, including the Munchkins and Winkies nobody plans for, and how far ahead to order.",
    tags: ["school play", "wizard of oz", "costume guide"],
    seoTitle: "Wizard of Oz School Play Costumes: Guide to Every Role",
    seoDescription:
      "Costume guide for a school production of The Wizard of Oz. Every role covered, including ensemble parts, with sizing and order-by timing.",
    body: `
<p><em>The Wizard of Oz</em> is one of the most-staged school productions in America,
which means every year thousands of parents get a cast list and a short deadline. Here's
what each part actually needs.</p>

<h2>The four leads</h2>

<p><strong>Dorothy.</strong> Blue gingham pinafore over a white blouse, braids, and the
shoes. The dress is easy; the ruby slippers are what people notice, and glitter over a
plain pair works fine on stage. Dorothy is on stage almost continuously, so comfort
matters more than for any other role.</p>

<p><strong>The Scarecrow.</strong> Brown or tan overalls, a plaid shirt, a floppy hat, and
straw at the cuffs, collar, and hat brim. The straw is the whole costume — without it he's
a farmhand. The Scarecrow also does the most physical comedy, so nothing should restrict
the knees or shoulders.</p>

<p><strong>The Tin Man.</strong> Silver head to toe with a funnel hat. The most
recognizable silhouette in the show. Watch the arms: some versions restrict the elbow, and
he has choreography.</p>

<p><strong>The Cowardly Lion.</strong> A tan or golden furry suit with a mane and tail. The
warmest costume in the production by a wide margin — under stage lights, in a full plush
suit, for two hours. Size up, and send a water bottle.</p>

${CTA("storybook-classics", "Shop Wizard of Oz characters")}

<h2>The parts nobody plans for</h2>

<p>This is where school productions actually get stuck, because these are cast in bulk and
late.</p>

<p><strong>Munchkins.</strong> Usually the youngest children in the school, usually a dozen
or more. Bright colors, layered skirts or waistcoats, and often a hat. Directors typically
want them coordinated rather than identical, so a range of bright costumes in the same
palette works better than trying to match exactly. Size 2-3T through 6-7.</p>

<p><strong>Winkie guards.</strong> Green or dark uniform-style tunics, marching in step.
Simple, but needed in quantity.</p>

<p><strong>Flying monkeys.</strong> Dark animal costumes with wings. Any brown or grey
animal costume reads correctly under stage lighting.</p>

<p><strong>Poppies, crows, trees, Emerald City citizens.</strong> These vary entirely by
director. Ask before buying — many productions handle them with a single colored garment
plus a headpiece the art class makes.</p>

<h2>The remaining named roles</h2>

<p><strong>Glinda</strong> needs a pale pink or white gown, a crown, and a wand — she gets
the biggest entrance in the show. <strong>The Wicked Witch</strong> needs black, green
makeup, and a pointed hat, and is often played by an older student, so check whether you
need an adult size. <strong>Professor Marvel and the Wizard</strong> are usually a suit and
a bit of showmanship. <strong>Aunt Em and Uncle Henry</strong> are plain prairie clothing:
apron, work shirt, muted colors.</p>

${CTA("school-plays", "Shop school play costumes")}

<h2>Timing</h2>

<p>School productions rarely give more than four weeks' notice, and standard shipping runs
8–18 business days door to door — closer to four calendar weeks than three.</p>

<p>If your child is in drama club, <strong>order the size before you know the part.</strong>
It sounds odd, but a correctly-sized costume you can exchange beats a correctly-chosen
costume that arrives after opening night. We cover return shipping on the first size
exchange for exactly this reason.</p>

<p>See <a href="/pages/costume-by-date">Costume by Date</a> for order-by dates.</p>

<h2>Practical notes from the stage side</h2>

<ul>
  <li><strong>Size up.</strong> A loose costume reads fine from the audience. A tight one
  splits at a seam during a dress rehearsal.</li>
  <li><strong>Check the layers.</strong> Ask whether your child wears a base layer under
  the costume, which changes the size you need.</li>
  <li><strong>Costumes are not flame-resistant.</strong> Relevant if the production uses
  any pyrotechnic or open-flame effect. Tell the director.</li>
  <li><strong>Label everything.</strong> Backstage, twelve Munchkin hats are
  indistinguishable.</li>
  <li><strong>Try it on immediately.</strong> Not the week of the show. An exchange takes
  time you won't have.</li>
</ul>

<h2>Ordering for a whole production</h2>

<p>If you're the parent volunteer or teacher buying multiple sizes of the same costume,
email <a href="mailto:phil@ivorycrowncollective.com">phil@ivorycrowncollective.com</a> with
your performance date and what you need. We'll confirm timing and quote you before you
commit — group orders are exactly the case where a delivery estimate needs to be a promise
rather than a range.</p>
`,
  },

  {
    handle: "christmas-pageant-costume-checklist",
    title: "The Christmas Pageant Costume Checklist",
    summary:
      "Every role in a nativity or Christmas pageant, what it needs, and when to order. Written for the parent volunteer who inherited the costume cupboard.",
    tags: ["christmas pageant", "nativity", "costume guide"],
    seoTitle: "Christmas Pageant & Nativity Costume Checklist by Role",
    seoDescription:
      "Every nativity and Christmas pageant role, what each costume needs, quantities to plan for, and order-by dates for a December performance.",
    body: `
<p>Christmas pageants are organized on a compressed timeline by volunteers, usually in
November, usually by someone who inherited a cupboard of costumes in unknown sizes. This
is the checklist.</p>

<h2>The nativity, role by role</h2>

<p><strong>Mary.</strong> Blue robe or dress with a white or cream head covering. The most
recognizable costume in the pageant and the easiest to get right.</p>

<p><strong>Joseph.</strong> Brown or earth-toned robe, a simple belt or rope tie, and a
head covering. Often carries a staff.</p>

<p><strong>Shepherds.</strong> Plan for <strong>three to six</strong>. Brown, beige, or
striped robes with a headscarf and rope belt, plus a crook if the director wants one.
Shepherd costumes are the workhorse of any pageant: they're also what you reach for when a
child arrives without a costume ten minutes before curtain, so buy one or two spares.</p>

<p><strong>Angels.</strong> Plan for <strong>four to twelve.</strong> White or cream robes,
wings, and a halo. Usually the youngest children, so prioritize simplicity — one-piece
robes, wings that attach securely and don't need adjusting mid-scene.</p>

<p><strong>The three wise men.</strong> Rich colors — purple, deep red, gold — with crowns
and a gift prop. Often cast with older children, so check whether you need larger sizes
than the rest of the cast.</p>

<p><strong>The innkeeper.</strong> Plain brown or grey robe with an apron. One line, one
costume, frequently forgotten until the week of.</p>

<p><strong>Animals.</strong> Sheep, donkey, ox, camels. Sheep are the most-needed and the
most forgiving — any white or cream fluffy costume works.</p>

${CTA("christmas-pageants", "Shop nativity & pageant costumes")}

<h2>Beyond the nativity</h2>

<p>Many programs pair the nativity with a secular half, which needs a different set:</p>

<ul>
  <li><strong>Choir robes</strong> — for the singing portion. Buy these in a coordinated
  color; mismatched robes are the most visible thing on a stage.</li>
  <li><strong>Reindeer</strong> — antlers and brown, for the lighter numbers.</li>
  <li><strong>Christmas trees, presents, snowflakes</strong> — usually the youngest classes.</li>
  <li><strong>Nutcracker roles</strong> if the program includes dance — soldiers, mice, a
  sugar plum fairy.</li>
</ul>

<h2>Quantities to plan for</h2>

<table>
  <thead><tr><th>Role</th><th>Typical count</th><th>Note</th></tr></thead>
  <tbody>
    <tr><td>Mary and Joseph</td><td>1 each</td><td>Sometimes double-cast across two performances</td></tr>
    <tr><td>Shepherds</td><td>3–6</td><td>Buy 1–2 spares as emergency costumes</td></tr>
    <tr><td>Angels</td><td>4–12</td><td>Usually the largest group</td></tr>
    <tr><td>Wise men</td><td>3</td><td>Often older children, check sizes</td></tr>
    <tr><td>Animals</td><td>2–8</td><td>Sheep most common</td></tr>
    <tr><td>Innkeeper</td><td>1</td><td>Routinely forgotten</td></tr>
  </tbody>
</table>

<h2>Timing</h2>

<p>Pageants are typically mid-December. Standard shipping is 8–18 business days, and
December carriers are slower than the rest of the year.</p>

<p><strong>Order by early November.</strong> If it's already December, use expedited and
email us your performance date first — we'd rather tell you it won't make it than take the
order.</p>

<p>Full order-by dates: <a href="/pages/costume-by-date">Costume by Date</a>.</p>

<h2>Notes for whoever is running this</h2>

<ul>
  <li><strong>Size up, especially for December.</strong> Pageant costumes go over winter
  clothing. A child in a shirt, sweater, and tights needs the next size.</li>
  <li><strong>Count heads before you order, then add two.</strong> Attendance grows in the
  final week, every year.</li>
  <li><strong>Costumes are not flame-resistant.</strong> If there are candles anywhere in
  the service — and there usually are — keep costumed children well clear.</li>
  <li><strong>Watch cords and long hems on small children.</strong> Angel robes on
  three-year-olds and steps are a bad combination. Hem them short.</li>
  <li><strong>Label everything with the child's name</strong>, not the role.</li>
  <li><strong>Photograph the finished costumes.</strong> Whoever inherits the cupboard next
  year will thank you.</li>
</ul>

<h2>Group orders</h2>

<p>Buying eight angels and four shepherds is exactly what we'd rather help with directly.
Email <a href="mailto:phil@ivorycrowncollective.com">phil@ivorycrowncollective.com</a> with
your performance date and rough sizes and we'll confirm availability and timing before you
commit.</p>
`,
  },
];

export default ARTICLES;
