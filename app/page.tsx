import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="relative isolate flex h-screen w-full flex-col items-center justify-between overflow-hidden bg-[#050505] px-6 py-8 text-white">
      {/* Background Mesh Gradient */}
      <div className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(251,146,60,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.12),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />
        <div className="absolute -left-[10%] -top-[10%] h-[60%] w-[60%] animate-pulse rounded-full bg-orange-500/20 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[60%] w-[60%] animate-pulse rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-[40%] w-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-[100px]" />
      </div>

      {/* Header / Logo */}
      <header className="relative z-10 animate-in fade-in slide-in-from-top-4 duration-1000">
        <Image src="/logo.svg" alt="Lend Logo" width={120} height={40} className="h-10 w-auto" priority />
      </header>

      {/* Hero Content */}
      <div className="relative z-10 flex max-w-3xl flex-col items-center text-center">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">
            Rent what you need. <br />
            <span className="bg-gradient-to-r from-orange-300 via-orange-400 to-primary bg-clip-text text-transparent">
              Earn from what you own.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-300 sm:text-xl">
            Lend makes it easy to rent items nearby or earn money from things you already own. The marketplace for
            everything, right in your pocket.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
            <span className="rounded-full border border-orange-300/30 bg-orange-400/10 px-5 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange-200 shadow-[0_0_28px_rgba(249,115,22,0.16)]">
              Coming soon
            </span>

            {/*
            <Link
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download Lend on the App Store"
              className="rounded-xl outline-none transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <Image
                src="/badges/app-store.svg"
                alt="Download on the App Store"
                width={270}
                height={80}
                className="h-16 w-auto sm:h-20"
                priority
              />
            </Link>

            <Link
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Get Lend on Google Play"
              className="rounded-xl outline-none transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <Image
                src="/badges/google-play.svg"
                alt="Get it on Google Play"
                width={270}
                height={80}
                className="h-16 w-auto sm:h-20"
                priority
              />
            </Link>
            */}
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <footer className="relative z-10 flex animate-in fade-in slide-in-from-bottom-4 flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-zinc-400 duration-1000 fill-mode-both">
        <Link className="transition-colors hover:text-white" href="/help-center">
          FAQ
        </Link>
        <Link className="transition-colors hover:text-white" href="/privacy-policy">
          Privacy Policy
        </Link>
        <Link className="transition-colors hover:text-white" href="/terms-and-conditions">
          Terms and Conditions
        </Link>
      </footer>
    </main>
  );
}
