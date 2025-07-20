import React, { use } from 'react';
import Image from 'next/image';
import { getEventConfig } from '../../lib/eventConfigs';
import { PrintButton } from '../PrintButton';

interface QRPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default function EventQRCodePage({ params }: QRPageProps) {
  const resolvedParams = use(params);
  const eventConfig = getEventConfig(resolvedParams.eventId);
  const formUrl = `https://twise-feedback.vercel.app/event/${resolvedParams.eventId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(formUrl)}`;

  // Extract colors from theme for styling
  const getThemeColors = () => {
    switch (resolvedParams.eventId) {
      case 'sam-wedding':
        return {
          background: 'from-pink-50 to-purple-100',
          accent: 'pink-500',
          text: 'pink-700'
        };
      case 'techflow-demo':
        return {
          background: 'from-slate-50 to-blue-100',
          accent: 'blue-500',
          text: 'blue-700'
        };
      case 'ai-masterclass':
        return {
          background: 'from-emerald-50 to-teal-100',
          accent: 'emerald-500',
          text: 'emerald-700'
        };
      case 'future-tech-conference':
        return {
          background: 'from-orange-50 to-red-100',
          accent: 'orange-500',
          text: 'orange-700'
        };
      default: // twise-night
        return {
          background: 'from-purple-50 to-blue-100',
          accent: 'purple-500',
          text: 'purple-700'
        };
    }
  };

  const themeColors = getThemeColors();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeColors.background} flex items-center justify-center p-4`}>
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center">
        <h1 className={`text-xl font-bold mb-2 text-${themeColors.text}`}>
          {eventConfig.title}
        </h1>
        <p className="text-gray-600 text-sm mb-4">{eventConfig.subtitle}</p>
        
        <div className="bg-white p-2 rounded-lg shadow-sm inline-block mb-4">
          <Image 
            src={qrCodeUrl}
            alt={`QR Code for ${eventConfig.title} feedback form`}
            width={256}
            height={256}
            unoptimized
          />
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">Scan to provide feedback</p>
          
          <div className={`bg-${themeColors.accent}/10 rounded-lg p-3`}>
            <p className={`text-xs text-${themeColors.text} font-medium mb-1`}>Direct Link:</p>
            <p className="text-xs text-gray-600 break-all">{formUrl}</p>
          </div>
          
          <PrintButton />
          
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Powered by Universal Feedback Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}