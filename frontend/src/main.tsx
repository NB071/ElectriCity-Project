import { initSentry } from "./integrations/sentry";
import { router } from "./router.ts";
import ReactDOM from "react-dom/client";
import "./styles/globals.css";
import { AppProvider } from "./app-provider.tsx";

initSentry(router);

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<AppProvider />);
}
