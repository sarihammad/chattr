"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setMessage(data.message || "Check your email for reset instructions.");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Forgot Password</h1>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          className="border p-2"
          placeholder="Enter your email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" className="p-2 bg-black text-white">
          Send Reset Link
        </button>
      </form>
      {message && <p className="text-green-600 mt-4">{message}</p>}
    </main>
  );
}
