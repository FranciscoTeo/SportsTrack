import React from "react";
import ReactDOM from "react-dom/client";
import Inventory from "./Inventory";

// Obter o root do HTML
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Could not find root element to mount to");

// Criar root do React
const root = ReactDOM.createRoot(rootElement);

// Renderizar o componente Inventory
root.render(
  <React.StrictMode>
    <Inventory />
  </React.StrictMode>
);
