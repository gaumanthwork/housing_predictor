"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [{ href: "/", label: "Overview" }, { href: "/estimator", label: "Estimator" }, { href: "/market", label: "Market analysis" }];

export function Navigation() {
  const pathname = usePathname();
  return <nav aria-label="Primary navigation">{links.map(link => <Link key={link.href} aria-current={pathname === link.href ? "page" : undefined} className={pathname === link.href ? "active" : ""} href={link.href}>{link.label}</Link>)}</nav>;
}
