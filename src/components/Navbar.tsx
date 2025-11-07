import { Link } from "react-router-dom";

export function Navbar() {
    return (
        <nav className="flex items-center justify-between bg-white border-b border-secondary-200 px-6 py-4 shadow-sm">
            <h1 className="text-xl font-bold text-secondary-900">AppGen</h1>
            <div className="flex items-center space-x-8">
                <Link to="/" className="text-secondary-700 hover:text-primary-600 transition-colors font-medium">Home</Link>
                <Link to="/schemas" className="text-secondary-700 hover:text-primary-600 transition-colors font-medium">Schemas</Link>
                <Link to="/logout" className="text-secondary-700 hover:text-primary-600 transition-colors font-medium">Logout</Link>
            </div>
        </nav>
    );
}