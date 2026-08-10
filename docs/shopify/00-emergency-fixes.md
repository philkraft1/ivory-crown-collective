# Emergency storefront fixes

Complete these in Shopify Admin before advertising or sending customers to the
store.

## 1. Replace “My Store”

Go to **Settings > Store details > Store name** and set:

```text
Ivory Crown Collective
```

Then go to **Online Store > Preferences**:

```text
Homepage title:
Children's Storybook & Stage Costumes | Ivory Crown Collective

Meta description:
Shop children's costumes for school plays, book character day, recitals,
pageants, and Halloween. Clear sizing and family-ready service from Ivory Crown
Collective.
```

Verify the browser title, footer copyright, social preview, and Organization
structured data no longer say “My Store.”

## 2. Remove harmful and misleading option values

In **Products**, search variants for each value below. Rename the option itself
when it is not actually a color; do not merely leave the value under `Color`.

| Live value | Required action |
| --- | --- |
| `Black girl` | Remove immediately. Replace only with a factual garment color if the supplier data proves one. |
| `Complete Set` | Move to an option named `Set` or `Package`. |
| `Set includes wig and glasses` | Move to `Set` or `Package`. |
| `Including socks` | Move to `Set` or `Package`. |
| `Adult` / `Children` / `Kids` | Move to `Age group`. |
| `Britney` | Identify what this means from supplier data; rename factually or remove. |

Run `npm run shopify:audit` after API setup. Its
`warnings.problematicOptions` section returns the exact products still affected.

## 3. Fix the shipping-policy placeholder

Go to **Settings > Policies > Shipping policy** and replace:

```text
please contact us at [your support email]
```

with:

```text
please contact us at phil@ivorycrowncollective.com
```

Also verify that the promised 1–3 business-day processing time and 7–15
business-day delivery window match eProlo's actual service for every retained
product. A published promise must not be shorter than the supplier SLA.

## 4. Unpublish products with no images

Set these products to **Draft** until verified images are attached:

- Long sleeved lapel dress
- Style summer short sleeve T-shirt wide-leg pants casual elegant women's set
- Boy's Greek Zeus Costume Halloween Party Role Play Costume
- Halloween Costume Shepherd Sleeveless Long Robe Shawl Ancient Parent-Child
  Beige Blue Clothing

The prune script will archive zero-image products when applied.

## 5. Remove the empty collection

`Men's Clothing` is published with zero products. In **Products >
Collections > Men's Clothing**, set availability to unpublished or delete it.

## 6. Complete legal policies

In **Settings > Policies**:

- Generate and review **Terms of service**.
- Add **Contact information** with the legal business name, customer-service
  email, mailing address, and phone number appropriate for publication.
- Keep Privacy, Shipping, Refund, and Terms links visible in the footer.

Do not publish generated legal copy without reviewing it for the actual entity,
supplier arrangement, jurisdictions, and payment practices.

## 7. Align returns with long delivery times

Change the return request window from 14 to **30 days after delivery**. Keep
“unworn, unwashed, original condition, tags attached,” but add:

```text
To start a return, email phil@ivorycrowncollective.com with your order number
and the item(s) you wish to return. Do not send an item back until return
instructions are provided.
```

Also state who pays return shipping for:

- Customer preference or incorrect size.
- Damaged, defective, or incorrect item.

The store should pay for the second category. Avoid a promise of free returns
for preference returns unless the business has budgeted for international
supplier fulfillment.

## 8. Verify checkout operations

Before launch, place one real test order and verify:

- Tax calculation and US shipping zones.
- Actual shipping rate and delivery estimate.
- Order confirmation and tracking email.
- Support reply path.
- Refund workflow.
- Mobile Shop Pay or accelerated checkout.

Cancel/refund the test using the same process a customer would experience.
