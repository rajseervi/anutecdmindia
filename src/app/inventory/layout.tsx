"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { ReactNode } from "react";
import { ToastProvider } from "@/app/admin/_components/Toast";
import { SidebarProvider, useSidebar } from "@/app/admin/_components/SidebarContext";
import AdminSidebar from "@/app/admin/_components/AdminSidebar";
import AdminTopBar from "@/app/admin/_components/AdminTopBar";

interface InventoryLayoutProps {
  children: ReactNode;
}

function InventoryContent({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();
  return (
    <>
      <AdminSidebar />
      <AdminTopBar />
      <div className={`pt-16 transition-all duration-300 ${collapsed ? "ml-[72px]" : "ml-64"}`}>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </>
  );
}

export default function InventoryLayout({ children }: InventoryLayoutProps) {
  return (
    <ProtectedRoute>
      <ToastProvider>
        <SidebarProvider>
          <div className="min-h-screen bg-slate-50">
            <InventoryContent>{children}</InventoryContent>
          </div>
        </SidebarProvider>
      </ToastProvider>
    </ProtectedRoute>
  );
}
