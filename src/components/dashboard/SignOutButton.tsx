"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cerrarSesion } from "@/lib/actions/auth";

export default function SignOutButton() {
  return (
    <form action={cerrarSesion}>
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        className="text-gray-400 hover:text-white gap-2"
      >
        <LogOut className="w-4 h-4" />
        Cerrar sesión
      </Button>
    </form>
  );
}
