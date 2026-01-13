'use client';

import Link from 'next/link';
import {
  Heart,
  MessageCircle,
  CheckCircle2,
  ArrowRight,
  Users,
  Clock,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useSession } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      router.replace('/introductions');
    }
  }, [session, router]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-7 w-7 text-rose-500" />
            <span className="text-2xl font-semibold text-gray-900">
              Chattr
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <Link
              href="/login"
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-rose-500 px-6 py-2.5 text-white font-medium hover:bg-rose-600 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 md:py-32">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h1 className="mb-6 text-5xl md:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
              Fewer matches.
              <br />
              <span className="text-rose-500">Better matches.</span>
            </h1>

            <p className="mb-12 text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
              Chattr is anti-swipe matchmaking for people who want something real.
              <br />
              <span className="text-gray-900 font-medium">
                No swiping. No noise. Just a few great introductions.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                href="/register"
                className="group rounded-lg bg-rose-500 px-8 py-4 text-lg font-medium text-white hover:bg-rose-600 transition-all flex items-center space-x-2 shadow-sm"
              >
                <span>Get today&apos;s introductions</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>No swiping</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>1–3 introductions per day</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Values-based matching</span>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="container mx-auto px-6 py-24 bg-gray-50">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to meaningful connections
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              {
                step: '1',
                title: 'Complete your profile',
                description:
                  'Share your values, lifestyle, and what you&apos;re looking for. The more authentic you are, the better your matches.',
                icon: Users,
              },
              {
                step: '2',
                title: 'Receive daily introductions',
                description:
                  'Each day, you&apos;ll receive 1–3 carefully selected introductions based on compatibility, not just looks.',
                icon: Heart,
              },
              {
                step: '3',
                title: 'Connect intentionally',
                description:
                  'Review each introduction thoughtfully. When you both accept, start a meaningful conversation.',
                icon: MessageCircle,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-100 text-rose-600 text-2xl font-semibold mb-6">
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-6 mx-auto">
                  <item.icon className="h-6 w-6 text-gray-700" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Why Anti-Swipe */}
        <section className="container mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Built for people who want something real
              </h2>
              <p className="text-xl text-gray-600">
                We cap matches so you can actually focus.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Slower pace
                    </h3>
                    <p className="text-gray-600">
                      Limited daily opportunities mean you can give each introduction the attention it deserves.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Deeper compatibility
                    </h3>
                    <p className="text-gray-600">
                      We match based on values, lifestyle, and shared goals—not just surface-level preferences.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Fewer chats
                    </h3>
                    <p className="text-gray-600">
                      We cap active conversations so you&apos;re not overwhelmed. Quality over quantity.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Trust & safety
                    </h3>
                    <p className="text-gray-600">
                      Report and block features, plus basic moderation to keep conversations respectful.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-6 py-24 bg-gray-50">
          <div className="rounded-2xl bg-white border border-gray-200 p-12 md:p-16 text-center max-w-3xl mx-auto shadow-sm">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ready to find something real?
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Join Chattr and receive your first introductions today.
              <br />
              <span className="font-medium text-gray-900">
                No swiping. No noise. Just meaningful connections.
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center rounded-lg bg-rose-500 px-10 py-4 text-lg font-medium text-white hover:bg-rose-600 transition-colors space-x-2"
              >
                <span>Get started</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-gray-100">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
          <div className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-rose-500" />
            <span className="text-lg font-semibold text-gray-900">
              Chattr
            </span>
            <span className="text-gray-400 text-sm ml-2">© 2024</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-gray-500 text-sm">
            <Link href="/about" className="hover:text-gray-900 transition-colors">
              About
            </Link>
            <Link href="/faq" className="hover:text-gray-900 transition-colors">
              FAQ
            </Link>
            <Link
              href="/contact"
              className="hover:text-gray-900 transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-400 text-sm">
          Fewer matches. Better matches.
        </div>
      </footer>
    </div>
  );
}
