import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { useArclight } from "@/lib/arclight-store";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const authed = useArclight((s) => s.authed);
  // mock auth gate (client-side); if not authed, send to login.
  if (typeof window !== "undefined" && !authed) {
    throw redirect({ to: "/" });
  }
  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
