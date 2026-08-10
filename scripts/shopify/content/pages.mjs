/**
 * Canonical content for the store's static pages. 12-pages.mjs pushes these to
 * Shopify; they live here so the copy is version-controlled and reviewable in a
 * diff rather than only existing inside the admin.
 *
 * The store currently has one page (a bare Contact form with no address, email,
 * or response time) and no About, FAQ, or sizing help at all.
 */

export const SIZE_GUIDE_HTML = `
<p>Costume sizing is not clothing sizing. Costumes run small, they are cut for one
season of wear, and the supplier measures the flat garment rather than the child.
Measure once and you will get this right the first time.</p>

<h2>The two measurements that matter</h2>
<ol>
  <li><strong>Chest.</strong> Measure around the fullest part of the chest, under the
  arms, keeping the tape level and snug but not tight.</li>
  <li><strong>Height.</strong> Measure barefoot, heels against a wall, from the floor
  to the top of the head.</li>
</ol>
<p>Chest decides the size. Height confirms it. If the two disagree, go with chest and
size up.</p>

<h2>US kids size chart</h2>
<table>
  <thead>
    <tr><th>Our size</th><th>Age</th><th>Chest</th><th>Height</th></tr>
  </thead>
  <tbody>
    <tr><td>2-3T</td><td>2-3 years</td><td>21-22 in</td><td>36-39 in</td></tr>
    <tr><td>4-5</td><td>4-5 years</td><td>23-24 in</td><td>41-43 in</td></tr>
    <tr><td>6-7</td><td>6-7 years</td><td>25-26 in</td><td>46-48 in</td></tr>
    <tr><td>8-10</td><td>8-10 years</td><td>27-29 in</td><td>50-55 in</td></tr>
    <tr><td>11-12</td><td>11-12 years</td><td>30-32 in</td><td>57-60 in</td></tr>
    <tr><td>13-14</td><td>13-14 years</td><td>33-34 in</td><td>62-65 in</td></tr>
  </tbody>
</table>
<p>Every product page carries that specific costume's own chart in both inches and
centimetres. Where they differ, trust the product page.</p>

<h2>When to size up</h2>
<ul>
  <li><strong>Between two sizes.</strong> Always size up. A slightly loose costume
  still reads correctly from the audience; a tight one restricts movement and can
  split at a seam mid-performance.</li>
  <li><strong>Layers underneath.</strong> Winter pageants usually mean a shirt and
  tights under the costume. Size up.</li>
  <li><strong>Months between ordering and the event.</strong> Children grow. If the
  performance is more than two months out, size up.</li>
  <li><strong>Full-length gowns and robes.</strong> Hems can be pinned. Shoulders
  cannot be let out.</li>
</ul>

<h2>Still unsure?</h2>
<p>Email <a href="mailto:phil@ivorycrowncollective.com">phil@ivorycrowncollective.com</a>
with your child's chest measurement and height in inches and the costume you are
looking at, and we will tell you which size to order. We answer within one business
day. Include your event date if it is close.</p>

<p>If the size turns out wrong, we cover return shipping on your first size exchange
for any order. See our <a href="/policies/refund-policy">return policy</a>.</p>
`;

