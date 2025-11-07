import { Link } from "react-router-dom";

export function Navbar() {
    return (
        <nav className="flex items-center justify-between bg-blue-600 text-white px-6 py-3">
            <h1 className="text-x1 font-bold">AppGen</h1>
            <div className="space-x-4">
                <Link to="/">Home</Link>
                <Link to="/schemas">Schemas</Link>
                <Link to="/logout">Logout</Link>
            </div>
        </nav>
    );
}