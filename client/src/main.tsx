import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const serviceWorkerUrl = new URL("sw.js", document.baseURI);
    navigator.serviceWorker.register(serviceWorkerUrl, { updateViaCache: "none" }).then((registration) => {
      registration.update().catch(() => undefined);
    }).catch(() => {
      // A aplicação continua a funcionar mesmo quando o navegador não permite o worker.
    });
  });
}
