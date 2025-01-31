"use client";

import * as shadcnComponents from "@/lib/shadcn";
import {
  SandpackPreview,
  SandpackProvider,
  useSandpack,
  SandpackFileExplorer,
  SandpackCodeEditor
} from "@codesandbox/sandpack-react/unstyled";
import dedent from "dedent";
import { ErrorToast } from "./error-toast";
import { useEffect, useRef } from "react";

import type { CodeBlock } from "../app/(main)/chats/[id]/page.client";

function FileUpdater({ codeBlocks }: { codeBlocks: CodeBlock[] }) {
  const { sandpack } = useSandpack();
  const prevCodeBlocksRef = useRef<string>("");

  useEffect(() => {
    // Create a string representation of code blocks for comparison
    const codeBlocksString = JSON.stringify(codeBlocks);
    
    // Only update if code blocks have changed
    if (prevCodeBlocksRef.current !== codeBlocksString) {
      codeBlocks.forEach(block => {
        const isRootFile = block.filename.name === 'App';
        const path = isRootFile 
          ? `${block.filename.name}.${block.filename.extension}` 
          : `components/${block.filename.name}.${block.filename.extension}`;
        
        sandpack.updateFile(path, block.content);
      });

      prevCodeBlocksRef.current = codeBlocksString;
    }
  }, [codeBlocks, sandpack]);

  return null;
}

