'use client';

import React from 'react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About MyApp</h1>
        <p className="text-lg text-gray-700 mb-8">
          MyApp is your smart productivity companion — built to help you focus, follow through, and finish what matters. Powered by AI and guided by behavioral psychology, MyApp transforms your big goals into clear, daily actions.
        </p>

        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Our Mission</h2>
            <p className="text-gray-600">
              We believe consistency is more powerful than intensity. MyApp helps people avoid burnout by focusing on clarity, structure, and real-life adaptability. Whether you're a student, founder, or lifelong learner — we’re here to help you make steady progress toward the things that matter most.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">What Makes MyApp Different?</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>AI-generated step-by-step plans from your big goals</li>
              <li>Adaptive scheduling that adjusts to your real life</li>
              <li>Visual progress tracking and completion streaks</li>
              <li>Recurring tasks for habits and long-term goals</li>
              <li>Daily agendas that keep you focused without overwhelm</li>
              <li>Designed for simplicity, not distractions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Who It's For</h2>
            <p className="text-gray-600">
              MyApp is built for driven people who want to do meaningful work — without the stress of micromanaging every hour. If you’re a creator launching a product, a student preparing for exams, or just someone trying to build better habits, MyApp was made for you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Meet the Creator</h2>
            <p className="text-gray-600">
              MyApp was founded by <strong>Sari Hammad</strong>, a developer and designer with a passion for minimal tools and meaningful productivity. Tired of cluttered to-do lists and generic planning apps, he built MyApp as a smarter, calmer way to make progress every day.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
