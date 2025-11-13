import { RouterProvider, createBrowserRouter, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/auth/LoginPage";
import Flows from "@/pages/Flows";
import SchemaBuilder from "@/pages/SchemaBuilder";

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
      { path: "/flows", element: <Flows /> },
      { path: "/builder", element: <SchemaBuilder /> },
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
