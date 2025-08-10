"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/resident/create", label: "Create Pitch" },
    { href: "/invest", label: "Browse Listings" },
    { href: "/resident/dashboard", label: "My Dashboard" },
    { href: "/legal", label: "Legal" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="container-app py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600">
          🏡 HomeDAQ
        </Link>
        <div className="space-x-4 text-sm sm:text-base">
          {navItems.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`nav-link ${active ? "nav-link-active" : ""}`}
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
