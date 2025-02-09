// "use client";

// import CodeRunner from "@/components/code-runner";
// import { RefreshCw } from "lucide-react";
// import SyntaxHighlighter from "@/components/syntax-highlighter";
// import type { Chat, Message, CodeBlock } from "./page.client";
// import { StickToBottom } from "use-stick-to-bottom";
// import { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import { RootState } from "@/store";


// type CodeViewerProps = {
//   chat: Chat;
//   codeBlocks: CodeBlock[];  // New prop replacing streamText
//   message?: Message;
//   onMessageChange: (v: Message) => void;
//   activeTab: "code" | "preview";
//   onTabChange: (v: "code" | "preview") => void;
// };


// export default function CodeViewer({
//   chat,
//   codeBlocks,
//   message,
//   onMessageChange,
//   activeTab,
//   onTabChange,
// }: CodeViewerProps) {
//   const [refresh, setRefresh] = useState(0);
//   const { submitting } = useSelector((state: RootState) => state.error);

//   const layout = ["python", "ts", "js", "javascript", "typescript"].includes(
//     codeBlocks[0]?.language?.toLowerCase() || ""
//   ) ? "two-up" : "tabbed";

//   const assistantMessages = chat.messages.filter((m) => m.role === "assistant");
//   const currentVersion = codeBlocks.length > 0
//     ? assistantMessages.length
//     : message
//       ? assistantMessages.findIndex(m => m.id === message.id)
//       : 0;

//   useEffect(() => {
//     if (submitting && activeTab === "preview") {
//       onTabChange("code");
//     }
//   }, [submitting, activeTab, onTabChange]);

//   return (
//     <div className="flex h-full flex-col bg-white">
//       {layout === "tabbed" ? (
//         <div className="relative flex grow overflow-hidden">
//           {/* Code View */}
//           <div 
//             className="absolute inset-0 w-full bg-[#14171f] transition-all duration-300 ease-in-out"
//             style={{
//               opacity: activeTab === "code" ? 1 : 0,
//               transform: `translateX(${activeTab === "code" ? "0%" : "-100%"})`,
//               pointerEvents: activeTab === "code" ? "auto" : "none"
//             }}
//           >
//             <StickToBottom
//               className="h-full overflow-hidden"
//               resize="smooth"
//               initial={submitting ? "smooth" : false}
//             >
//               <StickToBottom.Content>
//                 <div className="flex flex-col space-y-8 p-6">
//                   {codeBlocks.map((block, index) => (
//                     <div key={block.filename?.name || index} className="flex flex-col">
//                       <div className="mb-2 text-sm font-medium text-gray-400">
//                         {block.filename?.name}
//                       </div>
//                       <div className="rounded-lg border border-gray-700/30">
//                         <SyntaxHighlighter 
//                           code={block.content || ""} 
//                           language={block.language || ""} 
//                         />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </StickToBottom.Content>
//             </StickToBottom>
//           </div>

//           {/* Preview View */}
//           <div 
//             className="absolute inset-0 w-full transition-all duration-300 ease-in-out"
//             style={{
//               opacity: activeTab === "preview" ? 1 : 0,
//               transform: `translateX(${activeTab === "preview" ? "0%" : "100%"})`,
//               pointerEvents: activeTab === "preview" ? "auto" : "none"
//             }}
//           >
//             {!submitting && (
//               <div className="flex h-full items-center justify-center">
//                 <CodeRunner codeBlocks={codeBlocks} key={refresh} />
//               </div>
//             )}
//           </div>
//         </div>
//       ) : (
//         <div className="flex grow flex-col">
//           <div className="h-1/2 overflow-y-auto p-6">
//             <div className="flex flex-col space-y-8">
//               {codeBlocks.map((block, index) => (
//                 <div key={block.filename?.name || index} className="flex flex-col">
//                   <div className="mb-2 text-sm font-medium text-gray-400">
//                     {block.filename?.name}
//                   </div>
//                   <div className="rounded-lg border border-gray-700/30">
//                     <SyntaxHighlighter 
//                       code={block.content || ""} 
//                       language={block.language || ""} 
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div className="flex h-1/2 flex-col">
//             <div className="px-4 py-4 text-gray-700">
//               Output
//             </div>
//             <div className="flex grow items-center justify-center">
//               {!submitting && (
//                 <CodeRunner codeBlocks={codeBlocks} key={refresh} />
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="flex items-center justify-between border-t border-gray-600/20 bg-[#14171f] px-1.5 py-1.5">
//         <div className="inline-flex items-center gap-4">
//           <div className="flex items-center gap-2">
//             <span className="text-gray-400">{chat.title}</span>
//             <span className="text-gray-500">◆</span>
//             <span className="text-gray-400">{currentVersion + 1}.0</span>
//           </div>
//           <button
//             className="inline-flex h-7 items-center gap-1 rounded bg-violet-600 px-3 text-sm text-white transition enabled:hover:bg-violet-700 disabled:opacity-50"
//             onClick={() => setRefresh(r => r + 1)}
//           >
//             <RefreshCw className="size-4" />
//           </button>
//         </div>

