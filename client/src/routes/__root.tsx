/// <reference types="vite/client" />
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import * as React from "react";
import { NotFound } from "@/components/common/not-found";
import { DefaultCatchBoundary } from "@/components/common/try-catch-boundary";
import appCss from "../styles/index.css?url";
import { seo } from "@/utils/seo";
import Navbar from "@/components/shared/naavbar/navbar";
import FooterSection from "@/components/shared/footer/footer";
import { NuqsAdapter } from "nuqs/adapters/react";

import { Toaster } from "@/components/ui/sonner";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title: "Custom Healthcare App Development Services",
        description: `Streamline healthcare operations with custom app development services. Key modules include doctor appointment solutions, pharmacy app development, and telemedicine.`,
      }),
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html className="scroll-smooth scroll-">
      <head>
        <HeadContent />
      </head>
      <body>
        <NuqsAdapter>
          <Navbar />
          {children}
          <FooterSection />
          <TanStackRouterDevtools position="bottom-right" />

          <Toaster richColors position="top-center" />
          <Scripts />
        </NuqsAdapter>
      </body>
    </html>
  );
}
