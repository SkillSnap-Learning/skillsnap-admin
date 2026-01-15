"use client";

import { Header } from "@/components/layout/Header";

export default function UsersPage() {
  return (
    <div>
      <Header title="Users" description="Manage users" />
      <div className="p-6">
        <div className="bg-white rounded-xl border p-6">
          <p className="text-slate-500">Users list coming soon...</p>
        </div>
      </div>
    </div>
  );
}