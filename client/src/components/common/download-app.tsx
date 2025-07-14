import { useEffect, useState } from "react";

export const InstallPWAButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    // Check if already installed
    const isInstalled =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone;

    if (!isInstalled) {
      window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("PWA installed");
    }

    setDeferredPrompt(null);
    setCanInstall(false);
  };

  if (!canInstall) return null;

  return (
    <button
      onClick={handleInstall}
      className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600 transition fixed right-4 top-1/2 transform -translate-y-1/2"
    >
      Download App
    </button>
  );
};
