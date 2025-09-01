import React from "react";
import AppRouter from "@/router/AppRouter";
import Sidebar from "@/components/Sidebar/Sidebar";

export default function App() {
  return (
    <>
      <Sidebar />
      <AppRouter />
    </>
  );
}
