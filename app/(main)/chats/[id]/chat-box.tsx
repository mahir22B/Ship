// "use client";

// import { ArrowUp } from "lucide-react";
// import Spinner from "@/components/spinner";
// import { useRouter } from "next/navigation";
// import { useEffect, useRef, useTransition } from "react";
// import TextareaAutosize from "react-textarea-autosize";
// import { CodeModificationRequest, streamCodeModification, streamCompletion } from "../../actions";
// import { useSelector } from "react-redux";
// import { RootState } from "@/store";
// import { CodeBlock } from "./page.client";

// export type Message = {
//   id: string;
//   content: string;
//   role: "user" | "assistant";
// };

// export type Chat = {
//   id: string;
//   title: string;
//   prompt: string;
//   messages: Message[];
// };

// type ChatBoxProps = {
//   chat: Chat;
//   onNewStreamPromise: (v: Promise<ReadableStream>) => void;
//   isStreaming: boolean;
//   onChatUpdate: (newChat: Chat) => void;
//   codeBlocks: CodeBlock[];
// };

// // interface UserMessage {
// //   role: 'user';
// //   content: string;
// //   timestamp: string; // ISO string timestamp
// // }

// // interface ConversationContext {
// //   conversation_id: string;
// //   context: {
// //     topic: string;
// //     initial_request: string;
// //     created_at: string; // When the conversation started
// //   };
// //   messages: UserMessage[];
// // }

// // interface ConversationHistory {
// //   conversations: ConversationContext[];
// // }

// export default function ChatBox({
//   chat,
//   onNewStreamPromise,
//   isStreaming,
//   onChatUpdate,
//   codeBlocks,
// }: ChatBoxProps) {
//   const [isPending, startTransition] = useTransition();
//   const router = useRouter();
//   const disabled = isPending || isStreaming;
//   const didFocusOnce = useRef(false);
//   const textareaRef = useRef<HTMLTextAreaElement>(null);
//   const formRef = useRef<HTMLFormElement>(null);

//   // Get error state from Redux
//   const { lastSubmittedError, submitting } = useSelector((state: RootState) => state.error);

//   useEffect(() => {
//     // When an error message is available, set it in the textarea
//     if (lastSubmittedError && textareaRef.current) {
//       textareaRef.current.value = `For the given code, think step by step and fix this error: ${lastSubmittedError}?`;
//       textareaRef.current.focus();
//     }
//   }, [lastSubmittedError]);

//   useEffect(() => {
//     if (!textareaRef.current) return;

//     if (!disabled && !didFocusOnce.current) {
//       textareaRef.current.focus();
//       didFocusOnce.current = true;
//     } else {
//       didFocusOnce.current = false;
//     }
//   }, [disabled]);

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     const formData = new FormData(e.currentTarget);
//     const prompt = formData.get("prompt");
    
//     if (typeof prompt !== "string" || !prompt) return;
  
//     startTransition(async () => {
//       try {
//         // Create new message object
//         const newMessage: Message = {
//           id: Date.now().toString(),
//           content: prompt,
//           role: "user"
//         };

//         // Update chat with new message
//         const updatedChat = {
//           ...chat,
//           messages: [...chat.messages, newMessage]
//         };
//         onChatUpdate(updatedChat);

//         // If this is the first message, use streamCompletion
//         if (chat.messages.length === 0) {
//           const stream = await streamCompletion(prompt);
//           onNewStreamPromise(Promise.resolve(stream));
//         } else {
//           // For follow-up messages, use streamCodeModification
//           // console.log("Its a modification request")
//           const modificationRequest: CodeModificationRequest = {
//             chatHistory: {
//               messages: updatedChat.messages.map(m => ({
//                 content: m.content,
//                 role: m.role,
//                 timestamp: parseInt(m.id)
//               }))
//             },
//             currentCode: {
//               files: codeBlocks.map(block => ({
//                 name: block.filename.name,
//                 extension: block.filename.extension,
//                 path: 'src/components',
//                 content: block.content
//               }))
//             },
//             newMessage: prompt
//           };
//           const stream = await streamCodeModification(modificationRequest);
//           onNewStreamPromise(Promise.resolve(stream));
//         }

//         // Clear the textarea
//         if (formRef.current) {
//           formRef.current.reset();
//         }
//         if (textareaRef.current) {
//           textareaRef.current.value = '';
//         }

//         // Update localStorage
//         localStorage.setItem(`chat-${chat.id}`, JSON.stringify(updatedChat));
//       } catch (error) {
//         console.error('Error in chat submission:', error);
//       }
//     });
//   };

//   return (
//     <div className="mx-auto mb-5 flex w-full max-w-prose shrink-0 px-8 bg-black">
//       <form
//         ref={formRef}
//         className="relative flex w-full"
//         onSubmit={handleSubmit}
//       >
//         <fieldset className="w-full" disabled={disabled || submitting}>
//           <div className="relative flex rounded-xl bg-[#1e1e1e] focus-within:bg-zinc-700 transition-colors">
//             <TextareaAutosize
//               ref={textareaRef}
//               placeholder="Ask your follow up here..."
//               autoFocus={!disabled}
//               required
//               name="prompt"
//               rows={2}
//               minRows={2}
//               className="peer relative w-full resize-none bg-transparent p-3 placeholder-gray-400 focus:outline-none disabled:opacity-50 rounded-xl text-white"
//               onKeyDown={(event) => {
//                 if (event.key === "Enter" && !event.shiftKey) {
//                   event.preventDefault();
//                   event.currentTarget.form?.requestSubmit();
//                 }
//               }}
//             />
            
