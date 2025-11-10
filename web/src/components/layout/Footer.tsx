import { Link } from 'react-router-dom'
import { Github, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-background-secondary/50 backdrop-blur-sm mt-24">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Tagline */}
          <div>
            <h3 className="text-xl font-bold gradient-text-cyan-blue mb-2">NetShift</h3>
            <p className="text-sm text-muted-foreground">
              Multi-party payment netting. Fewer transactions, lower fees.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/how-it-works" className="hover:text-foreground transition-colors">How It Works</Link></li>
              <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
              <li><a href="https://docs.netshift.app" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Documentation</a></li>
              <li><a href="https://github.com/netshift" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">API</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-4">Community</h4>
            <div className="flex gap-4">
              <a
                href="https://github.com/netshift"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com/netshift"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>Powered by</span>
            <a
              href="https://sideshift.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link hover:text-link-hover transition-colors"
            >
              SideShift
            </a>
          </div>
          <div className="flex gap-6">
            <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
          </div>
          <div className="text-xs">
            <span className="px-2 py-1 rounded glass-card">POL (Polygon)</span>
            <span className="ml-2">Simulation Mode in restricted regions</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
