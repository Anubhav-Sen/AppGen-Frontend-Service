import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
    
    const { login } = useAuth();

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <button 
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={ () => login("demo", "password") }
            >
                Demo Login
            </button>
        </div>
    );
}