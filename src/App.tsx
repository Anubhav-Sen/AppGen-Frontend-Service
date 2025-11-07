import SampleForm from "./components/SampleForm";
import { useUIStore } from "./stores/ui";

function App() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <div className="p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2x1 font-bold">AppGen Frontend</h1>
        <button className="border px-3 py-1 rounded" onClick={toggleSidebar}>
          {sidebarOpen ? "Hide" : "Show"} Sidebar
        </button>
      </header>

      <main className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="border rounded p-4">
          <h2 className="font-semibold mb-2">Form (RHF + Zod)</h2>
          <SampleForm />
        </section>
        <section className="border rounded p-4">
          <h2 className="font-semibold mb-2">Next: React Flow</h2>
          <p>Add a /flows route and render a simple node-edge diagram.</p>
        </section>
      </main>
    </div>
  );
}

export default App;
