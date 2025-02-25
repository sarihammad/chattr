import { BackgroundPaths } from '@/components/ui/background-paths';
import { FeaturesSectionWithHoverEffects } from '@/components/blocks/feature-section-with-hover-effects';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <div className="relative">
            <BackgroundPaths />
            <div className="relative z-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center">
                  <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
                    Welcome to Chattr
                  </h1>
                  <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                    Connect with people around the world in real-time. Start
                    meaningful conversations and make new friends.
                  </p>
                  <div className="mt-10 flex items-center justify-center gap-x-6">
                    <a
                      href="/auth/signin"
                      className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      Get Started
                    </a>
                    <a
                      href="/about"
                      className="text-sm font-semibold leading-6 text-gray-900 dark:text-white"
                    >
                      Learn more <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <FeaturesSectionWithHoverEffects />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="relative">
          <BackgroundPaths />
          <div className="relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
                  Welcome back, {session.user?.name}
                </h1>
                <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                  Ready to start chatting? Click below to find your next
                  conversation partner.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <a
                    href="/chat"
                    className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Start Chatting
                  </a>
                  <a
                    href="/profile"
                    className="text-sm font-semibold leading-6 text-gray-900 dark:text-white"
                  >
                    View Profile <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <FeaturesSectionWithHoverEffects />
        </div>
      </main>
    </div>
  );
}
