import { ConnectButton } from "@/components/wallet/ConnectButton";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "How It Works", href: "/how-it-works" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Analytics", href: "/analytics" },
    { name: "Import", href: "/import" },
    { name: "Docs", href: "https://docs.netshift.app", external: true },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 h-18 border-b border-primary/20 bg-background/95 backdrop-blur-xl shadow-lg shadow-primary/5"
    >
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-primary flex items-center justify-center shadow-lg">
              <span className="text-xl font-black text-white">N</span>
            </div>
          </div>
          <span className="text-2xl font-bold gradient-text-cyan-blue transition-all group-hover:scale-105 relative">
            NetShift
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-secondary to-primary transition-all group-hover:w-full" />
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground/80 hover:text-foreground transition-all relative group px-3 py-2 rounded-lg hover:bg-primary/10"
              >
                {link.name}
                <span className="absolute -bottom-1 left-3 w-0 h-0.5 bg-gradient-to-r from-secondary to-primary transition-all group-hover:w-[calc(100%-1.5rem)]" />
              </a>
            ) : (
              <Link
                key={link.name}
                to={link.href}
                className="text-foreground/80 hover:text-foreground transition-all relative group px-3 py-2 rounded-lg hover:bg-primary/10"
              >
                {link.name}
                <span className="absolute -bottom-1 left-3 w-0 h-0.5 bg-gradient-to-r from-secondary to-primary transition-all group-hover:w-[calc(100%-1.5rem)]" />
              </Link>
            )
          )}
          <ConnectButton />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-white/10 bg-background-secondary/95 backdrop-blur-lg"
        >
          <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
            {navLinks.map((link) =>
              link.external ? (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/80 hover:text-foreground transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-foreground/80 hover:text-foreground transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              )
            )}
            <ConnectButton />
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
