import ReactDOM from "react-dom/client";
import Inventory from "./Inventory";

const rootElement = document.getElementById("inventory-root");
if (!rootElement) throw new Error("Could not find inventory root element");

const root = ReactDOM.createRoot(rootElement);
root.render(<Inventory />);
