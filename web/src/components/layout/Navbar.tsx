import { ConnectButton } from "@/components/wallet/ConnectButton";
import { motion } from "framer-motion";
import { Menu, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: "How It Works", href: "/how-it-works" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "Analytics", href: "/analytics" },
    { name: "Import", href: "/import" },
    {
      name: "Docs",
      href: "https://github.com/Mr-Ben-dev/Netshift/blob/main/DOCUMENTATION.md",
      external: true,
    },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-white/10 bg-gradient-to-r from-background via-background/98 to-background backdrop-blur-2xl"
    >
      {/* Animated gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />

      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group relative">
            {/* Glow effect */}
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />

            {/* Logo image */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl blur-md opacity-60 group-hover:opacity-100 transition-opacity" />
              <img
                src="/logo.png"
                alt="NetShift"
                className="relative w-10 h-10 lg:w-11 lg:h-11 rounded-xl object-cover ring-2 ring-white/20 group-hover:ring-cyan-400/50 transition-all shadow-lg"
              />
            </motion.div>

            {/* Brand name */}
            <div className="flex flex-col">
              <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-purple-400 transition-all">
                NetShift
              </span>
              <span className="text-[10px] text-muted-foreground/60 font-medium tracking-wider hidden lg:block">
                MULTI-PARTY SETTLEMENTS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative px-3 lg:px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-all rounded-lg hover:bg-white/5 group"
                  >
                    <span className="relative z-10">{link.name}</span>
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all group-hover:w-3/4" />
                  </a>
                ) : (
                  <Link
                    to={link.href}
                    className={`relative px-3 lg:px-4 py-2 text-sm font-medium transition-all rounded-lg group ${
                      isActive(link.href)
                        ? "text-foreground bg-gradient-to-r from-cyan-500/10 to-purple-500/10"
                        : "text-foreground/70 hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    <span className="relative z-10">{link.name}</span>
                    {isActive(link.href) ? (
                      <motion.span
                        layoutId="navbar-indicator"
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                      />
                    ) : (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full transition-all group-hover:w-3/4" />
                    )}
                  </Link>
                )}
              </motion.div>
            ))}

            {/* Divider */}
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-2" />

            {/* Connect Button with glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-60 transition-opacity" />
              <div className="relative">
                <ConnectButton />
              </div>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="md:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={
          mobileMenuOpen
            ? { height: "auto", opacity: 1 }
            : { height: 0, opacity: 0 }
        }
        className="md:hidden overflow-hidden border-t border-white/10 bg-gradient-to-b from-background to-background/95 backdrop-blur-xl"
      >
        <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
          {navLinks.map((link, index) => (
            <motion.div
              key={link.name}
              initial={{ x: -20, opacity: 0 }}
              animate={
                mobileMenuOpen ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }
              }
              transition={{ delay: index * 0.05 }}
            >
              {link.external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/70 hover:text-foreground hover:bg-white/5 transition-all"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  {link.name}
                </a>
              ) : (
                <Link
                  to={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive(link.href)
                      ? "text-foreground bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-l-2 border-cyan-400"
                      : "text-foreground/70 hover:text-foreground hover:bg-white/5"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Sparkles
                    className={`w-4 h-4 ${
                      isActive(link.href)
                        ? "text-cyan-400"
                        : "text-muted-foreground"
                    }`}
                  />
                  {link.name}
                </Link>
              )}
            </motion.div>
          ))}

          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-2" />

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={
              mobileMenuOpen ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }
            }
            transition={{ delay: 0.3 }}
            className="px-4 py-2"
          >
            <ConnectButton />
          </motion.div>
        </div>
      </motion.div>
    </motion.nav>
  );
}
