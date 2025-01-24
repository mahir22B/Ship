import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function extractFirstCodeBlock(input: string) {
  const match = input.match(/\{filePath=([^}]+)\}([\s\S]*?)\{\/filePath\}/);

  if (match) {
    const filePath = match[1]; 
    const code = match[2].trim(); 
    const fullMatch = match[0];

    const filenameParts = filePath.split('/').pop() || '';
    const filename = parseFileName(filenameParts);
    const language = filename.extension;

    return { code, language, filename, fullMatch };
  }
  return null;
}

function parseFileName(fileName: string): { name: string; extension: string } {
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return { name: fileName, extension: "" };
  }
  return {
    name: fileName.slice(0, lastDotIndex),
    extension: fileName.slice(lastDotIndex + 1),
  };
}

export function splitByFirstCodeFence(markdown: string) {
  const result: {
    type: "text" | "first-code-fence" | "first-code-fence-generating";
    content: string;
    filename: { name: string; extension: string };
    language: string;
  }[] = [];

  const lines = markdown.split("\n");
  let inCodeFence = false;
  let textBuffer: string[] = [];
  let codeBuffer: string[] = [];
  let currentFilePath = "";

  const filePathOpenRegex = /^\{filePath=([^}]+)\}$/;
  const filePathCloseRegex = /^\{\/filePath\}$/;

  for (const line of lines) {
    const openMatch = line.match(filePathOpenRegex);
    const closeMatch = line.match(filePathCloseRegex);

    if (openMatch) {
      // Start of any code block
      inCodeFence = true;
      currentFilePath = openMatch[1];

      if (textBuffer.length > 0) {
        result.push({
          type: "text",
          content: textBuffer.join("\n"),
          filename: { name: "", extension: "" },
          language: "",
        });
        textBuffer = [];
      }
    } else if (closeMatch && inCodeFence) {
      // End of code block - all code blocks treated as "first-code-fence"
      inCodeFence = false;

      const filenameParts = currentFilePath.split('/').pop() || '';
      const parsedFilename = parseFileName(filenameParts);
      const language = parsedFilename.extension;

      result.push({
        type: "first-code-fence",
        content: codeBuffer.join("\n"),
        filename: parsedFilename,
        language,
      });

      codeBuffer = [];
    } else if (inCodeFence) {
      // Inside a code block
      codeBuffer.push(line);
    } else {
      // Outside any code block
      textBuffer.push(line);
    }
  }

  // Handle unclosed code block
  if (inCodeFence) {
    const filenameParts = currentFilePath.split('/').pop() || '';
    const parsedFilename = parseFileName(filenameParts);
    const language = parsedFilename.extension;

    result.push({
      type: "first-code-fence-generating",
      content: codeBuffer.join("\n"),
      filename: parsedFilename,
      language,
    });
  } else if (textBuffer.length > 0) {
    // Flush remaining text
    result.push({
      type: "text",
      content: textBuffer.join("\n"),
      filename: { name: "", extension: "" },
      language: "",
    });
  }

  return result;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}




