import ReactDOM from "react-dom/client";
import "./styles/globals.css";
import { AppProvider } from "./app-provider.tsx";

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<AppProvider />);
}
