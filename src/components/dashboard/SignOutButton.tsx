"use client";

import { LogOut } from "lucide-react";

export default function SignOutButton() {
  return (
    <a
      href="/api/signout"
      className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-white/5"
    >
      <LogOut className="w-4 h-4" />
      Cerrar sesión
    </a>
  );
}
