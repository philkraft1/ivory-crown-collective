import { getStorePreview } from "@/lib/shopify";
import { ProductCard } from "@/components/ProductCard";

function humanizeCampaign(collection: string): string {
  return collection
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function StorePreview({
  collection,
}: {
  collection: string | null;
}) {
  const { products, storeUrl, isMock } = await getStorePreview(collection);

  return (
    <section
      id="shop"
      aria-labelledby="shop-heading"
      className="relative z-10 border-t border-gold/10 bg-void px-5 py-16 sm:px-8 sm:py-20"
    >
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center text-center">
          {collection ? (
            <span className="animate-rise mb-3 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3.5 py-1 text-[0.6rem] uppercase tracking-[0.24em] text-gold-hot">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-hot" />
              Picked for {humanizeCampaign(collection)}
            </span>
          ) : (
            <span className="animate-rise mb-3 text-[0.6rem] uppercase tracking-[0.28em] text-pearl/45">
              From the shop
            </span>
          )}

          <h2
            id="shop-heading"
            className="animate-rise-delay-1 font-[family-name:var(--font-cinzel)] text-2xl font-semibold text-pearl sm:text-3xl"
          >
            Shop the Collective
          </h2>

          <p className="animate-rise-delay-2 mt-2 max-w-md text-sm text-pearl/55">
            A live look at what&apos;s on the shelves. Explore the full lineup
            in our Shopify store.
          </p>
        </div>

        <div className="mt-9 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-3">
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full px-8 py-3.5 font-[family-name:var(--font-cinzel)] text-xs font-semibold uppercase tracking-[0.28em] text-ink"
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(105deg,#f6d45a_0%,#e8b923_40%,#fff1a0_50%,#e8b923_60%,#c9971a_100%)] transition-transform duration-500 group-hover:scale-[1.04]"
            />
            <span className="relative">Check out my Shopify store</span>
          </a>

          {isMock ? (
            <p className="text-[0.6rem] uppercase tracking-[0.22em] text-pearl/30">
              Preview placeholders · unlock Online Store + Storefront API to show live products
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function StorePreviewSkeleton() {
  return (
    <section className="relative z-10 border-t border-gold/10 bg-void px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mx-auto h-8 w-56 animate-pulse rounded bg-void-soft" />
        <div className="mt-9 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[3/4] animate-pulse rounded-xl border border-gold/10 bg-void-soft/70"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
