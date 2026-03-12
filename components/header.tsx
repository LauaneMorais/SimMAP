"use client";

import Image from "next/image";
import { Users } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12">
            <Image
              src="/logo.png"
              alt="LAWD Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              SimMAP
            </span>
            <span className="text-sm uppercase text-muted-foreground">
              Liga Acadêmica de Desenvolvimento Web
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-base font-medium text-primary">
            Mapeamento de Perfis
          </span>
        </div>
      </div>
    </header>
  );
}
