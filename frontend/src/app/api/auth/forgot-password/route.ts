// src/app/api/auth/forgot-password/route.ts
// Password reset is handled by Spring Boot backend
// This route is disabled for v1 - use Spring Boot endpoints instead
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Redirect to Spring Boot backend for forgot password
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  
  try {
    const body = await req.json();
    const response = await fetch(`${API_URL}/api/v1/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Password reset service unavailable. Please contact support.' },
      { status: 503 }
    );
  }
}
