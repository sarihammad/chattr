'use client';

import React, { useState } from 'react';

export default function FeedbackPage() {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message }),
      });

      if (!res.ok) {
        throw new Error('Something went wrong');
      }

      setSuccess('Thanks for your feedback!');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'Failed to send feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">We’d love your feedback</h1>
        <p className="text-gray-600 mb-8">Let us know what you think, what could be better, or if you've run into issues.</p>

        {success && <div className="mb-4 text-green-700 bg-green-100 p-3 rounded-md">{success}</div>}
        {error && <div className="mb-4 text-red-700 bg-red-100 p-3 rounded-md">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Your Email (optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-sm text-gray-800"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Feedback</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              required
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 text-sm text-gray-800"
              placeholder="What's on your mind?"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50 transform transition duration-300 hover:scale-105 hover:shadow-xl"
            >
              {loading ? 'Sending...' : 'Send Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
