export function ConstructionBanner() {
  return (
    <div
      role="status"
      className="w-full bg-[#ffe600] px-4 py-4 text-center text-ink sm:px-6 sm:py-5"
    >
      <p className="font-[family-name:var(--font-syne)] text-base font-extrabold uppercase leading-tight tracking-[0.02em] sm:text-xl md:text-2xl lg:text-3xl">
        SITE STILL UNDER CONSTRUCTION - ANY QUESTIONS CONTACT ME AT{" "}
        <a
          href="mailto:phil@ivorycrowncollective.com"
          className="underline decoration-2 underline-offset-4 hover:opacity-80"
        >
          phil@ivorycrowncollective.com
        </a>
      </p>
    </div>
  );
}
