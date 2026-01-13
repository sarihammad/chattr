'use client';

import Link from 'next/link';

const faqs = [
  {
    question: 'What is Chattr?',
    answer:
      'Chattr is anti-swipe matchmaking for people who want something real. We match based on values, lifestyle, and compatibility—not just looks. You receive 1–3 carefully selected introductions per day, so you can focus on quality connections.',
  },
  {
    question: 'How does matching work?',
    answer:
      'We use a compatibility scoring system based on your questionnaire answers, shared values, and lifestyle preferences. Each day, you receive 1–3 introductions with explanations of why we think you might connect. When you both accept, a conversation opens.',
  },
  {
    question: 'Why only 1–3 introductions per day?',
    answer:
      'We cap introductions so you can give each one the attention it deserves. No swiping. No noise. Just a few great matches that actually matter.',
  },
  {
    question: 'What if I don\'t like my introductions?',
    answer:
      'You can pass on any introduction. We respect your preferences and won\'t show you the same person again for at least 7 days. If you\'re not finding good matches, try updating your questionnaire answers.',
  },
  {
    question: 'Can I pause matching?',
    answer:
      'Yes. You can pause matching anytime from your settings. When paused, you won\'t receive new introductions, but you can still chat with existing matches.',
  },
  {
    question: 'How many conversations can I have at once?',
    answer:
      'We cap active conversations to help you focus. This ensures quality over quantity and prevents overwhelm.',
  },
  {
    question: 'Is my data safe?',
    answer:
      'Yes. We use industry-standard security practices and never share your information. You can delete your account anytime from settings.',
  },
  {
    question: 'Can I block or report users?',
    answer:
      'Yes. You can block users instantly, and report anyone for inappropriate behavior. All reports are reviewed by our moderation team.',
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-600 mb-10">
          Everything you need to know about Chattr. Can&apos;t find what you&apos;re
          looking for?{' '}
          <Link
            href="/contact"
            className="text-rose-600 hover:text-rose-700 font-medium"
          >
            Contact us
          </Link>
          .
        </p>

        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-gray-50 border border-gray-200 p-6 rounded-xl"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {faq.question}
              </h3>
              <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
