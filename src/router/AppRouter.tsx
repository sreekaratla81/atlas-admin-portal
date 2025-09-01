import React from "react";
import { useRoutes, RouteObject } from "react-router-dom";
import routes from "./routes";

export default function AppRouter() {
  return useRoutes(routes as RouteObject[]);
}
