import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import MobileNav from "@/components/MobileNav";
import AuthSync from "@/components/AuthSync";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AuthSync />
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-6 pb-24 md:pb-6 max-w-6xl mx-auto w-full">
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
