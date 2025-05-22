import QRCodeGenerator from "@/components/qr/qr-code";

export default function QRCodePage() {
    // Replace this with your actual website URL
    const websiteUrl = "http://ew8g88k4w8c0sc0os448k0c8.138.201.120.43.sslip.io";
    
    return (
        <div className="container mx-auto py-12">
            <h1 className="text-3xl font-bold mb-8 text-center">
                Event QR Code
            </h1>
            <div className="flex justify-center">
                <QRCodeGenerator 
                    url={websiteUrl} 
                    title="Scan to visit our website!" 
                />
            </div>
        </div>
    );
} 