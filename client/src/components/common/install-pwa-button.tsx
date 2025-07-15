import { useEffect, useState } from "react";
import { Download } from "lucide-react";

export const InstallPWAButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const checkInstalled = () => {
      const isInstalled =
        window.matchMedia('(display-mode: standalone)').matches ||
        document.referrer.includes('android-app://');

      setIsAppInstalled(isInstalled);
    };

    checkInstalled();

    window.addEventListener('appinstalled', () => {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    });

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    const promptEvent = deferredPrompt as any;
    promptEvent.prompt();

    const { outcome } = await promptEvent.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installed');
    } else {
      console.log('PWA install rejected');
    }

    setDeferredPrompt(null);
  };

  if (isAppInstalled || !deferredPrompt) return null;

  return (
    <button
      onClick={handleInstall}
      className="fixed right-4 top-4 z-[100] flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all animate-pulse"
    >
      <Download size={16} />
      Install App
    </button>
  );
};
