import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-28">
      <h1 className="text-title">Nie ma takiej strony</h1>
      <p className="mt-4 leading-relaxed text-muted">
        Adres jest nieaktualny albo zawiera literówkę. Zakres spraw, które
        prowadzimy, jest na stronie głównej.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block bg-burgundy px-6 py-3 text-white hover:bg-burgundy-deep"
      >
        Wróć na stronę główną
      </Link>
    </div>
  );
}
