// Middleware disabled - using Spring Boot JWT authentication instead
// Keeping file for future use if needed

export function middleware() {
  // No-op - authentication handled by Spring Boot backend
}

export const config = {
  matcher: [
    // Disabled for now - routes protected by backend
    // "/dashboard/:path*",
    // "/settings/:path*",
  ],
};
