import { useRegisterSW } from "virtual:pwa-register/react";
import { useVault } from "./vault/VaultContext";

export default function PWAUpdatePrompt() {
  const { dirty } = useVault();
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({ immediate: true });

  if (!needRefresh) return null;

  return <aside className="pwa-update-prompt" role="status" aria-live="polite">
    <div><strong>Hay una actualización lista</strong><span>{dirty ? "Guarda los cambios de la bóveda antes de actualizar." : "La actualización reiniciará la aplicación."}</span></div>
    <button className="button primary" type="button" disabled={dirty} onClick={() => updateServiceWorker(true)}>Actualizar aplicación</button>
  </aside>;
}
