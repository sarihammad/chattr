'use client';

import React from 'react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Chattr</h1>
        <p className="text-lg text-gray-700 mb-8 leading-relaxed">
          Chattr is anti-swipe matchmaking for people who want something real.
          We match based on values, lifestyle, and compatibility—not just looks.
          Fewer matches. Better matches.
        </p>

        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Our Mission
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We believe meaningful connections come from intentional matching, not endless swiping.
              Chattr uses values-based compatibility scoring to connect you with people who share
              your lifestyle and goals. We cap matches so you can actually focus on each connection.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              What Makes Chattr Different?
            </h2>
            <ul className="list-none text-gray-600 space-y-4">
              <li className="flex items-start space-x-3">
                <span className="text-rose-500 font-bold">•</span>
                <div>
                  <strong className="text-gray-900">Anti-swipe approach:</strong> No infinite browsing.
                  You receive 1–3 carefully selected introductions per day, each with explanations
                  of why we think you might connect.
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-rose-500 font-bold">•</span>
                <div>
                  <strong className="text-gray-900">Values-based matching:</strong> We match based on
                  your questionnaire answers, shared values, and lifestyle preferences—not just
                  surface-level interests.
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-rose-500 font-bold">•</span>
                <div>
                  <strong className="text-gray-900">Slower pace:</strong> Limited daily opportunities
                  mean you can give each introduction the attention it deserves.
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-rose-500 font-bold">•</span>
                <div>
                  <strong className="text-gray-900">Fewer chats:</strong> We cap active conversations
                  to help you focus. Quality over quantity.
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-rose-500 font-bold">•</span>
                <div>
                  <strong className="text-gray-900">Trust & safety:</strong> Report and block features,
                  plus basic moderation to keep conversations respectful.
                </div>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              How It Works
            </h2>
            <ol className="list-none text-gray-600 space-y-4">
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-semibold">1</span>
                <div>
                  <strong className="text-gray-900">Complete your profile:</strong> Share your values,
                  lifestyle, and what you&apos;re looking for through our questionnaire and prompts.
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-semibold">2</span>
                <div>
                  <strong className="text-gray-900">Receive daily introductions:</strong> Each day,
                  you&apos;ll get 1–3 carefully selected introductions with compatibility scores and
                  explanations of why we think you might connect.
                </div>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-semibold">3</span>
                <div>
                  <strong className="text-gray-900">Connect intentionally:</strong> Review each
                  introduction thoughtfully. When you both accept, start a meaningful conversation.
                </div>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Built for People Who Want Something Real
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Chattr is designed for people who are tired of swiping and want meaningful connections.
              We cap matches, enforce conversation limits, and focus on compatibility over quantity.
              If you&apos;re looking for something real, you&apos;re in the right place.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
