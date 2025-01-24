import PageClient from "./page.client";

// Define our types directly instead of inferring from Prisma
export type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
};

export type Chat = {
  id: string;
  title: string;
  prompt: string;
  messages: Message[];
};

// Create a temporary mock chat for development
const createMockChat = (chatId: string): Chat => ({
  id: chatId,
  title: "New Chat",
  prompt: "",
  messages: []
});

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  // Await the params if they're a Promise
  const resolvedParams = await Promise.resolve(params);
  
  // Create mock chat with resolved ID
  const chat = createMockChat(resolvedParams.id);
  
  return <PageClient chat={chat} />;
}

export const maxDuration = 45;