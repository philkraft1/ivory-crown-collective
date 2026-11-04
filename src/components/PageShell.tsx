export function PageShell({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <main className="px-5 py-14 sm:px-8 sm:py-20">
      <div className={`mx-auto ${wide ? "max-w-6xl" : "max-w-3xl"}`}>{children}</div>
    </main>
  );
}
