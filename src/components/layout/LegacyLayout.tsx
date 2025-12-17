import React from "react";
import NavBar from "@/components/NavBar";

type Props = {
  children: React.ReactNode;
  title?: string;
};

export default function LegacyLayout({ children, title }: Props) {
  return (
    <div style={{ background: "var(--shell-bg)", minHeight: "100vh" }}>
      <NavBar />
      <main style={{ padding: 20 }}>
        {title && <h1 style={{ marginTop: 0 }}>{title}</h1>}
        {children}
      </main>
    </div>
  );
}
