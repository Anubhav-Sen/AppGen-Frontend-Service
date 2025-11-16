import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { UserProfile } from "./UserProfile";

export function Navbar() {
    const { user } = useAuthStore();

    return (
        <nav className="sticky top-0 z-50 flex items-center justify-between bg-white border-b border-secondary-300 px-6 py-4 shadow-md">
            <Link to="/" className="text-xl font-bold text-secondary-900 hover:text-primary-600 transition-colors">
                AppGen
            </Link>
            <div className="flex items-center space-x-6">
                {user ? (
                    <>
                        <Link to="/projects" className="text-secondary-700 hover:text-primary-600 transition-colors font-medium">
                            Projects
                        </Link>
                        <UserProfile />
                    </>
                ) : (
                    <>
                        <Link to="/" className="text-secondary-700 hover:text-primary-600 transition-colors font-medium">
                            Home
                        </Link>
                        <Link to="/login" className="text-secondary-700 hover:text-primary-600 transition-colors font-medium">
                            Login
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}