export default function ReactCodeRunner({ codeBlocks }: { codeBlocks: CodeBlock[] }) {

  const globalCssBlock = codeBlocks?.find(block => 
    block.filename.name === 'global' && 
    block.filename.extension === 'css'
  );

  // Create initial files structure
  const initialFiles = codeBlocks?.reduce((acc, block) => {
    if (block.filename.name === 'global' && block.filename.extension === 'css') {
      return acc;
    }
    const isRootFile = block.filename.name === 'App';
    const path = isRootFile 
      ? `${block.filename.name}.${block.filename.extension}` 
      : `components/${block.filename.name}.${block.filename.extension}`;
    
    return {
      ...acc,
      [path]: {
        code: block.content
      }
    };
  }, {} as Record<string, { code: string }>);

//   const customIndexContent = `
// import React, { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import './index.css';

// import App from "./App";

// const root = createRoot(document.getElementById("root"));
// root.render(
//   <StrictMode>
//     <App />
//   </StrictMode>
// );
// `;

  return (
    <SandpackProvider 
      key={codeBlocks?.map(b => b.content).join('|')}
      template="react-ts"
      className="h-full w-full [&_.sp-preview-container]:flex [&_.sp-preview-container]:h-full [&_.sp-preview-container]:w-full [&_.sp-preview-container]:grow [&_.sp-preview-container]:flex-col [&_.sp-preview-container]:justify-center [&_.sp-preview-iframe]:grow"
      files={{
        ...initialFiles,
        ...shadcnFiles,
        // "/global.css": {
        //   code: globalCssBlock?.content || '',
        //   hidden: false
        // },
        "/tsconfig.json": {
          code: `{
            "include": [
              "./**/*"
            ],
            "compilerOptions": {
              "strict": true,
              "esModuleInterop": true,
              "lib": [ "dom", "es2015" ],
              "jsx": "react-jsx",
              "baseUrl": "./",
              "paths": {
                "@/components/*": ["components/*"]
              }
            }
          }`,
        },
        "utils.ts": {
          code: `import { type ClassValue, clsx } from "clsx"
                import { twMerge } from "tailwind-merge"
                 
                export function cn(...inputs: ClassValue[]) {
                  return twMerge(clsx(inputs))
                }`,
        },
        "tailwind.config.js": {
          code: `
            /** @type {import('tailwindcss').Config} */
            export default {
              darkMode: ["class"],
              content: [
                "./index.html",
                "./src/**/*.{js,ts,jsx,tsx}",
              ],
              theme: {
                container: {
                  center: true,
                  padding: "2rem",
                  screens: {
                    "2xl": "1400px",
                  },
                },
                extend: {
                  colors: {
                    border: "hsl(var(--border))",
                    input: "hsl(var(--input))",
                    ring: "hsl(var(--ring))",
                    background: "hsl(var(--background))",
                    foreground: "hsl(var(--foreground))",
                    primary: {
                      DEFAULT: "hsl(var(--primary))",
                      foreground: "hsl(var(--primary-foreground))",
                    },
                    secondary: {
                      DEFAULT: "hsl(var(--secondary))",
                      foreground: "hsl(var(--secondary-foreground))",
                    },
                    destructive: {
                      DEFAULT: "hsl(var(--destructive))",
                      foreground: "hsl(var(--destructive-foreground))",
                    },
                    muted: {
                      DEFAULT: "hsl(var(--muted))",
                      foreground: "hsl(var(--muted-foreground))",
                    },
                    accent: {
                      DEFAULT: "hsl(var(--accent))",
                      foreground: "hsl(var(--accent-foreground))",
                    },
                    popover: {
                      DEFAULT: "hsl(var(--popover))",
                      foreground: "hsl(var(--popover-foreground))",
                    },
                    card: {
                      DEFAULT: "hsl(var(--card))",
                      foreground: "hsl(var(--card-foreground))",
                    },
                  },
                  borderRadius: {
                    lg: "var(--radius)",
                    md: "calc(var(--radius) - 2px)",
                    sm: "calc(var(--radius) - 4px)",
                  },
                  keyframes: {
                    "accordion-down": {
                      from: { height: 0 },
                      to: { height: "var(--radix-accordion-content-height)" },
                    },
                    "accordion-up": {
                      from: { height: "var(--radix-accordion-content-height)" },
                      to: { height: 0 },
                    },
                  },
                  animation: {
                    "accordion-down": "accordion-down 0.2s ease-out",
                    "accordion-up": "accordion-up 0.2s ease-out",
                  },
                },
              },
              plugins: [require("tailwindcss-animate")],
            }`,
        },
      }}
      options={{
        externalResources: [
          "https://unpkg.com/@tailwindcss/ui/dist/tailwind-ui.min.css",
        ],
      }}
      customSetup={{
        dependencies,
      }}
    >
      <ErrorToast />
      {/* <SandpackFileExplorer />
      <SandpackCodeEditor /> */}
      <FileUpdater codeBlocks={codeBlocks} />
      <SandpackPreview
        showNavigator={false}
        showOpenInCodeSandbox={false}
        showRefreshButton={false}
        showRestartButton={false}
        showOpenNewtab={false}
        className="h-full w-full"
      />
    </SandpackProvider>
  );
}

