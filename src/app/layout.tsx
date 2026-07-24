import type { Metadata } from "next";
import "mapbox-gl/dist/mapbox-gl.css";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATLAS — Chennai Digital Twin",
  description: "AI-powered urban simulation hackathon MVP",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light">
      <head>
      </head>
      <body>{children}</body>
    </html>
  );
}
