import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-5xl font-bold text-red-600">404 - Page Not Found</h1>
      <p className="mt-4 text-lg text-gray-600">
        Sorry, we couldn&rsquo;t find the page you&rsquo;re looking for.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded"
      >
        Go Home
      </Link>
    </main>
  );
}
