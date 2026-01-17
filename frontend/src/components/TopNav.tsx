"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  CreditCard,
  HelpCircle,
  LogOut,
  Settings,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", authOnly: true },
  { href: "/analyze", label: "Analyze", authOnly: true },
  { href: "/history", label: "History", authOnly: true },
];

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const isAuthPage = ['/', '/sign-in', '/sign-up'].includes(pathname);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const displayName = user?.name || user?.email?.split("@")[0] || "Guest";
  const emailLabel = user?.email || "Not signed in";

  if (isAuthPage) return null;

  return (
    <header className="nav-shell">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold text-text-primary">
            Jupho
          </Link>
          <nav className="hidden md:flex items-center gap-3">
            {navLinks
              .filter((link) => (link.authOnly ? isAuthenticated : true))
              .map((link) => {
                const active = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`nav-link ${active ? "nav-link-active" : ""}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
          </nav>
        </div>

        <div className="flex items-center gap-3">

          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="profile-trigger"
              >
                <div className="text-left leading-tight">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-text-primary">{displayName}</p>
                    {user?.proExpiresAt && new Date(user.proExpiresAt) > new Date() && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-sm bg-signal-primary text-base">
                        PRO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary">{emailLabel}</p>
                </div>
                <ChevronDown size={16} className="text-text-secondary" />
              </button>

              {menuOpen && (
                <div className="dropdown-card" role="menu">
                  <div className="pb-3 border-b border-border-default">
                    <p className="text-sm font-semibold text-text-primary">{displayName}</p>
                    <p className="text-xs text-text-secondary">{emailLabel}</p>
                  </div>

                  <div className="py-3 space-y-1">
                    <Link href="/billing" className="dropdown-item">
                      <CreditCard size={16} />
                      <span>Billing & Plans</span>
                    </Link>
                    <Link href="/settings" className="dropdown-item">
                      <Settings size={16} />
                      <span>Settings</span>
                    </Link>
                    <Link href="/help" className="dropdown-item">
                      <HelpCircle size={16} />
                      <span>Help Center</span>
                    </Link>
                  </div>

                  <button
                    type="button"
                    className="dropdown-item text-signal-danger hover:bg-signal-danger/10"
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                      router.push("/sign-in");
                    }}
                  >
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/sign-in" className="nav-link">Login</Link>
              <Link href="/signup" className="btn-primary py-2 px-4 text-sm">Get started</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
