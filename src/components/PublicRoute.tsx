import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

type Props = {
    children: ReactNode;
}

export default function PublicRoute({ children }: Props) {
    const accessToken = useAuthStore((s) => s.accessToken);

    if (accessToken) {
        return <Navigate to="/projects" replace />;
    }

    return <>{children}</>;
}
