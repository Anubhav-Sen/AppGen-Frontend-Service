import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

type Props = {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
    const accessToken = useAuthStore((s) => s.accessToken);
    const location = useLocation();

    if (!accessToken) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <>{children}</>;
}

