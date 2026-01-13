'use client';

// SocialAuth disabled - using Spring Boot JWT authentication
// Google OAuth can be implemented later if needed

export default function SocialAuth() {
  // Social auth disabled for v1
  return null;
  
  // Future implementation:
  // const handleGoogleSignIn = async () => {
  //   // Call Spring Boot backend OAuth endpoint
  //   window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/oauth2/google`;
  // };
}