//             <button
//               className="absolute bottom-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white transition enabled:hover:bg-violet-700 disabled:opacity-50"
//               type="submit"
//             >
//               <Spinner loading={disabled || submitting}>
//                 <ArrowUp className="size-4" />
//               </Spinner>
//             </button>
//           </div>
//         </fieldset>
//       </form>
//     </div>
//   );
// }

"use client";

import { ArrowUp } from "lucide-react";
import Spinner from "@/components/spinner";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { CodeModificationRequest, streamCodeModification, streamCompletion } from "../../actions";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { CodeBlock } from "./page.client";
import { addMessage, checkUserCredit, deductUserCredit, getMessages } from "@/lib/supabase/db";
import { supabase } from "@/lib/supabase/client";
import InsufficientCreditsDialog from "../../InsufficientCreditsDialog";

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

type ChatBoxProps = {
  chat: Chat;
  onNewStreamPromise: (v: Promise<ReadableStream>) => void;
  isStreaming: boolean;
  onChatUpdate: (newChat: Chat) => void;
  codeBlocks: CodeBlock[];
};

export default function ChatBox({
  chat,
  onNewStreamPromise,
  isStreaming,
  onChatUpdate,
  codeBlocks,
}: ChatBoxProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const disabled = isPending || isStreaming;
  const didFocusOnce = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [showInsufficientCredits, setShowInsufficientCredits] = useState(false);


  // Get error state from Redux
  const { lastSubmittedError, submitting } = useSelector((state: RootState) => state.error);

  useEffect(() => {
    // When an error message is available, set it in the textarea
    if (lastSubmittedError && textareaRef.current) {
      textareaRef.current.value = `For the given code, think step by step and fix this error: ${lastSubmittedError}?`;
      textareaRef.current.focus();
    }
  }, [lastSubmittedError]);

  useEffect(() => {
    if (!textareaRef.current) return;

    if (!disabled && !didFocusOnce.current) {
      textareaRef.current.focus();
      didFocusOnce.current = true;
    } else {
      didFocusOnce.current = false;
    }
  }, [disabled]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const prompt = formData.get("prompt");
    
    if (typeof prompt !== "string" || !prompt) return;
  
    console.log('=== Submit handler started ===');
    console.log('Current chat state:', chat);
  
    startTransition(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        // Check credits
        const hasCredits = await checkUserCredit(session.user.id);
        if (!hasCredits) {
          setShowInsufficientCredits(true);
          return;
        }
        console.log('Adding message to Supabase...');
        const savedMessage = await addMessage(chat.id, prompt, "user");
        console.log('Message saved:', savedMessage);
        
        const messages = await getMessages(chat.id);
        console.log('Messages fetched:', messages);
  
        console.log('Updating chat state...');
        const updatedChat = {
          ...chat,
          messages: messages
        };
        console.log('New chat state:', updatedChat);
        onChatUpdate(updatedChat);
  
        // Start stream based on whether it's first message or follow-up
        if (chat.messages.length === 0) {
          console.log('Starting initial stream...');
          const stream = await streamCompletion(prompt);
          onNewStreamPromise(Promise.resolve(stream));
        } else {
          console.log('Starting modification stream...');
          const modificationRequest: CodeModificationRequest = {
            chatHistory: {
              messages: messages.map(m => ({
                content: m.content,
                role: m.role,
                timestamp: typeof m.id === 'string' ? parseInt(m.id) : Date.now()
              }))
            },
            currentCode: {
              files: codeBlocks.map(block => ({
                name: block.filename.name,
                extension: block.filename.extension,
                path: 'src/components',
                content: block.content
              }))
            },
            newMessage: prompt
          };
          console.log('Modification request:', modificationRequest);
          const stream = await streamCodeModification(modificationRequest);
          onNewStreamPromise(Promise.resolve(stream));
        }
  
        // Clear the form
        if (formRef.current) {
          formRef.current.reset();
        }
        if (textareaRef.current) {
          textareaRef.current.value = '';
        }
        console.log('=== Submit handler completed ===');
        await deductUserCredit(session.user.id);
      } catch (error) {
        console.error('Error in submit handler:', error);
      }
    });
  };

  return (
    <div className="mx-auto mb-5 flex w-full max-w-prose shrink-0 px-8 bg-black">
      <form
        ref={formRef}
        className="relative flex w-full"
        onSubmit={handleSubmit}
      >
        <fieldset className="w-full" disabled={disabled || submitting}>
          <div className="relative flex rounded-xl bg-[#1e1e1e] focus-within:bg-zinc-700 transition-colors">
            <TextareaAutosize
              ref={textareaRef}
              placeholder="Ask your follow up here..."
              autoFocus={!disabled}
              required
              name="prompt"
              rows={2}
              minRows={2}
              className="peer relative w-full resize-none bg-transparent p-3 placeholder-gray-400 focus:outline-none disabled:opacity-50 rounded-xl text-white"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
            />
            
            <button
              className="absolute bottom-2 right-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white transition enabled:hover:bg-violet-700 disabled:opacity-50"
              type="submit"
            >
              <Spinner loading={disabled || submitting}>
                <ArrowUp className="size-4" />
              </Spinner>
            </button>
          </div>
        </fieldset>
      </form>
      <InsufficientCreditsDialog
        isOpen={showInsufficientCredits}
        onClose={() => setShowInsufficientCredits(false)}
      />
    </div>
  );
}