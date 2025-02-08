// app/qr/PrintButton.tsx
'use client';

import React from 'react';

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
    >
      Print QR Code
    </button>
  );
}