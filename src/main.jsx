import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import Auth from "./Auth.jsx";
import { auth, db } from "../src/Firebase.js";
import Root from "./Root.jsx";
import StudentInfo from "./StudentInfo.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";

createRoot(document.getElementById("root")).render(
  <ErrorBoundary fallback={<p>Something went wrong</p>}>
    <Root />
  </ErrorBoundary>,
);
