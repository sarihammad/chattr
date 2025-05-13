"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = params.get("token");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setMessage(data.message || data.error);
  };

  if (!token) {
    return <p>Invalid reset link.</p>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Reset Password</h1>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          className="border p-2"
          placeholder="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="p-2 bg-black text-white">
          Reset Password
        </button>
      </form>
      {message && <p className="text-green-600 mt-4">{message}</p>}
    </main>
  );
}
