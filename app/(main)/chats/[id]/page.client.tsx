"use client";

import { splitByFirstCodeFence } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, use, useEffect, useRef, useState } from "react";
import ChatBox from "./chat-box";
import ChatLog from "./chat-log";
import CodeViewer from "./code-viewer";
import { Context } from "../../providers";
import { useClaudeRetry } from '@/hooks/use-claude-retry';


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

export type CodeBlock = {
  content: string;
  filename: { 
    name: string; 
    extension: string;
    path?: string;  
  };
  language: string;
  status: "generating" | "complete";
};

function parseClaudeMessage(text: string): string {
  try {
    const parsed = JSON.parse(text);
    
    if (parsed.type === "message_start") return "";
    if (parsed.type === "content_block_start") return "";
    if (parsed.type === "content_block_delta") return parsed.delta?.text || "";
    if (parsed.type === "message_delta" && parsed.delta?.content) return parsed.delta.content;

    if (Array.isArray(parsed)) {
      return parsed
        .map(block => {
          if (block.type === "content_block_delta") return block.delta?.text || "";
          if (block.type === "message_delta" && block.delta?.content) return block.delta.content;
          return "";
        })
        .filter(Boolean)
        .join("");
    }

    return "";
  } catch (e) {
    if (typeof text === 'string' && !text.includes('"type":')) return text;
    return "";
  }
}

function getFilePath(filename: string): string | undefined {
  if (filename === 'App') {
    console.log(`📂 File "${filename}": Setting root path (undefined)`);
    return undefined;
  }
  console.log(`📂 File "${filename}": Setting path to ./components`);
  return './components';
}

function hasFileBeenModified(oldBlock: CodeBlock, newBlock: CodeBlock): boolean {
  // First check filenames match
  if (oldBlock.filename.name !== newBlock.filename.name) {
    console.log(`⚠️ Filename mismatch: ${oldBlock.filename.name} vs ${newBlock.filename.name}`);
    return true;
  }

  // Normalize content by removing whitespace and comments
  const normalizeContent = (content: string) => {
    return content
      .replace(/\s+/g, ' ')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*/g, '')
      .trim();
  };

  const oldContent = normalizeContent(oldBlock.content);
  const newContent = normalizeContent(newBlock.content);

  const isModified = oldContent !== newContent;
  
  console.log(`\n🔍 Comparing ${oldBlock.filename.name}:`);
  console.log('----------------------------------------');
  console.log('Old:', oldContent.slice(0, 100) + (oldContent.length > 100 ? '...' : ''));
  console.log('New:', newContent.slice(0, 100) + (newContent.length > 100 ? '...' : ''));
  console.log(`${isModified ? '🔄' : '✨'} Status: ${isModified ? 'Modified' : 'Unchanged'}`);
  console.log('----------------------------------------');

  return isModified;
}

