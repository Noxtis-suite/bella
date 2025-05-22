import Link from "next/link";
import { Button } from "./ui/button";

export default function Header() {
  return (
    <div className="relative w-full py-4 px-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-lg md:text-xl font-semibold">
          <Link href="/">Bella Konfirmation</Link>
        </div>
        
        <Button asChild variant="outline" size="sm" className="text-xs md:text-sm">
          <Link href="/qr-code">
            <span className="flex items-center gap-1 md:gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hidden xs:inline">
                <rect width="5" height="5" x="3" y="3" rx="1" />
                <rect width="5" height="5" x="16" y="3" rx="1" />
                <rect width="5" height="5" x="3" y="16" rx="1" />
                <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
                <path d="M21 21v.01" />
                <path d="M12 7v3a2 2 0 0 1-2 2H7" />
                <path d="M3 12h.01" />
                <path d="M12 3h.01" />
                <path d="M12 16v.01" />
                <path d="M16 12h1" />
                <path d="M21 12v.01" />
                <path d="M12 21v-1" />
              </svg>
              QR Code
            </span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
