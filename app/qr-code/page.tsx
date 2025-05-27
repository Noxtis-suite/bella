import QRCodeGenerator from "@/components/qr/qr-code";
import Link from "next/link";

export default function QRCodePage() {
    // Replace this with your actual website URL
    const websiteUrl = "http://ew8g88k4w8c0sc0os448k0c8.138.201.120.43.sslip.io";
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-4 py-4 sm:py-6">
                <div className="max-w-md mx-auto">
                    {/* Header with back button */}
                    <div className="flex justify-between items-center mb-4">
                        <Link 
                            href="/"
                            className="text-blue-600 hover:text-blue-700 flex items-center gap-1.5 text-sm font-medium transition-colors"
                        >
                            <svg 
                                className="w-4 h-4" 
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
                            Tilbage
                        </Link>
                        {/* Festive emoji */}
                        <div className="text-xl">🎉</div>
                    </div>

                    {/* Main content card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
                        {/* Title with festive elements */}
                        <div className="text-center mb-6">
                            <div className="flex justify-center items-center gap-2 mb-3">
                                <span className="text-2xl">🎊</span>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                                    Begivenheds QR Kode
                                </h1>
                                <span className="text-2xl">🎊</span>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Scan QR koden med din telefon for at besøge vores hjemmeside
                            </p>
                        </div>

                        {/* QR Code */}
                        <div className="flex justify-center mb-6">
                            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl">
                                <QRCodeGenerator 
                                    url={websiteUrl} 
                                    title="Scan for at besøge vores hjemmeside!" 
                                />
                            </div>
                        </div>

                        {/* Bottom section */}
                        <div className="text-center space-y-3">
                        </div>
                    </div>

                    {/* Footer decoration */}
                    <div className="text-center mt-4 text-2xl">
                        🎉 🎊 🎈
                    </div>
                </div>
            </div>
        </div>
    );
}