"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();
  const items = [
    { href: "/", label: "Home" },
    { href: "/resident/create", label: "Create Pitch" },
    { href: "/invest", label: "Browse Listings" },
    { href: "/resident/dashboard", label: "My Dashboard" },
    { href: "/legal", label: "Legal" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-blue-600">🏡 HomeDAQ</Link>
        <div className="hidden md:flex items-center gap-3">
          {items.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                  ${active ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:text-blue-600"}`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
