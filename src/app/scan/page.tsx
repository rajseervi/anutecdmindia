'use client';

import { Scanner } from '@yudiel/react-qr-scanner';
import { useRouter } from 'next/navigation';

export default function ScanPage() {
  const router = useRouter();

  const handleScan = (result: string) => {
    // Assume result is product ID
    router.push(`/product/${result}`);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Scan QR Code</h1>
      <Scanner
        onScan={(detectedCodes) => {
          if (detectedCodes.length > 0) {
            handleScan(detectedCodes[0].rawValue);
          }
        }}
        onError={(error) => console.log(error)}
      />
    </div>
  );
}