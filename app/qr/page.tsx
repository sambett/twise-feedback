import React from 'react';

const QRCodePage = () => {
  // Your deployed URL
  const formUrl = 'https://twise-feedback-pigu.vercel.app/';
  
  // Using the QR Server API - instant solution, no extra packages needed
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(formUrl)}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center">
        <h1 className="text-xl font-bold mb-4">TWISE Feedback Form</h1>
        
        <div className="bg-white p-2 rounded-lg shadow-sm inline-block mb-4">
          <img 
            src={qrCodeUrl}
            alt="QR Code for feedback form"
            className="w-64 h-64"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-600">Scan to provide feedback</p>
          <button 
            onClick={() => window.print()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Print QR Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodePage;