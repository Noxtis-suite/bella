"use client";

import React from "react";
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
    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md">
            {title && (
                <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>
            )}
            <div className="bg-white p-4 rounded-lg">
                <QRCode 
                    value={url}
                    size={size}
                    level="H"
                    className="mx-auto"
                />
            </div>
            <p className="mt-4 text-sm text-center text-gray-600">
                scan to visit {url}
            </p>
        </div>
    )
}