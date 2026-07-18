"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { SidebarProvider } from "./_components/SidebarContext";
import { ToastProvider } from "./_components/Toast";
import { AdminShell } from "./_components/AdminShell";
import { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ProtectedRoute>
      <ToastProvider>
        <SidebarProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
            <AdminShell>{children}</AdminShell>
          </div>
        </SidebarProvider>
      </ToastProvider>
    </ProtectedRoute>
  );
}
