import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById("root")!).render(
    <GoogleOAuthProvider clientId="184811732493-h28h3i2fnksg6ke6585g7pr2ria5n2vk.apps.googleusercontent.com">
        <App />
    </GoogleOAuthProvider>
);
