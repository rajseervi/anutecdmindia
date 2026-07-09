"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import AdminSidebar from "./_components/AdminSidebar";
import AdminTopBar from "./_components/AdminTopBar";
import { SidebarProvider, useSidebar } from "./_components/SidebarContext";
import { ToastProvider } from "./_components/Toast";
import { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

function AdminContent({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();
  return (
    <>
      <AdminSidebar />
      <AdminTopBar />
      {/* Only push content on desktop (lg+) when sidebar is visible */}
      <div className={`pt-16 transition-all duration-300 lg:ml-0 ${
        collapsed ? "lg:ml-[72px]" : "lg:ml-64"
      }`}>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ProtectedRoute>
      <ToastProvider>
        <SidebarProvider>
          <div className="min-h-screen bg-slate-50">
            <AdminContent>{children}</AdminContent>
          </div>
        </SidebarProvider>
      </ToastProvider>
    </ProtectedRoute>
  );
}