export const COSTUME_BY_DATE_HTML = `
<p>A costume that arrives the day after the performance is worthless. Here is exactly
how far ahead to order, and what to do if you have left it late.</p>

<h2>How long delivery takes</h2>
<table>
  <thead>
    <tr><th>Method</th><th>Processing</th><th>Transit</th><th>Total</th></tr>
  </thead>
  <tbody>
    <tr><td>Standard</td><td>1-3 business days</td><td>7-15 business days</td><td>8-18 business days</td></tr>
    <tr><td>Expedited</td><td>1-3 business days</td><td>3-7 business days</td><td>4-10 business days</td></tr>
  </tbody>
</table>
<p>Business days exclude weekends and US federal holidays, so 18 business days is
closer to four calendar weeks. Plan against calendar weeks, not business days.</p>

<h2>Order-by guidance</h2>
<ul>
  <li><strong>5 weeks out or more.</strong> Standard shipping, no stress. Best option,
  and it leaves room to exchange a size.</li>
  <li><strong>3 to 4 weeks out.</strong> Standard shipping will usually make it, but
  there is no buffer for a size swap. Consider expedited.</li>
  <li><strong>2 to 3 weeks out.</strong> Expedited only.</li>
  <li><strong>Under 2 weeks.</strong> Email us before you order. We will tell you
  honestly whether it can land in time rather than take the order and hope.</li>
</ul>

<h2>Cutoff dates by occasion</h2>
<table>
  <thead>
    <tr><th>Occasion</th><th>Typically falls</th><th>Order by (standard)</th></tr>
  </thead>
  <tbody>
    <tr><td>Read Across America / Book Character Day</td><td>Early March</td><td>Late January</td></tr>
    <tr><td>World Read Aloud Day</td><td>Early February</td><td>Late December</td></tr>
    <tr><td>Spring musical</td><td>April to May</td><td>Early March</td></tr>
    <tr><td>Dance recital</td><td>May to June</td><td>Early April</td></tr>
    <tr><td>Halloween</td><td>31 October</td><td>Late September</td></tr>
    <tr><td>Christmas pageant / nativity</td><td>Mid-December</td><td>Early November</td></tr>
  </tbody>
</table>
<p>School productions rarely give four weeks' notice, so if your child is in drama club
it is worth ordering the size before you know the part.</p>

<h2>Tell us your date</h2>
<p>Put your event date in the order notes at checkout. We flag those orders, and if we
do not believe it will arrive in time we contact you <em>before</em> charging you.</p>

<p>If you gave us a date in writing and the costume arrives after it, we refund you in
full including shipping, whether or not you keep it. See our
<a href="/policies/refund-policy">return policy</a>.</p>
`;

export const FAQ_HTML = `
<h2>Sizing</h2>
<h3>What size should I order?</h3>
<p>Go by your child's chest measurement, not their usual clothing size. Costume sizing
runs small. Our <a href="/pages/size-guide">Size Guide</a> shows how to measure, and
every product page has that costume's own chart in inches and centimetres.</p>

<h3>My child is between sizes.</h3>
<p>Size up, every time. A slightly loose costume reads fine from the audience. A tight
one restricts movement and can split at a seam during a performance.</p>

<h3>The size was wrong. Can I exchange it?</h3>
<p>Yes, within 30 days of delivery, and we cover return shipping on your first size
exchange for any order. Children's sizing is genuinely hard to get right from a chart
and we would rather you get the right fit.</p>

<h2>Shipping</h2>
<h3>How long will it take?</h3>
<p>Standard is 8-18 business days door to door including processing; expedited is 4-10.
See <a href="/pages/costume-by-date">Costume by Date</a> for order-by dates.</p>

<h3>Do you ship outside the United States?</h3>
<p>Not yet. We ship within the US only.</p>

<h3>Is shipping free?</h3>
<p>Standard shipping is free on orders over $75.</p>

<h3>I need it faster than that.</h3>
<p>Email <a href="mailto:phil@ivorycrowncollective.com">phil@ivorycrowncollective.com</a>
with your event date before ordering. We will give you a straight answer about whether
it can make it.</p>

<h2>The costumes</h2>
<h3>Are these officially licensed character costumes?</h3>
<p>No. They are generic character-inspired designs, not licensed by or affiliated with
any studio or publisher. We name characters descriptively so you can find a costume for
a role. In practice this is what school productions use, since licensed merchandise is
rarely cut for stage use.</p>

<h3>Are they flame-resistant?</h3>
<p>No, unless a product page says otherwise. Keep children away from open flames,
candles, and stage pyrotechnics while in costume.</p>

<h3>Can my child sleep in one?</h3>
<p>No. These do not meet children's sleepwear flammability standards.</p>

<h3>How do I wash it?</h3>
<p>Cold hand wash, hang dry, no tumble dryer. These are stage garments with trims and
appliques that a machine cycle will destroy.</p>

<h3>Will it hold up for more than one performance?</h3>
<p>Yes for a normal run of shows and rehearsals. They are not built for daily wear.</p>

<h2>Orders</h2>
<h3>Can I cancel or change my order?</h3>
<p>Any time before it ships, usually a 1-3 business day window. Email us straight away.</p>

<h3>Something arrived damaged or wrong.</h3>
<p>Email us within 7 days of delivery with a photo. We replace it or refund you in full,
your choice, and you do not need to ship the damaged item back.</p>

<h3>Do you take school or group orders?</h3>
<p>Yes. If you need multiple sizes of the same costume for a production, email us and we
will quote you and confirm timing before you commit. Tell us your performance date.</p>

<h3>Who are you?</h3>
<p>Ivory Crown Collective LLC, a New Jersey company. This store is our retail division.
See <a href="/pages/about">About us</a>.</p>
`;

