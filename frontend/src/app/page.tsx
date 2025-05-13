'use client';

import Link from 'next/link';
import {
  SparklesIcon,
  ClockIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ChatBubbleBottomCenterIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/solid';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const features = [
  {
    title: 'Track Your Progress',
    description:
      'Visualize your journey with real-time analytics and see how far you’ve come.',
    icon: ChartBarIcon,
    color: 'text-blue-400',
  },
  {
    title: 'Smart Task Scheduling',
    description:
      'Automatically distribute your tasks throughout the week to optimize productivity.',
    icon: CalendarDaysIcon,
    color: 'text-yellow-400',
  },
  {
    title: 'Daily Focus List',
    description:
      'Get a clear list of priorities every day to stay focused and productive.',
    icon: ClockIcon,
    color: 'text-emerald-400',
  },
  {
    title: 'Achievements & Milestones',
    description:
      'Celebrate your wins and stay motivated with goal-based milestones.',
    icon: CheckCircleIcon,
    color: 'text-purple-400',
  },
  {
    title: 'Collaborative Planning',
    description:
      'Work together with friends, family, or colleagues to achieve bigger goals.',
    icon: ChatBubbleBottomCenterIcon,
    color: 'text-indigo-400',
  },
  {
    title: 'Minimalist, Motivating Design',
    description:
      'Focus on what matters with a clutter-free, engaging user interface.',
    icon: SparklesIcon,
    color: 'text-pink-400',
  },
];

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      router.replace('/dashboard');
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="mx-auto px-6 sm:px-8 lg:px-12 pt-40 text-center bg-gradient-to-b from-white via-neutral-50 to-white min-h-[calc(100vh-64px)]">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Organize. Focus. Achieve.
        </h1>
        <p className="text-lg text-gray-700 mb-8 md:px-32 lg:px-64">
          Simplify your life and boost your productivity. Plan your goals and watch your progress grow.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center px-6 py-3 text-white bg-red-600 hover:bg-red-700 rounded-xl font-medium text-lg shadow-lg transition duration-300 transform hover:scale-105 hover:shadow-xl"
        >
          Get Started Free
        </Link>
        <p className="text-sm text-gray-400 mt-2">No credit card required</p>
      </div>

      {/* App Preview Section */}
      <div
        className="py-20 w-full"
        style={{
          backgroundImage: "url('/assets/images/blue-white-gradient.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="px-6 sm:px-8 lg:px-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">See It In Action</h2>
          <p className="text-gray-700 mb-12">
            Watch how easy it is to set goals, schedule tasks, and stay consistent.
          </p>

          <div className="mb-16 mx-auto max-w-4xl rounded-xl overflow-hidden shadow-xl border border-gray-200 transform transition-transform duration-300 hover:scale-105">
            <video
              src="/assets/images/app-demo.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto object-cover"
            >
              Sorry, your browser does not support embedded videos.
            </video>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="w-full py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-gray-600 text-lg">
              Unlock your productivity potential with powerful, easy-to-use tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 shadow-md border border-gray-200 transform transition-transform duration-300 hover:scale-105"
              >
                <feature.icon className={`w-10 h-10 ${feature.color} mb-4`} />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div
        className="py-20 w-full"
        style={{
          backgroundImage: "url('/assets/images/blue-white-gradient.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="text-center px-6 sm:px-8 lg:px-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to take control of your goals?
          </h2>
          <p className="text-gray-700 text-lg mb-8">
            Join thousands of users boosting their productivity with our platform.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center px-8 py-3 text-lg font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg transform hover:scale-105 hover:shadow-xl transition-all duration-300"
          >
            Get Started Now
          </Link>
        </div>
      </div>
    </div>
  );
}
