import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import { CurrentUserProvider } from "./contexts/CurrentUserContext.tsx";
import { DrawingSelectorProvider } from "./contexts/DrawingSelectorContext.tsx";

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
      <DrawingSelectorProvider>
        <RouterProvider router={router} />
      </DrawingSelectorProvider>
    </CurrentUserProvider>
    {/* <App /> */}
  </StrictMode>
);
