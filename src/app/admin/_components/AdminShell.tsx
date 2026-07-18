"use client";

import { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopBar from "./AdminTopBar";
import { useSidebar } from "./SidebarContext";

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const { collapsed } = useSidebar();

  return (
    <>
      <AdminSidebar />
      <AdminTopBar />
      <div
        className={`pt-14 sm:pt-16 transition-all duration-300 ease-in-out ml-0 ${
          collapsed ? "lg:ml-[72px]" : "lg:ml-64"
        }`}
      >
        <main className="p-3 sm:p-5 lg:p-8 animate-page-enter min-h-[calc(100dvh-4rem)]">
          {children}
        </main>
      </div>
    </>
  );
}
