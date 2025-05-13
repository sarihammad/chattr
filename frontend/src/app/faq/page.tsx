'use client';

import Link from 'next/link';

const faqs = [
  {
    question: 'What is MyApp?',
    answer: 'MyApp is your AI-powered productivity companion. It helps you set goals, break them into achievable tasks, and stay consistent with smart scheduling and reminders.',
  },
  {
    question: 'How does the AI planner work?',
    answer: 'Once you set a goal, our AI breaks it down into milestones and recurring tasks, complete with frequency and estimated time. It’s like having a personal coach on demand.',
  },
  {
    question: 'Can I use MyApp for free?',
    answer: 'Yes! We offer a free tier with essential features. Upgrade anytime to unlock advanced AI planning, insights, and more.',
  },
  {
    question: 'What happens if I cancel my subscription?',
    answer: 'You’ll retain access until the end of your billing cycle. After that, you’ll be downgraded to the free tier, and all your data will remain safe.',
  },
  {
    question: 'How can I get support?',
    answer: 'You can reach out anytime via our contact page or email us at support@myapp.io. We’re always happy to help.',
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h1>
        <p className="text-gray-600 mb-10">
          Everything you need to know about MyApp. Can't find what you're looking for?{' '}
          <Link href="/contact" className="text-red-600 hover:text-red-700 font-medium">
            Contact us
          </Link>
          .
        </p>

        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-gray-50 border border-gray-200 p-5 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-sm text-gray-700">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
