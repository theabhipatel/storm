import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold text-text">Product not found</h1>
      <p className="mt-2 text-sm text-text-muted">
        It may have been moved or archived.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary-hover"
      >
        Back to home
      </Link>
    </main>
  );
}
