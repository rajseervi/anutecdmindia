"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { ReactNode } from "react";
import { ToastProvider } from "@/app/admin/_components/Toast";
import { SidebarProvider } from "@/app/admin/_components/SidebarContext";
import { AdminShell } from "@/app/admin/_components/AdminShell";

interface InventoryLayoutProps {
  children: ReactNode;
}

export default function InventoryLayout({ children }: InventoryLayoutProps) {
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
