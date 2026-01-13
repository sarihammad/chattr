// NextAuth route disabled - using Spring Boot JWT authentication
// Keeping minimal handler to prevent build errors

export async function GET() {
  return new Response(JSON.stringify({ error: "NextAuth disabled - use Spring Boot auth" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST() {
  return new Response(JSON.stringify({ error: "NextAuth disabled - use Spring Boot auth" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}
