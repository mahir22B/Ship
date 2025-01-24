"use client";

import { startTransition, useEffect, useState } from "react";
import { codeToHtml } from "shiki/bundle/web";

export default function SyntaxHighlighter({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const [codeHtml, setCodeHtml] = useState("");

  useEffect(() => {
    if (!code) return;

    startTransition(async () => {
      const html = await codeToHtml(code, {
        lang: language,
        theme: "one-dark-pro",
      });

      // Remove background-color from pre tag
      const modifiedHtml = html.replace(/style="[^"]*?background-color:[^;]*;[^"]*"/, (match) => {
        return match.replace(/background-color:[^;]*;/, '');
      });

      startTransition(() => {
        setCodeHtml(modifiedHtml);
      });
    });
  }, [code, language]);

  return (
    <div
      className="h-full w-full bg-[#14171f] p-4 text-sm"
      dangerouslySetInnerHTML={{ __html: codeHtml }}
      style={{
        fontFamily: 'JetBrains Mono, Fira Code, Menlo, Monaco, monospace'
      }}
    />
  );
}