export default function PageClient({ chat: initialChat }: { chat: Chat }) {
  const context = use(Context);
  const [streamPromise, setStreamPromise] = useState<Promise<ReadableStream> | undefined>(context.streamPromise);
  const [chat, setChat] = useState<Chat>(() => {
    if (typeof window !== 'undefined') {
      const savedChat = localStorage.getItem(`chat-${initialChat.id}`);
      if (savedChat) {
        try {
          return JSON.parse(savedChat);
        } catch (e) {
          console.error('Error parsing saved chat:', e);
          return initialChat;
        }
      }
    }
    return initialChat;
  });

  const [activeMessage, setActiveMessage] = useState<Message | undefined>(() => {
    if (typeof window !== 'undefined') {
      const savedMessageId = localStorage.getItem(`active-message-${initialChat.id}`);
      if (savedMessageId) {
        return chat.messages.find(m => m.id === savedMessageId);
      }
    }
    return undefined;
  });

  const { executeWithRetry } = useClaudeRetry({
    maxAttempts: 3,
    baseDelay: 2000,
    maxDelay: 8000
  });

  const [streamText, setStreamText] = useState("");
  const [activeTab, setActiveTab] = useState<"code" | "preview">("preview");
  const [codeBlocks, setCodeBlocks] = useState<CodeBlock[]>([]);
  
  const baseCodeBlocksRef = useRef<CodeBlock[]>([]);
  const finalMergedBlocksRef = useRef<CodeBlock[]>([]);
  const skipMessageProcessingRef = useRef(false);
  const isStreamCompletedRef = useRef(false);
  const isHandlingStreamRef = useRef(false);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
  const chatRef = useRef(chat);

  useEffect(() => {
    chatRef.current = chat;
  }, [chat]);

  useEffect(() => {
    localStorage.setItem(`chat-${chat.id}`, JSON.stringify(chat));
  }, [chat]);

  const cleanupReader = async () => {
    if (readerRef.current) {
      try {
        await readerRef.current.cancel();
        readerRef.current.releaseLock();
      } catch (e) {
        console.log("Error cleaning up reader:", e);
      } finally {
        readerRef.current = null;
      }
    }
  };

  useEffect(() => {
    if (activeMessage) {
      localStorage.setItem(`active-message-${chat.id}`, activeMessage.id);
      if (!isHandlingStreamRef.current && !skipMessageProcessingRef.current) {
        console.log('🔄 Processing message content (user-initiated)');
        const parts = splitByFirstCodeFence(activeMessage.content);
        const messageCodeBlocks = parts
          .filter(p => p.type === "first-code-fence")
          .map(p => ({
            content: p.content,
            filename: {
              ...p.filename,
              path: getFilePath(p.filename.name)
            },
            language: p.language,
            status: "complete" as const
          }));
        console.log('📄 Setting code blocks from message:', messageCodeBlocks.map(b => b.filename.name));
        setCodeBlocks(messageCodeBlocks);
      }
      skipMessageProcessingRef.current = false;
    } else {
      localStorage.removeItem(`active-message-${chat.id}`);
      setCodeBlocks([]);
    }
  }, [activeMessage, chat.id]);

  const handleChatUpdate = (newChat: Chat) => {
    console.log("Handling chat update:", newChat.messages);
    setChat(newChat);
  };

  const mergeCodeBlocks = (newBlocks: CodeBlock[]): CodeBlock[] => {
    console.log('\n🔄 Starting merge process...');
    console.log('📦 Base blocks:', baseCodeBlocksRef.current.map(b => b.filename.name));
    console.log('🆕 New blocks:', newBlocks.map(b => b.filename.name));
    
    const mergedBlocks = [...baseCodeBlocksRef.current];
    
    newBlocks.forEach(newBlock => {
      const newBlockPath = `${newBlock.filename.path || ''}/${newBlock.filename.name}`;
      console.log(`\n🔍 Processing: ${newBlockPath}`);
      
      const existingIndex = mergedBlocks.findIndex(block => 
        block.filename.name === newBlock.filename.name
      );
      
      if (existingIndex !== -1) {
        const existingBlock = mergedBlocks[existingIndex];
        
        if (hasFileBeenModified(existingBlock, newBlock)) {
          console.log(`📝 Updating modified file: ${newBlockPath}`);
          mergedBlocks[existingIndex] = {
            ...newBlock,
            filename: {
              ...newBlock.filename,
              path: getFilePath(newBlock.filename.name)
            }
          };
        } else {
          console.log(`✨ Keeping unmodified file: ${newBlockPath}`);
        }
      } else {
        console.log(`➕ Adding new file: ${newBlockPath}`);
        mergedBlocks.push({
          ...newBlock,
          filename: {
            ...newBlock.filename,
            path: getFilePath(newBlock.filename.name)
          }
        });
      }
    });
    
    console.log('\n📦 Merge result:', mergedBlocks.map(b => b.filename.name));
    return mergedBlocks;
  };

  useEffect(() => {
    async function handleStream() {
      if (!streamPromise || isHandlingStreamRef.current) {
        console.log("Stream already being handled or no stream promise");
        return;
      }

      setActiveTab("code");
      console.log("\n🚀 Starting new stream");
      isHandlingStreamRef.current = true;
      isStreamCompletedRef.current = false;
      context.setStreamPromise(undefined);
      setCodeBlocks([]);

      await cleanupReader();

      try {
        await executeWithRetry(async () => {
          const stream = await streamPromise;
          console.log("Stream obtained, beginning to read");

          if (stream.locked) {
            console.warn("Stream is locked, cannot proceed");
            throw new Error("Stream is locked");
          }

          try {
            readerRef.current = stream.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = '';
            let processedContent = '';

            while (true) {
              const { done, value } = await readerRef.current.read();
              if (done) {
                isStreamCompletedRef.current = true;
                break;
              }

              const chunk = decoder.decode(value);
              accumulatedContent += chunk;
              
              const chunkContent = parseClaudeMessage(chunk);
              if (chunkContent) {
                processedContent += chunkContent;
                setStreamText(processedContent);

                const parts = splitByFirstCodeFence(processedContent);
                const newCodeBlocks = parts
                  .filter(p => p.type === "first-code-fence-generating" || p.type === "first-code-fence")
                  .map(p => ({
                    content: p.content,
                    filename: {
                      ...p.filename,
                      path: getFilePath(p.filename.name)
                    },
                    language: p.language,
                    status: p.type === "first-code-fence-generating" ? "generating" : "complete"
                  } as CodeBlock));

                if (newCodeBlocks.length > 0) {
                  console.log('\n📦 Processing new code blocks:', newCodeBlocks.map(b => b.filename.name));
                  
                  finalMergedBlocksRef.current = baseCodeBlocksRef.current.length > 0 
                    ? mergeCodeBlocks(newCodeBlocks)
                    : newCodeBlocks;
                  
                  console.log('🔄 Setting code blocks:', finalMergedBlocksRef.current.map(b => b.filename.name));
                  setCodeBlocks(finalMergedBlocksRef.current);
                  
                  const hasGeneratingBlocks = finalMergedBlocksRef.current.some(
                    block => block.status === "generating"
                  );
                  
                  if (isStreamCompletedRef.current && !hasGeneratingBlocks) {
                    console.log('🔄 Stream completed and all blocks generated - switching to preview');
                    setActiveTab("preview");
                  } else {
                    setActiveTab("code");
                  }
                }
              }
            }

            if (processedContent) {
              console.log("\n✅ Stream completed");
              
              const newMessage: Message = {
                id: Date.now().toString(),
                content: processedContent,
                role: "assistant"
              };

              const currentChat = chatRef.current;
              const newChat = {
                ...currentChat,
                messages: [...currentChat.messages, newMessage]
              };
              
              skipMessageProcessingRef.current = true;
              console.log('🚫 Skipping message processing for stream completion');
              
              console.log('🔄 Updating chat and storage');
              localStorage.setItem(`chat-${currentChat.id}`, JSON.stringify(newChat));
              setChat(newChat);
              
              console.log('📝 Updating base with final merged blocks:', 
                finalMergedBlocksRef.current.map(b => b.filename.name)
              );
              baseCodeBlocksRef.current = [...finalMergedBlocksRef.current];
              
              setActiveMessage(newMessage);
            }
          } finally {
            await cleanupReader();
          }
        });
      } catch (error:any) {
        console.error('Error handling stream:', error);
        if (!error.toString().toLowerCase().includes('overloaded')) {
          throw error;
        }
      } finally {
        console.log("Stream handling completed");
        isHandlingStreamRef.current = false;
        setStreamText("");
        setStreamPromise(undefined);
        finalMergedBlocksRef.current = [];
        await cleanupReader();
        
        if (isStreamCompletedRef.current) {
          const hasGeneratingBlocks = codeBlocks.some(block => block.status === "generating");
          if (!hasGeneratingBlocks) {
            console.log('🔄 Final check - switching to preview mode');
            setActiveTab("preview");
          }
        }
      }
    }

    handleStream();

    return () => {
      cleanupReader();
    };
  }, [streamPromise, context]);

  const handleMessageClick = (message: Message) => {
    if (message.id !== activeMessage?.id) {
      console.log('🖱️ Message clicked:', message.id);
      setActiveMessage(message);
    } else {
      setActiveMessage(undefined);
      setCodeBlocks([]);
    }
  };

  return (
    <div className="h-dvh">
      <div className="flex h-full">
        <div className="flex w-[30%] shrink-0 flex-col overflow-hidden border-r border-gray-600/20 bg-[#14171f]">
          <div className="flex items-center gap-4 px-4 py-4 bg-black">
            <Link href="/">
              <h1 className="text-gray-300">Title</h1>
            </Link>
          </div>

          <ChatLog
            chat={chat}
            streamText={streamText}
            activeMessage={activeMessage}
            onMessageClick={handleMessageClick}
          />

          <ChatBox
            chat={chat}
            onChatUpdate={handleChatUpdate}
            onNewStreamPromise={setStreamPromise}
            isStreaming={!!streamPromise}
            codeBlocks={codeBlocks}
          />
        </div>
        <div className="w-[70%] bg-white">
          <CodeViewer
            codeBlocks={codeBlocks}
            chat={chat}
            message={activeMessage}
            onMessageChange={setActiveMessage}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>
    </div>
  );
}