import ReactDOM from "react-dom/client";
import Inventory from "./Inventory";

const rootElement = document.getElementById("inventory-root");
if (!rootElement) throw new Error("Não encontrou #inventory-root");

const root = ReactDOM.createRoot(rootElement);
root.render(<Inventory />);
