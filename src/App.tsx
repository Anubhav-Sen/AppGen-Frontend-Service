import { RouterProvider, createBrowserRouter, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import PublicRoute from "@/components/PublicRoute";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ProjectsListPage from "@/pages/ProjectsListPage";
import SchemaBuilder from "@/pages/SchemaBuilder";
import ConfigPage from "@/pages/ConfigPage";
import ManageAccountPage from "@/pages/ManageAccountPage";

const queryClient = new QueryClient();

function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: (
          <PublicRoute>
            <HomePage />
          </PublicRoute>
        )
      },
      {
        path: "/login",
        element: (
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        )
      },
      {
        path: "/signup",
        element: (
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        )
      },
      {
        path: "/projects",
        element: (
          <ProtectedRoute>
            <ProjectsListPage />
          </ProtectedRoute>
        )
      },
      {
        path: "/config",
        element: (
          <ProtectedRoute>
            <ConfigPage />
          </ProtectedRoute>
        )
      },
      {
        path: "/builder",
        element: (
          <ProtectedRoute>
            <SchemaBuilder />
          </ProtectedRoute>
        )
      },
      {
        path: "/manage-account",
        element: (
          <ProtectedRoute>
            <ManageAccountPage />
          </ProtectedRoute>
        )
      },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