const shadcnFiles = {
  "/lib/utils.ts": shadcnComponents.utils,
  "/components/ui/accordion.tsx": shadcnComponents.accordian,
  "/components/ui/alert-dialog.tsx": shadcnComponents.alertDialog,
  "/components/ui/alert.tsx": shadcnComponents.alert,
  "/components/ui/avatar.tsx": shadcnComponents.avatar,
  "/components/ui/badge.tsx": shadcnComponents.badge,
  "/components/ui/breadcrumb.tsx": shadcnComponents.breadcrumb,
  "/components/ui/button.tsx": shadcnComponents.button,
  "/components/ui/calendar.tsx": shadcnComponents.calendar,
  "/components/ui/card.tsx": shadcnComponents.card,
  "/components/ui/carousel.tsx": shadcnComponents.carousel,
  "/components/ui/checkbox.tsx": shadcnComponents.checkbox,
  "/components/ui/collapsible.tsx": shadcnComponents.collapsible,
  "/components/ui/dialog.tsx": shadcnComponents.dialog,
  "/components/ui/drawer.tsx": shadcnComponents.drawer,
  "/components/ui/dropdown-menu.tsx": shadcnComponents.dropdownMenu,
  "/components/ui/input.tsx": shadcnComponents.input,
  "/components/ui/label.tsx": shadcnComponents.label,
  "/components/ui/menubar.tsx": shadcnComponents.menuBar,
  "/components/ui/navigation-menu.tsx": shadcnComponents.navigationMenu,
  "/components/ui/pagination.tsx": shadcnComponents.pagination,
  "/components/ui/popover.tsx": shadcnComponents.popover,
  "/components/ui/progress.tsx": shadcnComponents.progress,
  "/components/ui/radio-group.tsx": shadcnComponents.radioGroup,
  "/components/ui/select.tsx": shadcnComponents.select,
  "/components/ui/separator.tsx": shadcnComponents.separator,
  "/components/ui/skeleton.tsx": shadcnComponents.skeleton,
  "/components/ui/slider.tsx": shadcnComponents.slider,
  "/components/ui/switch.tsx": shadcnComponents.switchComponent,
  "/components/ui/table.tsx": shadcnComponents.table,
  "/components/ui/tabs.tsx": shadcnComponents.tabs,
  "/components/ui/textarea.tsx": shadcnComponents.textarea,
  "/components/ui/toast.tsx": shadcnComponents.toast,
  "/components/ui/toaster.tsx": shadcnComponents.toaster,
  "/components/ui/toggle-group.tsx": shadcnComponents.toggleGroup,
  "/components/ui/toggle.tsx": shadcnComponents.toggle,
  "/components/ui/tooltip.tsx": shadcnComponents.tooltip,
  "/components/ui/use-toast.tsx": shadcnComponents.useToast,
  "/components/ui/index.tsx": `
    export * from "./button"
    export * from "./card"
    export * from "./input"
    export * from "./label"
    export * from "./select"
    export * from "./textarea"
    export * from "./avatar"
    export * from "./radio-group"
  `,
  "/public/index.html": dedent`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <link rel="stylesheet" href="/global.css"> 
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div id="root"></div>
      </body>
    </html>
  `,
};

const dependencies = {
  "lucide-react": "latest",
  recharts: "2.15.0",
  "react-router-dom": "latest",
  "@radix-ui/react-accordion": "^1.2.0",
  "@radix-ui/react-alert-dialog": "^1.1.1",
  "@radix-ui/react-aspect-ratio": "^1.1.0",
  "@radix-ui/react-avatar": "^1.1.0",
  "@radix-ui/react-checkbox": "^1.1.1",
  "@radix-ui/react-collapsible": "^1.1.0",
  "@radix-ui/react-dialog": "^1.1.1",
  "@radix-ui/react-dropdown-menu": "^2.1.1",
  "@radix-ui/react-hover-card": "^1.1.1",
  "@radix-ui/react-label": "^2.1.0",
  "@radix-ui/react-menubar": "^1.1.1",
  "@radix-ui/react-navigation-menu": "^1.2.0",
  "@radix-ui/react-popover": "^1.1.1",
  "@radix-ui/react-progress": "^1.1.0",
  "@radix-ui/react-radio-group": "^1.2.0",
  "@radix-ui/react-select": "^2.1.1",
  "@radix-ui/react-separator": "^1.1.0",
  "@radix-ui/react-slider": "^1.2.0",
  "@radix-ui/react-slot": "^1.1.0",
  "@radix-ui/react-switch": "^1.1.0",
  "@radix-ui/react-tabs": "^1.1.0",
  "@radix-ui/react-toast": "^1.2.1",
  "@radix-ui/react-toggle": "^1.1.0",
  "@radix-ui/react-toggle-group": "^1.1.0",
  "@radix-ui/react-tooltip": "^1.1.2",
  "class-variance-authority": "^0.7.0",
  clsx: "^2.1.1",
  "date-fns": "^3.6.0",
  "embla-carousel-react": "^8.1.8",
  "react-day-picker": "^8.10.1",
  "tailwindcss": "^3.4.0",
  "tailwind-merge": "^2.4.0",
  "tailwindcss-animate": "^1.0.7",
  "framer-motion": "^11.15.0",
  vaul: "^0.9.1",
};