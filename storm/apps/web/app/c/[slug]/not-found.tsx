import Link from "next/link";

export default function CategoryNotFound() {
  return (
    <main className="mx-auto max-w-page px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-text">Category not found</h1>
      <p className="mt-2 text-sm text-text-muted">
        We couldn&apos;t find that category. Try browsing from the home page.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover"
      >
        Go home
      </Link>
    </main>
  );
}
