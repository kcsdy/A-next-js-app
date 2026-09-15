import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { services, getService } from "@/content/services";

type Props = { params: Promise<{ slug: string }> };

/** Pre-renders every service page at build time. */
export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

// In Next 16 `params` is a Promise and must be awaited.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};

  return {
    title: service.title,
    description: service.summary,
    alternates: { canonical: `/uslugi/${service.slug}` },
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  return (
    <article className="mx-auto max-w-3xl px-5 pt-14 pb-4">
      <Link
        href="/#uslugi"
        className="text-sm text-burgundy underline-offset-4 hover:underline"
      >
        Wróć do zakresu pomocy
      </Link>

      <h1 className="mt-6 text-title sm:text-display">{service.title}</h1>
      <p className="mt-6 text-lede leading-relaxed text-muted">
        {service.intro}
      </p>

      <section className="mt-14">
        <h2 className="text-xl">Dla kogo</h2>
        <ul className="mt-4 space-y-2">
          {service.who.map((item) => (
            <li key={item} className="border-l-2 border-beige pl-4 text-ink">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-xl">Potrzebne dokumenty</h2>
        <p className="mt-2 text-sm text-muted">
          Lista orientacyjna — zakres dokumentów zależy od podstawy wniosku.
        </p>
        <ul className="mt-4 space-y-2">
          {service.documents.map((item) => (
            <li key={item} className="border-l-2 border-beige pl-4 text-ink">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-xl">Co robimy</h2>
        <ul className="mt-4 space-y-2">
          {service.help.map((item) => (
            <li key={item} className="border-l-2 border-burgundy pl-4 text-ink">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <aside className="mt-16 bg-beige-pale p-8">
        <h2 className="text-xl">Umów konsultację</h2>
        <p className="mt-3 leading-relaxed text-muted">
          Napisz, na jakim etapie jest twoja sprawa. Wskaż{" "}
          {service.title.toLowerCase()} w formularzu, a odezwiemy się z
          informacją, jakich dokumentów brakuje.
        </p>
        <Link
          href={`/kontakt?sprawa=${service.slug}`}
          className="mt-6 inline-block bg-burgundy px-6 py-3 text-white hover:bg-burgundy-deep"
        >
          Przejdź do formularza
        </Link>
      </aside>
    </article>
  );
}