//         {layout === "tabbed" && (
//           <div className="relative rounded-lg border-2 border-gray-200 p-1">
//             {/* Sliding background */}
//             <div
//               className="absolute inset-y-1 w-16 rounded bg-violet-600 transition-transform duration-200 ease-in-out"
//               style={{
//                 transform: `translateX(${activeTab === "preview" ? "100%" : "0%"})`
//               }}
//             />
//             <div className="relative flex">
//               <button
//                 onClick={() => onTabChange("code")}
//                 className={`inline-flex h-7 w-16 items-center justify-center rounded text-xs font-medium transition-colors duration-200 ${
//                   activeTab === "code" ? "text-white" : "text-gray-700"
//                 }`}
//               >
//                 Code
//               </button>
//               <button
//                 onClick={() => onTabChange("preview")}
//                 className={`inline-flex h-7 w-16 items-center justify-center rounded text-xs font-medium transition-colors duration-200 ${
//                   activeTab === "preview" ? "text-white" : "text-gray-700"
//                 }`}
//               >
//                 Preview
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import CodeRunner from "@/components/code-runner";
import { RefreshCw } from "lucide-react";
import SyntaxHighlighter from "@/components/syntax-highlighter";
import type { Chat, Message, CodeBlock } from "./page.client";
import { StickToBottom } from "use-stick-to-bottom";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

type CodeViewerProps = {
  chat: Chat;
  codeBlocks: CodeBlock[];
  message?: Message;
  onMessageChange: (v: Message) => void;
  activeTab: "code" | "preview";
  onTabChange: (v: "code" | "preview") => void;
};

