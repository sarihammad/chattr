'use client';

import Link from 'next/link';
import { useSession, signOut } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    setMounted(true);
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (currentScrollY > lastScrollY && currentScrollY > 64) {
            setShowNavbar(false);
          } else if (currentScrollY < lastScrollY || currentScrollY < 64) {
            setShowNavbar(true);
          }
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        isOpen &&
        !target.closest('.mobile-menu') &&
        !target.closest('.hamburger-button')
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navBgClass = 'bg-white';
  const menuTextClass = 'text-gray-700';
  const hamburgerClass = 'bg-gray-700';

  if (!mounted || status === 'loading') return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNavbar && (
          <motion.nav
            initial={{ y: -64 }}
            animate={{ y: 0 }}
            exit={{ y: -64 }}
            transition={{ duration: 0.2 }}
            className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${navBgClass}`}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <Link href={session ? '/dashboard' : '/'} className="flex items-center">
                    MyApp
                  </Link>
                </div>

                <div className="hidden md:flex items-center space-x-4">
                  {session ? (
                    <>
                      <Link
                        href="/dashboard"
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${menuTextClass}`}
                      >
                        <svg
                          className="h-4 w-4 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m0 0H7m4 0h4" />
                        </svg>
                        Dashboard
                      </Link>
                      <Link
                        href="/settings"
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${menuTextClass}`}
                      >
                        <svg
                          className="h-4 w-4 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Settings
                      </Link>

                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transform transition duration-300 hover:scale-105 hover:shadow-xl"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className={`px-3 py-2 rounded-md text-sm font-medium ${menuTextClass}`}
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition transform hover:scale-105 hover:shadow-md"
                      >
                        Sign up
                      </Link>
                    </>
                  )}
                </div>

                <div className="md:hidden flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(!isOpen);
                    }}
                    className="hamburger-button p-2"
                  >
                    <div className="w-6 h-6 relative">
                      <motion.span
                        className={`absolute h-0.5 w-6 transform transition-all duration-300 ${hamburgerClass}`}
                        animate={{ rotate: isOpen ? 45 : 0, translateY: isOpen ? 8 : 0 }}
                        style={{ top: '4px' }}
                      />
                      <motion.span
                        className={`absolute h-0.5 w-6 transform transition-all duration-300 ${hamburgerClass}`}
                        animate={{ opacity: isOpen ? 0 : 1 }}
                        style={{ top: '12px' }}
                      />
                      <motion.span
                        className={`absolute h-0.5 w-6 transform transition-all duration-300 ${hamburgerClass}`}
                        animate={{ rotate: isOpen ? -45 : 0, translateY: isOpen ? -8 : 0 }}
                        style={{ top: '20px' }}
                      />
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mobile-menu absolute top-16 inset-x-0 bg-white z-50"
                >
                  <div className="py-4 px-6 space-y-3">
                    {session ? (
                      <>
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50"
                          onClick={() => setIsOpen(false)}
                        >
                          <svg
                            className="h-4 w-4 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m0 0H7m4 0h4" />
                          </svg>
                          Dashboard
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center gap-2 px-4 py-3 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50"
                          onClick={() => setIsOpen(false)}
                        >
                          <svg
                            className="h-4 w-4 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Settings
                        </Link>

                        <div className="pt-2">
                          <button
                            onClick={() => {
                              signOut({ callbackUrl: '/' });
                              setIsOpen(false);
                            }}
                            className="w-full inline-block px-6 py-3 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transform transition duration-300 hover:scale-105 hover:shadow-xl"
                          >
                            Sign Out
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col space-y-3">
                        <Link
                          href="/login"
                          className="px-4 py-3 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50"
                          onClick={() => setIsOpen(false)}
                        >
                          Login
                        </Link>
                        <Link
                          href="/register"
                          className="inline-block px-6 py-3 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700"
                          onClick={() => setIsOpen(false)}
                        >
                          Sign up
                        </Link>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
