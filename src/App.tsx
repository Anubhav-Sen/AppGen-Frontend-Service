import { RouterProvider, createBrowserRouter, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import ProjectsListPage from "@/pages/ProjectsListPage";
import SchemaBuilder from "@/pages/SchemaBuilder";
import ConfigPage from "@/pages/ConfigPage";

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
      { path: "/", element: <HomePage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <RegisterPage /> },
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
