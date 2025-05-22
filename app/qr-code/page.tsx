import QRCodeGenerator from "@/components/qr/qr-code";
import Link from "next/link";

export default function QRCodePage() {
    // Replace this with your actual website URL
    const websiteUrl = "http://ew8g88k4w8c0sc0os448k0c8.138.201.120.43.sslip.io";
    
    return (
        <div className="container mx-auto px-4 py-6 md:py-12">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <Link 
                        href="/"
                        className="text-blue-500 hover:text-blue-600 flex items-center gap-2"
                    >
                        <svg 
                            className="w-5 h-5" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                            />
                        </svg>
                        Tilbage til forsiden
                    </Link>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
                    Begivenheds QR Kode
                </h1>
                <p className="text-sm md:text-base text-gray-600 text-center mb-8">
                    Scan denne QR kode med din telefons kamera for at besøge vores hjemmeside
                </p>
                <div className="flex justify-center">
                    <QRCodeGenerator 
                        url={websiteUrl} 
                        title="Scan for at besøge vores hjemmeside!" 
                    />
                </div>
                <div className="mt-8 text-center">
                    <p className="text-sm md:text-base text-gray-600">
                        Eller klik <Link href="/" className="text-blue-500 hover:text-blue-600 underline">her</Link> for at gå direkte til hjemmesiden
                    </p>
                </div>
            </div>
        </div>
    );
}