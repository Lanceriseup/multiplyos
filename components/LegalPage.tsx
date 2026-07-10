import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Shared shell for legal pages (Terms, Privacy). Renders the standard site
// chrome around a centered, readable prose column.
export default function LegalPage({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <section className="relative overflow-hidden px-5 pb-24 pt-16 sm:px-8">
        <div className="bg-dotted pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-3xl">
          <header className="mb-12 border-b border-black/10 pb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-brand-ink sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-sm text-brand-gray">
              Last updated: {lastUpdated}
            </p>
          </header>
          <div className="legal-body space-y-8 text-[15px] leading-relaxed text-brand-charcoal">
            {children}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

// Small building blocks so page content stays declarative and consistent.
export function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-xl font-bold tracking-tight text-brand-ink">
        {heading}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-4 text-base font-semibold text-brand-ink">{children}</h3>
  );
}

export function List({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="ml-5 list-disc space-y-1.5 marker:text-brand-orange">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
