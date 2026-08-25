import { SignalField } from "@/components/landing/signal-field"
import { LiveCounters } from "@/components/landing/live-counters"

const FEATURES = [
  {
    code: "RPT",
    title: "Easy Issue Reporting",
    description: "Report civic issues in seconds with photos, location, and AI-powered categorization.",
  },
  {
    code: "AI",
    title: "AI-Powered Classification",
    description: "Automatic issue categorization and severity assessment using computer vision and NLP.",
  },
  {
    code: "MAP",
    title: "Interactive Community Map",
    description: "Visualize all reported issues on a real-time map with clustering and filtering.",
  },
  {
    code: "NTF",
    title: "Real-time Notifications",
    description: "Get instant updates when your reports are verified, assigned, or resolved.",
  },
  {
    code: "CMN",
    title: "Community Engagement",
    description: "Upvote, comment, and follow issues to amplify community voice and accountability.",
  },
  {
    code: "ANL",
    title: "Analytics Dashboard",
    description: "Comprehensive insights for authorities with trends, hotspots, and performance metrics.",
  },
]

const STEPS = [
  { step: "01", title: "Spot an Issue", description: "See a pothole, broken streetlight, or other civic problem in your neighborhood." },
  { step: "02", title: "Report in Seconds", description: "Open the app, take a photo, add details, and submit. AI categorizes it automatically." },
  { step: "03", title: "Track Progress", description: "Follow your report through verification, assignment, and resolution with real-time updates." },
  { step: "04", title: "Community Impact", description: "Your reports help authorities prioritize and fix problems faster, improving your neighborhood." },
]

