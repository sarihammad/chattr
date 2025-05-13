export default function Footer() {
    return (
        <footer className="py-20 border-t text-center text-sm text-gray-500 bg-gray-50">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-4">
                    <a href="/pricing" className="hover:text-red-600 transition">Pricing</a>
                    <a href="/faq" className="hover:text-red-600 transition">FAQ</a>
                    <a href="/about" className="hover:text-red-600 transition">About</a>
                    <a href="/contact" className="hover:text-red-600 transition">Contact</a>
                    <a href="/blog" className="hover:text-red-600 transition">Blog</a>
                    <a href="/feedback" className="hover:text-red-600 transition">Feedback</a>
                </div>
                <p>&copy; {new Date().getFullYear()} MyApp. All rights reserved.</p>
            </div>
        </footer>
    );
}
