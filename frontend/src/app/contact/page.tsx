

'use client';

import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Contact Us</h1>
        <p className="text-gray-600 mb-8">
          Got a question, feedback, or just want to say hi? We'd love to hear from you.
        </p>

        <form className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 text-gray-800 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Your Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 text-gray-800 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700">
              Your Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              className="mt-1 block w-full rounded-md border border-gray-300 px-4 py-2 text-gray-800 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
              required
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform transition duration-300 hover:scale-105 hover:shadow-xl"
            >
              Send Message
            </button>
          </div>
        </form>

        <div className="mt-10 text-sm text-gray-600">
          Or email us directly at{' '}
          <a href="mailto:support@myapp.io" className="text-red-600 font-medium hover:underline">
            support@myapp.io
          </a>
          .
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <Link href="/" className="text-red-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
