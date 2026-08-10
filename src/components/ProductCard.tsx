import Image from "next/image";
import { isAllowedProductUrl } from "@/lib/security/schemas";
import type { StoreProduct } from "@/lib/shopify";

function Monogram({ title }: { title: string }) {
  const initials = title
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_30%_20%,rgba(245,215,106,0.22),transparent_60%),linear-gradient(150deg,#0a0a0a_0%,#161206_55%,#0a0a0a_100%)]">
      <span className="animate-shimmer bg-[linear-gradient(105deg,#c9a227_0%,#f5d76a_45%,#fff3ad_50%,#f5d76a_55%,#c9a227_100%)] bg-clip-text font-[family-name:var(--font-cinzel)] text-4xl font-bold tracking-[0.15em] text-transparent">
        {initials}
      </span>
    </div>
  );
}

export function ProductCard({
  product,
  index,
}: {
  product: StoreProduct;
  index: number;
}) {
  const isLink = Boolean(product.url && isAllowedProductUrl(product.url));
  const delayClass = [
    "animate-rise",
    "animate-rise-delay-1",
    "animate-rise-delay-2",
    "animate-rise-delay-3",
  ][index % 4];

  const inner = (
    <>
      <div className="relative aspect-square w-full overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.imageAlt}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 260px"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
          />
        ) : (
          <Monogram title={product.title} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-1 px-4 py-3.5">
        <p className="line-clamp-1 font-[family-name:var(--font-cinzel)] text-sm font-semibold text-pearl">
          {product.title}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gold-hot">
            {product.priceLabel}
          </span>
          <span className="text-[0.6rem] uppercase tracking-[0.22em] text-pearl/45 transition-colors group-hover:text-gold-bright">
            View
          </span>
        </div>
      </div>
    </>
  );

  const className =
    "group animate-border-glow relative flex h-full flex-col overflow-hidden rounded-xl border border-gold/15 bg-void-soft/70 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1";

  if (isLink) {
    return (
      <a
        href={product.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${delayClass} ${className}`}
      >
        {inner}
      </a>
    );
  }

  return <div className={`${delayClass} ${className}`}>{inner}</div>;
}
