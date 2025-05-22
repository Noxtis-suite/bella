import QRCodeGenerator from "@/components/qr/qr-code";

export default function QRCodePage() {
    // Replace this with your actual website URL
    const websiteUrl = "http://ew8g88k4w8c0sc0os448k0c8.138.201.120.43.sslip.io";
    
    return (
        <div className="container mx-auto px-4 py-6 md:py-12">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
                Event QR Code
            </h1>
            <div className="flex justify-center">
                <QRCodeGenerator 
                    url={websiteUrl} 
                    title="Scan to visit our website!" 
                />
            </div>
            <div className="mt-8 text-center">
                <p className="text-sm md:text-base text-gray-600">
                    Scan this QR code with your phone's camera to visit our website
                </p>
            </div>
        </div>
    );
} 