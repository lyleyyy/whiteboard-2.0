import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import { DrawingSelectorProvider } from "./contexts/DrawingSelectorContext.tsx";
import { UndoRedoStackProvider } from "./contexts/UndoRedoStackContext.tsx";
import { CurrentUserProvider } from "./contexts/CurrentUserContext.tsx";

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
    <CurrentUserProvider>
      <UndoRedoStackProvider>
        <DrawingSelectorProvider>
          <RouterProvider router={router} />
        </DrawingSelectorProvider>
      </UndoRedoStackProvider>
    </CurrentUserProvider>
  </StrictMode>
);
