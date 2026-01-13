// src/app/api/auth/register/route.ts
// Registration is handled by Spring Boot backend
// This route proxies to Spring Boot backend
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Proxy to Spring Boot backend for registration
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  
  try {
    const body = await request.json();
    const response = await fetch(`${API_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Registration failed:", error);
    return NextResponse.json(
      { error: 'Registration service unavailable. Please try again later.' },
      { status: 503 }
    );
  }
}
