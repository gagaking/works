import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import GlassShowcase from "./GlassShowcase";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlassShowcase />
  </StrictMode>
);
