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
      <div
        className={`pt-16 transition-all duration-300 ease-in-out ml-0 ${
          collapsed ? "lg:ml-[72px]" : "lg:ml-64"
        }`}
      >
        <main className="p-3 sm:p-5 lg:p-8 animate-page-enter">
          {children}
        </main>
      </div>
    </>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ProtectedRoute>
      <ToastProvider>
        <SidebarProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
            <AdminContent>{children}</AdminContent>
          </div>
        </SidebarProvider>
      </ToastProvider>
    </ProtectedRoute>
  );
}
