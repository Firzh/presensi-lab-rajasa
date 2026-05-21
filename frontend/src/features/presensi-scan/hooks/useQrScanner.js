import { useCallback, useRef, useState } from 'preact/hooks';
import { Html5Qrcode } from 'html5-qrcode';

export function useQrScanner({ elementId, onScanSuccess }) {
  const scannerRef = useRef(null);
  const lastPayloadRef = useRef('');
  const lastScanAtRef = useRef(0);

  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState('');

  const startScanner = useCallback(async () => {
    setScannerError('');

    if (isScanning) {
      return;
    }

    const scanner = new Html5Qrcode(elementId);
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
        },
        async (decodedText) => {
          const now = Date.now();

          if (decodedText === lastPayloadRef.current && now - lastScanAtRef.current < 2500) {
            return;
          }

          lastPayloadRef.current = decodedText;
          lastScanAtRef.current = now;

          await onScanSuccess(decodedText);
        },
        () => {
          // Diamkan scan failure agar tidak spam setiap frame.
        },
      );

      setIsScanning(true);
    } catch (error) {
      setScannerError(error?.message || String(error));
      setIsScanning(false);
    }
  }, [elementId, isScanning, onScanSuccess]);

  const stopScanner = useCallback(async () => {
    if (!scannerRef.current || !isScanning) {
      return;
    }

    await scannerRef.current.stop();
    await scannerRef.current.clear();

    scannerRef.current = null;
    setIsScanning(false);
  }, [isScanning]);

  return {
    isScanning,
    scannerError,
    startScanner,
    stopScanner,
  };
}
