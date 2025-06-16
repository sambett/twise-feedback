"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QRCodePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the TWISE Night QR page to maintain backward compatibility
    router.push('/qr/twise-night');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-xl font-bold mb-4">Redirecting to QR Code...</h1>
      </div>
    </div>
  );
}