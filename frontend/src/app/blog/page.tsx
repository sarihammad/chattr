import Link from 'next/link';

export default function BlogPage() {
  const posts = [
    {
      title: 'How to Set Achievable Goals with AI',
      slug: 'ai-goal-setting',
      excerpt: 'Learn how AI can break down your goals into manageable, actionable steps using productivity best practices.',
    },
    {
      title: 'Daily Planning Tips for Maximum Productivity',
      slug: 'daily-planning-tips',
      excerpt: 'Boost your focus and efficiency with our expert-backed daily planning strategies and scheduling habits.',
    },
    {
      title: 'Why Habits Matter More Than Motivation',
      slug: 'habits-vs-motivation',
      excerpt: 'Discover why building habits beats waiting for motivation, and how to create routines that stick.',
    },
  ];

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <div className="max-w-4xl mx-auto text-left">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Blog</h1>
        <p className="text-gray-600 mb-10">Insights, tips, and deep dives on productivity, habit building, and goal-setting.</p>
        <div className="space-y-8">
          {posts.map((post) => (
            <div key={post.slug} className="border border-gray-200 p-6 rounded-xl hover:shadow transition">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">{post.title}</h2>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <Link href='#' className="text-sm text-red-600 hover:underline font-medium">
                Read more
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
