import Link from "next/link"
import { Shield, MapPin, Users, Heart, GitBranch, MessageSquare, User } from "lucide-react"
import { cn } from "@/lib/utils"

const footerLinks = {
  product: [
    { name: "Report Issue", href: "/report" },
    { name: "Community Map", href: "/map" },
    { name: "My Reports", href: "/dashboard" },
    { name: "Analytics", href: "/analytics" },
  ],
  community: [
    { name: "How It Works", href: "/how-it-works" },
    { name: "Guidelines", href: "/guidelines" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact Us", href: "/contact" },
  ],
  authority: [
    { name: "Authority Dashboard", href: "/authority" },
    { name: "API Documentation", href: "/api-docs" },
    { name: "Data Export", href: "/data-export" },
    { name: "Partnerships", href: "/partnerships" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "Accessibility", href: "/accessibility" },
  ],
}

const socialLinks = [
  { name: "GitHub", href: "https://github.com", icon: GitBranch },
  { name: "Twitter", href: "https://twitter.com", icon: MessageSquare },
  { name: "LinkedIn", href: "https://linkedin.com", icon: User },
]

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white" role="contentinfo">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2" aria-label="Community Hero Home">
              <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">Community Hero</span>
            </Link>
            <p className="text-gray-600 max-w-xs">
              Empowering citizens to report and track civic issues, building better communities through transparency and collaboration.
            </p>
            <div className="flex items-center gap-6">
              {socialLinks.map(social => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Product links">
            <h3 className="font-semibold text-gray-900">Product</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.product.map(link => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Community links">
            <h3 className="font-semibold text-gray-900">Community</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.community.map(link => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Authority links">
            <h3 className="font-semibold text-gray-900">For Authorities</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.authority.map(link => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal links">
            <h3 className="font-semibold text-gray-900">Legal</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map(link => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-200 pt-8 lg:flex-row">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Community Hero. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-red-500" />
              Built for communities
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Hyperlocal civic engagement
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Powered by citizens
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}