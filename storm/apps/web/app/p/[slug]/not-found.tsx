import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold text-neutral-900">Product not found</h1>
      <p className="mt-2 text-sm text-neutral-600">
        It may have been moved or archived.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
      >
        Back to home
      </Link>
    </main>
  );
}
