"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import Button from "@/components/ui/Button";
import {
  ChevronDown,
  FilePlus2,
  LayoutDashboard,
  SlidersHorizontal,
  Search,
  BookOpen,
  LineChart,
  Scale,
  type LucideIcon,
} from "lucide-react";

type Item = { href: string; label: string; note?: string; icon: LucideIcon };
type Group = { id: string; label: string; items: Item[] };

const GROUPS: Group[] = [
  {
    id: "residents",
    label: "Residents",
    items: [
      { href: "/resident/create", label: "Create Pitch", icon: FilePlus2 },
      { href: "/resident/dashboard", label: "My Dashboard", icon: LayoutDashboard },
      { href: "/resident/offer-designer", label: "Offer Designer", note: "new", icon: SlidersHorizontal },
    ],
  },
  {
    id: "investors",
    label: "Investors",
    items: [
      { href: "/invest", label: "Browse Listings", icon: Search },
      { href: "/investors", label: "Investor Guide", icon: BookOpen },
    ],
  },
  {
    id: "resources",
    label: "Resources",
    items: [
      { href: "/tools/market", label: "Market Snapshot", icon: LineChart },
      { href: "/legal", label: "Legal", icon: Scale },
    ],
  },
];

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [scrollPct, setScrollPct] = React.useState(0);
  const closeTimer = React.useRef<number | null>(null);

  const mobileSheetRef = React.useRef<HTMLDivElement | null>(null);
  useFocusTrap(mobileOpen, mobileSheetRef);

  React.useEffect(() => {
    setOpen(null);
    setMobileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = Math.max(1, h.scrollHeight - h.clientHeight);
      setScrollPct(Math.min(100, Math.max(0, (h.scrollTop / max) * 100)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function isGroupActive(g: Group) {
    return g.items.some((it) => pathname === it.href || pathname.startsWith(it.href + "/"));
  }

  const cancelClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setOpen(null), 120);
  };

  return (
    <nav
      className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-ink-100"
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(null);
      }}
    >
      <div className="relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="text-xl font-bold text-brand-600">
            🏡 HomeDAQ
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {GROUPS.map((g) => (
              <DesktopGroup
                key={g.id}
                group={g}
                open={open}
                setOpen={setOpen}
                isActive={isGroupActive(g)}
                cancelClose={cancelClose}
                scheduleClose={scheduleClose}
              />
            ))}

            {/* CTA */}
            <Link href="/resident/create">
              <Button>Start a Pitch</Button>
            </Link>
          </div>

          {/* Mobile toggler */}
          <button
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-ink-200 text-ink-700"
            onClick={() => setMobileOpen((s) => !s)}
            aria-label="Open menu"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Scroll progress underline */}
        <div
          className="absolute bottom-0 left-0 h-[2px] bg-brand-500 transition-[width] duration-150"
          style={{ width: `${scrollPct}%` }}
          aria-hidden
        />
      </div>

      {/* Mobile sheet */}
      {mobileOpen && (
        <div
          ref={mobileSheetRef}
          role="dialog"
          aria-modal="true"
          className="md:hidden border-t border-ink-100 bg-white"
        >
          <div className="max-w-6xl mx-auto px-4 py-4 space-y-6">
            {GROUPS.map((g) => (
              <div key={g.id}>
                <div className="text-xs uppercase tracking-wide text-ink-500 mb-2">{g.label}</div>
                <div className="rounded-2xl border border-ink-100 overflow-hidden">
                  {g.items.map((it, idx) => (
                    <Link
                      key={it.href}
                      href={it.href}
                      className={[
                        "flex items-center px-4 py-3 text-ink-800 focus:outline-none focus:ring-2 focus:ring-brand-500",
                        idx !== g.items.length - 1 ? "border-b border-ink-100" : "",
                        pathname === it.href ? "bg-ink-50" : "hover:bg-ink-50",
                      ].join(" ")}
                      onClick={() => setMobileOpen(false)}
                    >
                      <it.icon className="mr-3 h-4 w-4 text-ink-500" aria-hidden />
                      <span className="flex-1">{it.label}</span>
                      {it.note && (
                        <span className="ml-2 text-[10px] rounded-full bg-brand-50 text-brand-700 px-2 py-0.5 border border-brand-100">
                          {it.note}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-2">
              <Link href="/resident/create" className="block">
                <Button className="w-full">Start a Pitch</Button>
              </Link>
            </div>

            {/* Hidden sentinel for focus wrap */}
            <button className="sr-only" aria-hidden tabIndex={0} />
          </div>
        </div>
      )}
    </nav>
  );
}

/* ===== Desktop dropdown group ===== */

function DesktopGroup({
  group,
  open,
  setOpen,
  isActive,
  cancelClose,
  scheduleClose,
}: {
  group: Group;
  open: string | null;
  setOpen: (id: string | null) => void;
  isActive: boolean;
  cancelClose: () => void;
  scheduleClose: () => void;
}) {
  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);
  const active = open === group.id;

  return (
    <div
      className="relative"
      onPointerEnter={() => {
        cancelClose();
        setOpen(group.id);
      }}
      onPointerLeave={(e) => {
        const next = e.relatedTarget as Node | null;
        if (next && (e.currentTarget as HTMLElement).contains(next)) return;
        scheduleClose();
      }}
    >
      <button
        ref={btnRef}
        className={[
          "px-3 py-1.5 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-1",
          isActive ? "bg-brand-50 text-brand-700" : "text-ink-700 hover:text-brand-700",
        ].join(" ")}
        aria-expanded={active}
        aria-haspopup="menu"
        onClick={() => setOpen(active ? null : group.id)}
        onFocus={() => {
          cancelClose();
          setOpen(group.id);
        }}
        onBlur={(e) => {
          const next = e.relatedTarget as Node | null;
          if (next && (e.currentTarget.parentElement?.contains(next) ?? false)) return;
          scheduleClose();
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(null);
          if ((e.key === "ArrowDown" || e.key === "Enter") && menuRef.current) {
            e.preventDefault();
            const first = menuRef.current.querySelector<HTMLElement>("a,button,[tabindex]:not([tabindex='-1'])");
            first?.focus();
          }
        }}
      >
        {group.label}
        <ChevronDown className="h-4 w-4" aria-hidden />
      </button>

      {active && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute left-0 mt-1 w-64 rounded-2xl border border-ink-100 bg-white shadow-lg p-2"
          onPointerEnter={cancelClose}
          onPointerLeave={scheduleClose}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(null);
              btnRef.current?.focus();
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              btnRef.current?.focus();
            }
          }}
        >
          {group.items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-ink-800 hover:bg-ink-50 focus:bg-ink-50 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <span className="inline-flex items-center">
                <it.icon className="mr-2 h-4 w-4 text-ink-500" aria-hidden />
                {it.label}
              </span>
              {it.note && (
                <span className="ml-2 text-[10px] rounded-full bg-brand-50 text-brand-700 px-2 py-0.5 border border-brand-100">
                  {it.note}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ===== Focus trap hook for the mobile sheet ===== */
function useFocusTrap(enabled: boolean, ref: React.RefObject<HTMLElement | null>) {
  React.useEffect(() => {
    if (!enabled || !ref.current) return;

    const root = ref.current;
    const focusables = () =>
      Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null);

    // focus first element on open
    const first = focusables()[0];
    first?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const toggle = document.querySelector<HTMLButtonElement>("nav button.md\\:hidden");
        toggle?.click();
        return;
      }
      if (e.key !== "Tab") return;
      const els = focusables();
      if (els.length === 0) return;

      const current = document.activeElement as HTMLElement | null;
      const idx = Math.max(0, els.indexOf(current || els[0]));
      const nextIdx = e.shiftKey ? (idx - 1 + els.length) % els.length : (idx + 1) % els.length;
      els[nextIdx].focus();
      e.preventDefault();
    };

    root.addEventListener("keydown", onKeyDown);
    return () => root.removeEventListener("keydown", onKeyDown);
  }, [enabled, ref]);
}
