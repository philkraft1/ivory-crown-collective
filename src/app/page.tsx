import { Suspense } from "react";
import { Landing } from "@/components/Landing";
import { StorePreview, StorePreviewSkeleton } from "@/components/StorePreview";

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  // Tailor the feed to the ad that referred the visitor. Ad platforms append
  // these params on click, so we can surface a relevant collection without any
  // per-user tracking.
  const collection =
    firstParam(params.collection) ??
    firstParam(params.utm_content) ??
    firstParam(params.utm_campaign);

  return (
    <>
      <Landing />
      <Suspense fallback={<StorePreviewSkeleton />}>
        <StorePreview collection={collection} />
      </Suspense>
    </>
  );
}