export const ABOUT_HTML = `
<h2>Costumes for the performance, not the party aisle</h2>

<p>Most children's costumes are made to be worn once, photographed, and thrown away.
That is fine for a Halloween party. It is not fine when your child has four rehearsals
and two performances, and the costume needs to survive all six and read clearly from
the back row of a school auditorium.</p>

<p>That is the gap we work in. Our catalog is built around what schools, drama clubs,
church programs, and dance studios actually stage: the Wizard of Oz companions, Alice's
Wonderland, Sherlock Holmes, Robin Hood, Red Riding Hood and the wolf, the Little Match
Girl, nativity shepherds, choir robes, and the dozen animal parts every elementary
production needs.</p>

<h2>What we do differently</h2>
<ul>
  <li><strong>Sizing in inches, by measurement.</strong> Every product page gives chest
  and height in US inches, not a translated centimetre table. Costume sizing runs small
  and we say so.</li>
  <li><strong>Free first size exchange.</strong> Getting a child's size right from a
  chart is hard. If it is wrong, we cover return shipping on the first swap.</li>
  <li><strong>Honest dates.</strong> If you tell us your performance date and we do not
  think the costume will arrive in time, we contact you before charging you. See
  <a href="/pages/costume-by-date">Costume by Date</a>.</li>
  <li><strong>We say what a costume is not.</strong> Not flame-resistant, not sleepwear,
  not licensed merchandise. You should not have to email us to learn that.</li>
</ul>

<h2>Who we are</h2>
<p>Ivory Crown Collective LLC is a New Jersey company founded by Philip S. Kraft. This
store is our retail division. Our design, entertainment, and IT practice is at
<a href="https://ivorycrowncollective.com">ivorycrowncollective.com</a>.</p>

<p>We are small, which means when you email us a sizing question, you are emailing the
person who can actually answer it.</p>

<h2>Talk to us</h2>
<p>
  <strong>Email:</strong> <a href="mailto:phil@ivorycrowncollective.com">phil@ivorycrowncollective.com</a><br>
  <strong>Phone:</strong> (732) 233-8516<br>
  <strong>Hours:</strong> Monday to Friday, 9:00 AM to 6:00 PM Eastern
</p>
<p>We reply within one business day. If your event is within two weeks, put "URGENT" and
your date in the subject line.</p>
`;

export const PAGES = [
  {
    handle: "size-guide",
    title: "Size Guide",
    body: SIZE_GUIDE_HTML,
    seoTitle: "Kids' Costume Size Guide | How to Measure",
    seoDescription:
      "How to measure your child for a costume, with a US kids size chart in inches. Costume sizing runs small; here is how to get it right.",
  },
  {
    handle: "costume-by-date",
    title: "Costume by Date",
    body: COSTUME_BY_DATE_HTML,
    seoTitle: "When to Order a Costume | Delivery Dates by Occasion",
    seoDescription:
      "Order-by dates for school plays, Book Character Day, Christmas pageants, recitals, and Halloween, with realistic delivery windows.",
  },
  {
    handle: "faq",
    title: "FAQ",
    body: FAQ_HTML,
    seoTitle: "FAQ | Sizing, Shipping & Returns",
    seoDescription:
      "Answers on costume sizing, delivery times, exchanges, care, safety, and school group orders.",
  },
  {
    handle: "about",
    title: "About Us",
    body: ABOUT_HTML,
    seoTitle: "About Ivory Crown Collective",
    seoDescription:
      "Children's costumes built for school plays, pageants, and recitals rather than the party aisle. A New Jersey company.",
  },
];

export default PAGES;
