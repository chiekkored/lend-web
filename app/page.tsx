import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="relative flex h-screen w-full flex-col items-center justify-between overflow-hidden bg-background px-6 py-8">
      {/* Background Mesh Gradient */}
      <div className="pointer-events-none fixed inset-0 -z-10 h-full w-full overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[60%] w-[60%] animate-pulse rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[60%] w-[60%] animate-pulse rounded-full bg-orange-500/5 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-[40%] w-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[100px]" />
      </div>

      {/* Header / Logo */}
      <header className="animate-in fade-in slide-in-from-top-4 duration-1000">
        <Image src="/logo.svg" alt="Lend Logo" width={120} height={40} className="h-10 w-auto" priority />
      </header>

      {/* Hero Content */}
      <div className="flex max-w-3xl flex-col items-center text-center">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-both">
          <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-7xl">
            Rent what you need. <br />
            <span className="text-primary">Earn from what you own.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">
            Lend makes it easy to rent items nearby or earn money from things you already own. The marketplace for
            everything, right in your pocket.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-5">
            <Link
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download Lend on the App Store"
              className="rounded-xl outline-none transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
              className="rounded-xl outline-none transition-transform hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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
          </div>
        </div>
      </div>

      {/* Footer Links */}
      <footer className="flex animate-in fade-in slide-in-from-bottom-4 flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-medium text-muted-foreground duration-1000 fill-mode-both">
        <Link className="transition-colors hover:text-foreground" href="/help-center">
          FAQ
        </Link>
        <Link className="transition-colors hover:text-foreground" href="/privacy-policy">
          Privacy Policy
        </Link>
        <Link className="transition-colors hover:text-foreground" href="/terms-and-conditions">
          Terms and Conditions
        </Link>
      </footer>
    </main>
  );
}
