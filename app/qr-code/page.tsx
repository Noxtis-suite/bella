import QRCodeGenerator from "@/components/qr/qr-code";

export default function QRCodePage() {
    // Replace this with your actual website URL
    const websiteUrl = "https://your-website-url.com";
    
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