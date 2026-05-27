"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  function handleSignOut() {
    window.location.href = "/api/signout";
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      className="text-gray-400 hover:text-white gap-2"
    >
      <LogOut className="w-4 h-4" />
      Cerrar sesión
    </Button>
  );
}
