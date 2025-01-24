"use client";

// import ArrowLeftIcon from "@/components/icons/arrow-left";
import { splitByFirstCodeFence } from "@/lib/utils";
import Markdown from "react-markdown";
import { StickToBottom } from "use-stick-to-bottom";

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

export default function ChatLog({
  chat,
  activeMessage,
  streamText,
  onMessageClick,
}: {
  chat: Chat;
  activeMessage?: Message;
  streamText: string;
  onMessageClick: (v: Message) => void;
}) {
  const assistantMessages = chat.messages.filter((m) => m.role === "assistant");

  return (
    <StickToBottom
      className="relative grow overflow-hidden bg-black"
      resize="smooth"
      initial="smooth"
    >
      <StickToBottom.Content className="mx-auto flex w-full max-w-prose flex-col justify-end gap-4 p-8">
        <UserMessage content={chat.prompt} />

        {chat.messages.map((message, index) => (
          <div key={message.id} >
            {message.role === "user" ? (
              <UserMessage  content={message.content}  />
            ) : (
              <AssistantMessage
                content={message.content}
                version={
                  assistantMessages.findIndex(m => m.id === message.id) + 1
                }
                message={message}
                isActive={!streamText && activeMessage?.id === message.id}
                onMessageClick={onMessageClick}
              />
            )}
          </div>
        ))}

        {streamText && (
          <AssistantMessage
            content={streamText}
            version={assistantMessages.length + 1}
            isActive={true}
          />
        )}
      </StickToBottom.Content>
    </StickToBottom>
  );
}

function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex w-full justify-end mt-8">
      <div className="max-w-[80%] rounded-2xl bg-gray-800 px-4 py-3">
        <div className="text-base text-white break-words">
          {content}
        </div>
      </div>
    </div>
  );
}

type FilenameParts = {
  name: string;
  extension: string;
};

function parseFilename(content: string): FilenameParts | null {
  const match = content.match(/```(\w+)\s/);
  if (!match) return null;

  const extension = match[1];
  const name = extension.toLowerCase();
  
  return {
    name,
    extension
  };
}

function AssistantMessage({
  content,
  version,
  message,
  isActive,
  onMessageClick = () => {},
}: {
  content: string;
  version: number;
  message?: Message;
  isActive?: boolean;
  onMessageClick?: (v: Message) => void;
}) {
  const parts = splitByFirstCodeFence(content);

  return (
    <div>
      {parts.map((part, i) => {
        if (part.type === "text") {
          return (
            <Markdown 
              key={i} 
              className="prose prose-invert max-w-none prose-pre:bg-[#1a1d27] prose-pre:text-white"
            >
              {part.content}
            </Markdown>
          );
        }

        const filename = parseFilename(content);
        if (!filename) return null;

        // return (
        //   <div key={i} className="my-4">
        //     <button
        //       className={`inline-flex w-full items-center gap-2 rounded-lg border-2 p-1.5 transition-colors ${
        //         isActive 
        //           ? "border-violet-600 bg-[#1a1d27]" 
        //           : "border-gray-700 bg-[#1a1d27] hover:border-violet-600"
        //       }`}
        //       onClick={() => message && onMessageClick(message)}
        //       disabled={!message}
        //     >
        //       <div
        //         className={`flex size-8 items-center justify-center rounded font-medium ${
        //           isActive ? "bg-violet-600 text-white" : "bg-gray-700 text-gray-300"
        //         }`}
        //       >
        //         V{version}
        //       </div>
        //       <div className="flex flex-col gap-0.5 text-left leading-none">
        //         <div className="text-sm font-medium leading-none text-gray-300">
        //           {toTitleCase(filename.name)} {version !== 1 && `v${version}`}
        //         </div>
        //         <div className="text-xs leading-none text-gray-500">
        //           {filename.name}
        //           {version !== 1 && `-v${version}`}
        //           {"."}
        //           {filename.extension}
        //         </div>
        //       </div>
        //       <div className="ml-auto text-gray-400">
        //         <ArrowLeftIcon />
        //       </div>
        //     </button>
        //   </div>
        // );
      })}
    </div>
  );
}

export function toTitleCase(rawName: string): string {
  const parts = rawName.split(/[-_]+/);
  return parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}