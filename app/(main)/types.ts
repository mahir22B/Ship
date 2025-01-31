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

  export type DbCodeBlock = {
    id: string;
    message_id: string;
    filename: string;
    extension: string;
    language: string;
    content: string;
    created_at: string;
  };
  
  export type DbMessage = {
    id: string;
    chat_session_id: string;
    role: "user" | "assistant";
    content: string;
    created_at: string;
    code_blocks?: DbCodeBlock[];
  };
  
  export type DbChat = {
    id: string;
    title: string;
    initial_prompt: string;
    created_at: string;
    updated_at: string;
    messages?: DbMessage[];
  };
  
  export const toFrontendCodeBlock = (dbBlock: DbCodeBlock): CodeBlock => ({
    content: dbBlock.content,
    filename: {
      name: dbBlock.filename,
      extension: dbBlock.extension,
    },
    language: dbBlock.language,
    status: "complete"
  });
  
  export const toFrontendMessage = (dbMessage: DbMessage): Message => ({
    id: dbMessage.id,
    content: dbMessage.content,
    role: dbMessage.role,
    codeBlocks: dbMessage.code_blocks?.map(toFrontendCodeBlock)
  });
  
  export const toFrontendChat = (dbChat: DbChat): Chat => ({
    id: dbChat.id,
    title: dbChat.title,
    prompt: dbChat.initial_prompt,
    messages: dbChat.messages?.map(toFrontendMessage) || []
  });