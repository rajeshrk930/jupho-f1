"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  CreditCard,
  HelpCircle,
  LogOut,
  Moon,
  Settings,
  Sun,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", authOnly: true },
  { href: "/analyze", label: "Analyze", authOnly: true },
  { href: "/history", label: "History", authOnly: true },
];

type ThemeMode = "light" | "dark";

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const isAuthPage = ['/', '/login', '/signup'].includes(pathname);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("theme") : null;
    const preferred = saved === "dark" ? "dark" : "light";
    setTheme(preferred);
    document.documentElement.classList.toggle("theme-dark", preferred === "dark");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("theme-dark", theme === "dark");
    if (typeof window !== "undefined") {
      window.localStorage.setItem("theme", theme);
    }
  }, [theme]);

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
          <Link href="/" className="text-lg font-semibold text-gray-900">
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
          <button
            type="button"
            onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
            className="ghost-button hidden sm:inline-flex"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            <span className="hidden lg:inline text-sm font-medium">
              {theme === "dark" ? "Light" : "Dark"} mode
            </span>
          </button>

          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                className="profile-trigger"
              >
                <div className="text-left leading-tight">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                    {user?.proExpiresAt && new Date(user.proExpiresAt) > new Date() && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-600 text-white">
                        PRO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{emailLabel}</p>
                </div>
                <ChevronDown size={16} className="text-gray-500" />
              </button>

              {menuOpen && (
                <div className="dropdown-card" role="menu">
                  <div className="pb-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                    <p className="text-xs text-gray-500">{emailLabel}</p>
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
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
                    >
                      <Moon size={16} />
                      <span className="flex items-center justify-between w-full">
                        <span>Dark Mode</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          {theme === "dark" ? "ON" : "OFF"}
                        </span>
                      </span>
                    </button>
                    <Link href="/help" className="dropdown-item">
                      <HelpCircle size={16} />
                      <span>Help Center</span>
                    </Link>
                  </div>

                  <button
                    type="button"
                    className="dropdown-item text-red-600 hover:bg-red-50"
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                      router.push("/login");
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
              <Link href="/login" className="nav-link">Login</Link>
              <Link href="/signup" className="btn-primary py-2 px-4 text-sm">Get started</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
