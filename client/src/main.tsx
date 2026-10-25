import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

document.documentElement.classList.add("public-portfolio");

const blockCopyAction = (event: Event) => event.preventDefault();
document.addEventListener("contextmenu", blockCopyAction);
document.addEventListener("copy", blockCopyAction);
document.addEventListener("cut", blockCopyAction);
document.addEventListener("dragstart", blockCopyAction);
document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if ((event.metaKey || event.ctrlKey) && ["c", "x", "p", "s", "u"].includes(key)) event.preventDefault();
});

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
