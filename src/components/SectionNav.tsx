"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/todos", label: "To Dos" },
  { href: "/calendar", label: "Calendar" },
  { href: "/food-prep", label: "Food Prep" },
];

export default function SectionNav() {
  const pathname = usePathname();

  return (
    <nav className="quick-nav">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`nav-link${pathname === link.href ? " active" : ""}`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
