import QRCodeGenerator from "@/components/qr/qr-code";

export default function QRCodePage() {
    // Replace this with your actual website URL
    const websiteUrl = "http://ew8g88k4w8c0sc0os448k0c8.138.201.120.43.sslip.io";
    
    return (
        <div className="container mx-auto px-4 py-6 md:py-12">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
                Begivenheds QR Kode
            </h1>
            <p className="text-sm md:text-base text-gray-600">
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
                    Scan denne QR kode med din telefons kamera for at besøge vores hjemmeside
                </p>
            </div>
        </div>
    );
} 