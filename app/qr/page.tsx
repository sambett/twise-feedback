// app/qr/page.tsx
import React from 'react';
import Image from 'next/image';
import { PrintButton } from './PrintButton';

export default function QRCodePage() {
  const formUrl = 'https://twise-feedback-pigu.vercel.app/';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(formUrl)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center">
        <h1 className="text-xl font-bold mb-4">TWISE Feedback Form</h1>
        
        <div className="bg-white p-2 rounded-lg shadow-sm inline-block mb-4">
          <Image 
            src={qrCodeUrl}
            alt="QR Code for feedback form"
            width={256}
            height={256}
            unoptimized
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-600">Scan to provide feedback</p>
          <PrintButton />
        </div>
      </div>
    </div>
  );
}