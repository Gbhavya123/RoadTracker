import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { registerSW } from "virtual:pwa-register";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "184811732493-h28h3i2fnksg6ke6585g7pr2ria5n2vk.apps.googleusercontent.com";

// Initialize Lenis for smooth scrolling
const lenis = new Lenis();
function raf(time: number) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
);

registerSW();
