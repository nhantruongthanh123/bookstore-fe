import Link from "next/link";

const footerLinks = [
  { label: "About", href: "/" },
  { label: "Book Catalog", href: "/books" },
  { label: "Orders", href: "/orders" },
  { label: "Support", href: "/" },
];

export function HomeFooter() {
  return (
    <footer className="border-t border-[#d9d7d1] px-4 py-5 md:px-8">
      <div className="flex flex-col items-start justify-between gap-4 text-sm text-[#656775] md:flex-row md:items-center">
        <p className="text-xs uppercase tracking-[0.15em] text-[#8a8d98]">
          The Curator Bookstore
        </p>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="transition-colors hover:text-[#2e3547]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
