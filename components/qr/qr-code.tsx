"use client";

import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";

interface QRCodeGeneratorProps {
    url: string;
    size?: number;
    title?: string;
}

export default function QRCodeGenerator({
    url = "http://localhost:3000/qr-code",
    size = 256,
    title,
}: QRCodeGeneratorProps) {
    const [qrSize, setQrSize] = useState(size);

    useEffect(() => {
        // Adjust QR code size based on screen width
        const handleResize = () => {
            if (window.innerWidth < 400) {
                setQrSize(200);
            } else if (window.innerWidth < 640) {
                setQrSize(240);
            } else {
                setQrSize(size);
            }
        };
        
        // Set initial size
        handleResize();
        
        // Add event listener
        window.addEventListener('resize', handleResize);
        
        // Clean up
        return () => window.removeEventListener('resize', handleResize);
    }, [size]);

    return (
        <div className="flex flex-col items-center justify-center p-4 sm:p-6 bg-white rounded-lg shadow-md max-w-full">
            {title && (
                <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">{title}</h2>
            )}
            <div className="bg-white p-2 sm:p-4 rounded-lg">
                <QRCode 
                    value={url}
                    size={qrSize}
                    level="H"
                    className="mx-auto"
                />
            </div>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-center text-gray-600 break-all px-2">
                scan to visit {url}
            </p>
        </div>
    );
}