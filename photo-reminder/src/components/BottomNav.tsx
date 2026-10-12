"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Image as ImageIcon, MessageSquareHeart } from "lucide-react";
import { useSession } from "next-auth/react";

export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) return null; // Don't show if not logged in

  const tabs = [
    { name: "Upload", href: "/", icon: Camera },
    { name: "Galeria", href: "/gallery", icon: ImageIcon },
    { name: "Recados", href: "/messages", icon: MessageSquareHeart },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-100 pb-safe z-40">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-wedding-gold" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? "fill-wedding-gold/20" : ""}`} />
              <span className="text-[10px] font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