export default function HomePage() {
  return (
    <>
      <main className="min-h-screen bg-white text-black">
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
          <nav className="container mx-auto flex h-14 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <span className="inline-block h-8 w-8 rounded-lg bg-blue-600 shadow-sm" aria-hidden="true" />
              <span className="text-sm font-bold uppercase tracking-[0.18em]">Community&nbsp;Hero</span>
            </div>
            <div className="hidden items-center gap-7 md:flex">
              <a href="#features" className="label-caps text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-md px-1">Features</a>
              <a href="#how-it-works" className="label-caps text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-md px-1">How It Works</a>
              <a href="#stats" className="label-caps text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-md px-1">Signal</a>
              <a href="/login" className="label-caps text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-md px-1">Sign In</a>
              <a
                href="/register"
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                Get Started
              </a>
            </div>
          </nav>
        </header>

        <section className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-b from-blue-50 via-white to-white pt-14">
          <div className="absolute inset-0 opacity-[0.08]" aria-hidden="true">
            <SignalField seed={20260825} />
          </div>
          <div className="container relative mx-auto px-4 py-20 lg:py-28">
            <h1 className="max-w-5xl text-5xl font-bold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
              EVERY ISSUE<br />IS SIGNAL.
            </h1>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-black/70 sm:text-lg">
              Report, track, and resolve civic issues in your neighborhood. Every report becomes a public,
              timestamped signal the city must answer — visible on one shared map until it is resolved.
            </p>
            <div className="mt-10 flex flex-col gap-px rounded-xl border border-gray-300 bg-gray-300 shadow-sm overflow-hidden sm:flex-row">
              <a
                href="/register"
                className="flex-1 rounded-none bg-blue-600 px-8 py-4 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                Start Reporting →
              </a>
              <a
                href="#how-it-works"
                className="flex-1 bg-white px-8 py-4 text-center text-sm font-semibold text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
              >
                How It Works
              </a>
            </div>
            <div className="mt-12 max-w-xl">
              <LiveCounters />
            </div>
          </div>
        </section>

        <section id="features" className="border-b border-black py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 flex items-baseline justify-between border-b border-black pb-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">CAPABILITIES</h2>
              <span className="label-caps text-black/50">06 modules</span>
            </div>
            <ul className="divide-y divide-black/20 border-y border-black">
              {FEATURES.map((f) => (
                <li key={f.code} className="group grid grid-cols-[64px_1fr] gap-4 py-5 sm:grid-cols-[96px_320px_1fr] sm:items-baseline">
                  <span className="text-sm font-bold tabular-nums">{f.code}</span>
                  <h3 className="text-lg font-semibold group-hover:text-blue-700">{f.title}</h3>
                  <p className="col-span-2 mt-1 text-sm text-black/70 sm:col-span-1 sm:mt-0">{f.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="how-it-works" className="border-b border-black py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 flex items-baseline justify-between border-b border-black pb-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">PROTOCOL</h2>
              <span className="label-caps text-black/50">four stages</span>
            </div>
            <ol className="grid gap-px rounded-xl border border-gray-200 bg-gray-200 md:grid-cols-4">
              {STEPS.map((s) => (
                <li key={s.step} className="bg-white p-6">
                  <div className="mb-6 text-5xl font-bold tabular-nums leading-none">{s.step}</div>
                  <h3 className="label-caps mb-2">{s.title}</h3>
                  <p className="text-sm text-black/70">{s.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="stats" className="border-b border-black bg-black py-16 text-white lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 flex items-baseline justify-between border-b border-white pb-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">THE FIELD</h2>
              <span className="label-caps text-white/60">live from your ward</span>
            </div>
            <div className="[&_dl]:bg-black [&_dd]:text-white [&_dt]:text-white/60 [&_div]:divide-white [&_div]:border-white [&_div]:bg-black [&_dd]:border-none">
              <LiveCounters />
            </div>
            <p className="mt-6 text-xs text-white/50">
              Counts are read live from the platform database. No invented numbers.
            </p>
          </div>
        </section>

        <section className="border-b border-black py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl border border-black p-8 text-center sm:p-14">
              <span className="barcode-strip mx-auto mb-6 block h-6 w-24" aria-hidden="true" />
              <h2 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
                READY TO ADD<br />YOUR SIGNAL?
              </h2>
              <p className="mx-auto mt-4 max-w-md text-sm text-black/70">
                Join residents improving their communities. One photo, one pin, one accountable work order.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-px border border-black bg-black sm:flex-row">
                <a
                  href="/register"
                  className="flex-1 bg-blue-600 px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Create Free Account →
                </a>
                <a
                  href="/map"
                  className="flex-1 bg-white px-6 py-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                >
                  Open The Map
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-black text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="mb-4 flex items-center gap-3">
                <span className="barcode-strip inline-block h-5 w-10 bg-white [filter:none]" aria-hidden="true" style={{ backgroundImage: "repeating-linear-gradient(90deg,#fff 0,#fff 2px,transparent 2px,transparent 5px,#fff 5px,#fff 6px,transparent 6px,transparent 11px)" }} />
                <span className="text-sm font-bold uppercase tracking-[0.18em]">Community Hero</span>
              </div>
              <p className="max-w-xs text-sm text-white/60">
                Empowering citizens to report and track civic issues, building better communities through
                transparency and collaboration.
              </p>
              <p className="mt-6 text-xs text-white/40">
                Built for communities · Hyperlocal civic engagement · Powered by citizens
              </p>
            </div>
            <div>
              <h4 className="label-caps mb-4 text-white/60">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/report" className="hover:bg-white hover:text-black">Report Issue</a></li>
                <li><a href="/map" className="hover:bg-white hover:text-black">Community Map</a></li>
                <li><a href="/dashboard" className="hover:bg-white hover:text-black">My Reports</a></li>
                <li><a href="/analytics" className="hover:bg-white hover:text-black">Analytics</a></li>
              </ul>
            </div>
            <div>
              <h4 className="label-caps mb-4 text-white/60">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/privacy" className="hover:bg-white hover:text-black">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:bg-white hover:text-black">Terms of Service</a></li>
                <li><a href="/cookies" className="hover:bg-white hover:text-black">Cookie Policy</a></li>
                <li><a href="/accessibility" className="hover:bg-white hover:text-black">Accessibility</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-white/30 pt-6 sm:flex-row sm:items-center">
            <p className="text-xs text-white/50">&copy; {new Date().getFullYear()} Community Hero. All rights reserved.</p>
            <p className="barcode-strip h-3 w-32 opacity-70" aria-hidden="true" />
          </div>
        </div>
      </footer>
    </>
  )
}