export default function CodeViewer({
  chat,
  codeBlocks,
  message,
  onMessageChange,
  activeTab,
  onTabChange,
}: CodeViewerProps) {
  const [refresh, setRefresh] = useState(0);
  const { submitting } = useSelector((state: RootState) => state.error);
  const generatingBlockRef = useRef<HTMLDivElement>(null);
  const lastGeneratingBlockRef = useRef<string | undefined>(undefined);
  const userHasScrolledRef = useRef(false);

  const layout = ["python", "ts", "js", "javascript", "typescript"].includes(
    codeBlocks[0]?.language?.toLowerCase() || ""
  ) ? "two-up" : "tabbed";

  const assistantMessages = chat.messages.filter((m) => m.role === "assistant");
  const currentVersion = codeBlocks.length > 0
    ? assistantMessages.length
    : message
      ? assistantMessages.findIndex(m => m.id === message.id)
      : 0;

  useEffect(() => {
    if (submitting && activeTab === "preview") {
      onTabChange("code");
    }
  }, [submitting, activeTab, onTabChange]);

  // Reset user scroll flag when switching tabs or when all blocks complete
  useEffect(() => {
    const hasGeneratingBlock = codeBlocks.some(block => block.status === "generating");
    if (!hasGeneratingBlock || activeTab !== "code") {
      userHasScrolledRef.current = false;
    }
  }, [codeBlocks, activeTab]);

  // Handle scroll detection
  const handleScroll = () => {
    userHasScrolledRef.current = true;
  };

  // Auto-scroll to generating block only when new block starts generating
  useEffect(() => {
    const generatingBlock = codeBlocks.find(block => block.status === "generating");
    const generatingBlockId = generatingBlock?.filename?.name;
    
    if (
      activeTab === "code" && 
      generatingBlock && 
      generatingBlockId && 
      generatingBlockId !== lastGeneratingBlockRef.current &&
      !userHasScrolledRef.current &&
      generatingBlockRef.current
    ) {
      generatingBlockRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
      lastGeneratingBlockRef.current = generatingBlockId;
    }
  }, [codeBlocks, activeTab]);

  const renderCodeBlock = (block: CodeBlock, index: number) => (
    <div 
    key={`${block.filename?.name}-${block.content?.slice(0, 10)}-${index}`} // More unique key
      className="flex flex-col"
      ref={block.status === "generating" ? generatingBlockRef : undefined}
    >
      <div className={`mb-2 text-sm font-medium flex items-center gap-2 ${
        block.status === "generating" ? "text-violet-400" : "text-gray-400"
      }`}>
        {block.filename?.name}
        {block.status === "generating" && (
          <span className="text-xs bg-violet-600/20 text-violet-400 px-2 py-0.5 rounded-full">
            Generating...
          </span>
        )}
      </div>
      <div className={`rounded-lg border transition-all duration-300 ${
        block.status === "generating" 
          ? "border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.1)]" 
          : "border-gray-700/30"
      }`}>
        <SyntaxHighlighter 
          code={block.content || ""} 
          language={block.language || ""} 
        />
      </div>
    </div>
  );

  return (
    <div className="flex h-full flex-col bg-white">
      {layout === "tabbed" ? (
        <div className="relative flex grow overflow-hidden">
          {/* Code View */}
          <div 
            className="absolute inset-0 w-full bg-[#14171f] transition-all duration-300 ease-in-out"
            style={{
              opacity: activeTab === "code" ? 1 : 0,
              transform: `translateX(${activeTab === "code" ? "0%" : "-100%"})`,
              pointerEvents: activeTab === "code" ? "auto" : "none"
            }}
          >
            <StickToBottom
              className="h-full overflow-hidden"
              resize="smooth"
              initial={submitting ? "smooth" : false}
              onScroll={handleScroll}
            >
              <StickToBottom.Content>
                <div className="flex flex-col space-y-8 p-6">
                  {codeBlocks.map((block, index) => renderCodeBlock(block, index))}
                </div>
              </StickToBottom.Content>
            </StickToBottom>
          </div>

          {/* Preview View */}
          <div 
            className="absolute inset-0 w-full transition-all duration-300 ease-in-out"
            style={{
              opacity: activeTab === "preview" ? 1 : 0,
              transform: `translateX(${activeTab === "preview" ? "0%" : "100%"})`,
              pointerEvents: activeTab === "preview" ? "auto" : "none"
            }}
          >
            {!submitting && (
              <div className="flex h-full items-center justify-center">
                <CodeRunner codeBlocks={codeBlocks} key={refresh} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex grow flex-col">
          <div className="h-1/2 overflow-y-auto p-6">
            <div className="flex flex-col space-y-8">
              {codeBlocks.map((block, index) => renderCodeBlock(block, index))}
            </div>
          </div>
          <div className="flex h-1/2 flex-col">
            <div className="px-4 py-4 text-gray-700">
              Output
            </div>
            <div className="flex grow items-center justify-center">
              {!submitting && (
                <CodeRunner codeBlocks={codeBlocks} key={refresh} />
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-600/20 bg-[#14171f] px-1.5 py-1.5">
        <div className="inline-flex items-center gap-4">
          <div className="flex items-center gap-2">
            {/* <span className="text-gray-400">{chat.title}</span> */}
            <span className="text-gray-500">◆</span>
            {/* <span className="text-gray-400">{currentVersion + 1}.0</span> */}
          </div>
          <button
            className="inline-flex h-7 items-center gap-1 rounded bg-violet-600 px-3 text-sm text-white transition enabled:hover:bg-violet-700 disabled:opacity-50"
            onClick={() => setRefresh(r => r + 1)}
          >
            <RefreshCw className="size-4" />
          </button>
        </div>

        {layout === "tabbed" && (
          <div className="relative rounded-lg border-2 border-gray-200 p-1">
            {/* Sliding background */}
            <div
              className="absolute inset-y-1 w-16 rounded bg-violet-600 transition-transform duration-200 ease-in-out"
              style={{
                transform: `translateX(${activeTab === "preview" ? "100%" : "0%"})`
              }}
            />
            <div className="relative flex">
              <button
                onClick={() => onTabChange("code")}
                className={`inline-flex h-7 w-16 items-center justify-center rounded text-xs font-medium transition-colors duration-200 ${
                  activeTab === "code" ? "text-white" : "text-gray-700"
                }`}
              >
                Code
              </button>
              <button
                onClick={() => onTabChange("preview")}
                className={`inline-flex h-7 w-16 items-center justify-center rounded text-xs font-medium transition-colors duration-200 ${
                  activeTab === "preview" ? "text-white" : "text-gray-700"
                }`}
              >
                Preview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}