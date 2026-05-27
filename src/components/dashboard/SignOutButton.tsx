"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SignOutButton() {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-gray-400 hover:text-white gap-2"
    >
      <LogOut className="w-4 h-4" />
      Cerrar sesión
    </Button>
  );
}
