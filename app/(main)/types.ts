// types.ts
export type CodeBlock = {
    content: string;
    filename: { name: string; extension: string };
    language: string;
    status: "generating" | "complete";
  };
  
  export type Message = {
    id: string;
    content: string;
    role: "user" | "assistant";
    codeBlocks?: CodeBlock[];
  };
  
  export type Chat = {
    id: string;
    title: string;
    prompt: string;
    messages: Message[];
  };