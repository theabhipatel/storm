import Link from "next/link";

export default function CategoryNotFound() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-neutral-900">Category not found</h1>
      <p className="mt-2 text-sm text-neutral-600">
        We couldn&apos;t find that category. Try browsing from the home page.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
      >
        Go home
      </Link>
    </main>
  );
}
