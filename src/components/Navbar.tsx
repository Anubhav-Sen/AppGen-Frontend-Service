import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

export function Navbar() {
    const navigate = useNavigate();
    const { user, clearAuth } = useAuthStore();

    const handleLogout = () => {
        clearAuth();
        navigate("/login");
    };

    return (
        <nav className="flex items-center justify-between bg-white border-b border-secondary-200 px-6 py-4 shadow-sm">
            <Link to="/" className="text-xl font-bold text-secondary-900 hover:text-primary-600 transition-colors">
                AppGen
            </Link>
            <div className="flex items-center space-x-6">
                <Link to="/" className="text-secondary-700 hover:text-primary-600 transition-colors font-medium">
                    Home
                </Link>
                {user ? (
                    <>
                        <Link to="/projects" className="text-secondary-700 hover:text-primary-600 transition-colors font-medium">
                            Projects
                        </Link>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-secondary-600">
                                {user.email}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="text-secondary-700 hover:text-red-600 transition-colors font-medium"
                            >
                                Logout
                            </button>
                        </div>
                    </>
                ) : (
                    <Link to="/login" className="text-secondary-700 hover:text-primary-600 transition-colors font-medium">
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
}