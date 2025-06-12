import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import { SelectedShapeProvider } from "./contexts/SelectedShapeContext.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/room/:roomId",
    element: <App />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SelectedShapeProvider>
      <RouterProvider router={router} />
    </SelectedShapeProvider>
    {/* <App /> */}
  </StrictMode>
);
