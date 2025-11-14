import { useNavigate } from "react-router";
import { useAuthStore } from "@/stores/authStore";

export default function HomePage() {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);

    const handleGetStarted = () => {
        if (user) {
            navigate("/projects");
        } else {
            navigate("/login");
        }
    };

    return (
        <div className="min-h-screen bg-secondary-50">
            <div className="max-w-5xl mx-auto px-6 py-12">
                <h1 className="text-4xl font-bold text-secondary-900 mb-3">Welcome to AppGen Frontend</h1>
                <p className="text-lg text-secondary-600 mb-8">
                    Schema creation UI powered by React Flow
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg border border-secondary-200 p-6 shadow-sm hover:shadow-md transition">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-secondary-900 mb-2">Schema Management</h3>
                        <p className="text-sm text-secondary-600">Create and manage your database schemas with ease.</p>
                    </div>

                    <div className="bg-white rounded-lg border border-secondary-200 p-6 shadow-sm hover:shadow-md transition">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-secondary-900 mb-2">Rapid Development</h3>
                        <p className="text-sm text-secondary-600">Generate code and APIs automatically from your schemas.</p>
                    </div>

                    <div className="bg-white rounded-lg border border-secondary-200 p-6 shadow-sm hover:shadow-md transition">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-secondary-900 mb-2">Type Safe</h3>
                        <p className="text-sm text-secondary-600">Built with TypeScript for maximum type safety.</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-secondary-200 p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-secondary-900 mb-4">Getting Started</h2>
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">1</span>
                            <p className="text-secondary-700">Define your data models and relationships</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">2</span>
                            <p className="text-secondary-700">Generate backend code and API endpoints</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">3</span>
                            <p className="text-secondary-700">Deploy and start building your application</p>
                        </div>
                    </div>
                    <button
                        onClick={handleGetStarted}
                        className="mt-6 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-primary-glow transition focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                    >
                        Get Started
                    </button>
                </div>
            </div>
        </div>
    );
};