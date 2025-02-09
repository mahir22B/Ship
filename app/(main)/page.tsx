// "use client";

// import Fieldset from "@/components/fieldset";
// import { ArrowUpIcon, ArrowRightIcon, Paperclip } from "lucide-react";
// // import UploadIcon from "@/components/icons/upload-icon";
// import LoadingButton from "@/components/loading-button";
// import Spinner from "@/components/spinner";
// import { XCircleIcon } from "@heroicons/react/20/solid";
// import { useRouter } from "next/navigation";
// import { use, useState, useRef, useTransition } from "react";
// import TextareaAutosize from "react-textarea-autosize";
// import { streamCompletion } from "./actions";
// import { Context } from "./providers";
// import { useS3Upload } from "next-s3-upload";

// export default function Home() {
//   const { setStreamPromise } = use(Context);
//   const router = useRouter();

//   const [prompt, setPrompt] = useState("");
//   const [screenshotUrl, setScreenshotUrl] = useState<string | undefined>(
//     undefined,
//   );
//   const [screenshotLoading, setScreenshotLoading] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const [isPending, startTransition] = useTransition();

//   const { uploadToS3 } = useS3Upload();
//   const handleScreenshotUpload = async (event: any) => {
//     if (prompt.length === 0) setPrompt("Build this");
//     setScreenshotLoading(true);
//     let file = event.target.files[0];
//     // const { url } = await uploadToS3(file);
//     // setScreenshotUrl(url);
//     setScreenshotLoading(false);
//   };

//   return (
//     <div className="relative flex grow flex-col bg-black text-white">
//       <div className="absolute inset-0 flex justify-center">
//         {/* Background image commented out as in original */}
//       </div>

//       <div className="isolate flex h-full grow flex-col">
//         {/* <Header /> */}

//         <div className="mt-10 flex grow flex-col items-center px-4 lg:mt-16">
//           <h1 className="mt-4 text-balance text-center text-4xl leading-none text-white md:text-[64px] lg:mt-8">
//             Let's <span className="text-violet-500">build</span> your{" "}
//             <span className="text-violet-500">idea</span>
//           </h1>

//           <form
//             className="relative mt-8 w-full max-w-6xl pt-6 lg:pt-12"
//             onSubmit={async (e) => {
//               e.preventDefault();
//               startTransition(async () => {
//                 try {
//                   const stream = await streamCompletion(prompt, screenshotUrl);
//                   setStreamPromise(Promise.resolve(stream));
//                   const chatId = Date.now().toString();
//                   const newChat = {
//                     id: chatId,
//                     title: "New Chat",
//                     prompt: prompt, // This preserves the initial prompt
//                     messages: []
//                   };

//                      // Store it in a db later
//                    localStorage.setItem(`chat-${chatId}`, JSON.stringify(newChat));

//                   router.push(`/chats/${chatId}`);
//                 } catch (error) {
//                   console.error("Error in form submission:", error);
//                 }
//               });
//             }}
//           >
//             <Fieldset>
//               <div className="group relative w-full">
//                 <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 blur transition-opacity duration-500 group-focus-within:opacity-100" />
//                 <div className="relative flex min-h-[300px] rounded-xl bg-[#14171f] pb-10">
//                   <div className="w-full">
//                     {screenshotLoading && (
//                       <div className="relative mx-3 mt-3">
//                         <div className="rounded-xl">
//                           <div className="group mb-2 flex h-16 w-[68px] animate-pulse items-center justify-center rounded bg-[#1a1d27]">
//                             <Spinner />
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                     {screenshotUrl && (
//                       <div
//                         className={`${isPending ? "invisible" : ""} relative mx-3 mt-3`}
//                       >
//                         <div className="rounded-xl">
//                           <img
//                             alt="screenshot"
//                             src={screenshotUrl}
//                             className="group relative mb-2 h-16 w-[68px] rounded"
//                           />
//                         </div>
//                         <button
//                           type="button"
//                           id="x-circle-icon"
//                           className="absolute -right-3 -top-4 left-14 z-10 size-5 rounded-full bg-[#14171f] text-gray-400 hover:text-gray-300"
//                           onClick={() => {
//                             setScreenshotUrl(undefined);
//                             if (fileInputRef.current) {
//                               fileInputRef.current.value = "";
//                             }
//                           }}
//                         >
//                           <XCircleIcon />
//                         </button>
//                       </div>
//                     )}
//                     <TextareaAutosize
//                       placeholder="Describe your app or website idea..."
//                       required
//                       name="prompt"
//                       rows={1}
//                       className="peer relative min-h-[200px] w-full resize-none bg-transparent p-8 pr-16 text-xl text-white placeholder-gray-500 focus-visible:outline-none disabled:opacity-50"
//                       value={prompt}
//                       onChange={(e) => setPrompt(e.target.value)}
//                       onKeyDown={(event) => {
//                         if (event.key === "Enter" && !event.shiftKey) {
//                           event.preventDefault();
//                           event.currentTarget.form?.requestSubmit();
//                         }
//                       }}
//                     />
//                   </div>

//                   <div className="absolute bottom-2 left-2 right-2.5 flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <div>
//                         <label
//                           htmlFor="screenshot"
//                           className="flex cursor-pointer gap-2 text-sm text-gray-400 hover:text-gray-300"
//                         >
//                           <div className="flex size-6 items-center justify-center rounded bg-[#1a1d27] hover:bg-[#22252f]">
//                             <Paperclip className="size-4" />
//                           </div>
//                           {/* <div className="flex items-center justify-center transition">
//                             Attach
//                           </div> */}
//                         </label>
//                         <input
//                           id="screenshot"
//                           type="file"
//                           accept="image/png, image/jpeg, image/webp"
//                           onChange={handleScreenshotUpload}
//                           className="hidden"
//                           ref={fileInputRef}
//                         />
//                       </div>
//                     </div>

//                     <div className="relative flex shrink-0 has-[:disabled]:opacity-50">
//                     <LoadingButton
//         className={`relative inline-flex size-10 items-center justify-center rounded-full transition-all duration-300 ${
//           prompt
//             ? "bg-violet-600 hover:bg-violet-700"
//             : "bg-gray-700"
//         }`}
//         type="submit"
//         disabled={isPending}
//       >
//         {isPending ? (
//           <Spinner className="h-5 w-5" />
//         ) : (
//           <>
//             <ArrowUpIcon
//               className={`absolute h-5 w-5 transform transition-all duration-300 ${
//                 prompt
//                   ? "rotate-90 opacity-0"
//                   : "rotate-0 opacity-100"
//               }`}
//             />
//             <ArrowRightIcon
//               className={`absolute h-5 w-5 transform transition-all duration-300  ${
//                 prompt
//                   ? "rotate-0 opacity-100"
//                   : "-rotate-90 opacity-0"
//               }`}
//             />
//           </>
//         )}
//       </LoadingButton>
//                     </div>
//                   </div>

//                   {/* {isPending && (
//                     <LoadingMessage screenshotUrl={screenshotUrl} />
//                   )} */}
//                 </div>
//               </div>
//               <div className="mt-4 flex w-full flex-wrap justify-center gap-3">
//                 {/* {SUGGESTED_PROMPTS.map((v) => (
//                   <button
//                     key={v.title}
//                     type="button"
//                     onClick={() => setPrompt(v.description)}
//                     className="rounded-xl bg-[#14171f] px-6 py-2 text-sm text-gray-400 hover:bg-[#1a1d27] transition-colors"
//                   >
//                     {v.title}
//                   </button>
//                 ))} */}
//               </div>
//             </Fieldset>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// // function LoadingMessage({
// //   screenshotUrl,
// // }: {
// //   screenshotUrl: string | undefined;
// // }) {
// //   return (
// //     <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-[#14171f] px-1 py-3 md:px-3">
// //       <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
// //         <span className="animate-pulse text-balance text-center text-sm md:text-base">
// //           {screenshotUrl
// //             ? "Analyzing your screenshot..."
// //             : "Building your app..."}
// //         </span>
// //         <Spinner />
// //       </div>
// //     </div>
// //   );
// // }

// export const maxDuration = 45;


"use client";

import Fieldset from "@/components/fieldset";
import { ArrowUpIcon, ArrowRightIcon, Paperclip } from "lucide-react";
import LoadingButton from "@/components/loading-button";
import Spinner from "@/components/spinner";
import { XCircleIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import { use, useState, useRef, useTransition, useEffect } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { streamCompletion } from "./actions";
import { Context } from "./providers";
import { useS3Upload } from "next-s3-upload";
import { checkUserCredit, createChat, deductUserCredit, initializeUserCredit } from "@/lib/supabase/db";
import AuthModal from '@/components/auth-modal';
import { supabase } from '@/lib/supabase/client';
import NavBar from './NavBar';
import { formatDistanceToNow } from 'date-fns';
import InsufficientCreditsDialog from "./InsufficientCreditsDialog";

export default function Home() {
  const { setStreamPromise } = use(Context);
  const router = useRouter();
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [screenshotUrl, setScreenshotUrl] = useState(undefined);
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [pendingPrompt, setPendingPrompt] = useState(null);

  const [isPending, startTransition] = useTransition();
  const [showInsufficientCredits, setShowInsufficientCredits] = useState(false);

  const { uploadToS3 } = useS3Upload();

  // Listen for auth changes and fetch projects
  useEffect(() => {
    // Get initial session and fetch projects
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProjects();
      } else {
        setProjects([]);
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setProjects([]);
        setIsLoading(false);
      } else {
        fetchProjects();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    const { data: chats, error } = await supabase
      .from('chats')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) {
      setProjects(chats);
    }
    setIsLoading(false);
  };
  
  const handleScreenshotUpload = async (event) => {
    if (prompt.length === 0) setPrompt("Build this");
    setScreenshotLoading(true);
    let file = event.target.files[0];
    // const { url } = await uploadToS3(file);
    // setScreenshotUrl(url);
    setScreenshotLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setPendingPrompt({ prompt, screenshotUrl });
      setIsAuthModalOpen(true);
      return;
    }

    startTransition(async () => {
      try {
        const hasCredits = await checkUserCredit(session.user.id);
        if (!hasCredits) {
          // Handle no credits - you can show an error or redirect to purchase
          setShowInsufficientCredits(true);
          return;
        }
        const chat = await createChat("New Chat", prompt);
        const stream = await streamCompletion(prompt, screenshotUrl);
        setStreamPromise(Promise.resolve(stream));
        router.push(`/chats/${chat.id}`);
        await deductUserCredit(session.user.id);
      } catch (error) {
        console.error("Error in form submission:", error);
      }
    });
  };

  const handleAuthSuccess = async() => {
    setIsAuthModalOpen(false);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      try {
        // Initialize credit record
        await initializeUserCredit(session.user.id, session.user.email ?? '');
      } catch (error) {
        console.error('Error managing credit record:', error);
      }
    }
    if (pendingPrompt) {
      const { prompt: savedPrompt, screenshotUrl: savedScreenshot } = pendingPrompt;
      setPrompt(savedPrompt);
      setScreenshotUrl(savedScreenshot);
      setPendingPrompt(null);
      startTransition(async () => {
        try {
          const chat = await createChat("New Chat", savedPrompt);
          const stream = await streamCompletion(savedPrompt, savedScreenshot);
          setStreamPromise(Promise.resolve(stream));
          router.push(`/chats/${chat.id}`);
        } catch (error) {
          console.error("Error in form submission after auth:", error);
        }
      });
    }
  };

  return (
    <div className="relative flex grow flex-col bg-black text-white overflow-auto">
      <div className="absolute inset-0 flex justify-center" />
      <NavBar onSignIn={() => setIsAuthModalOpen(true)} />

      <div className="isolate flex h-full grow flex-col">
        <div className="mt-10 flex grow flex-col items-center px-4 lg:mt-16">
          <h1 className="mt-4 text-balance text-center text-4xl leading-none text-white md:text-[64px] lg:mt-8">
            Let's <span className="text-violet-500">build</span> your{" "}
            <span className="text-violet-500">idea</span>
          </h1>

          <form
            className="relative mt-8 w-full max-w-6xl pt-6 lg:pt-12"
            onSubmit={handleSubmit}
          >
            <Fieldset>
              <div className="group relative w-full">
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 blur transition-opacity duration-500 group-focus-within:opacity-100" />
                <div className="relative flex min-h-[300px] rounded-xl bg-[#14171f] pb-10">
                  <div className="w-full">
                    {screenshotLoading && (
                      <div className="relative mx-3 mt-3">
                        <div className="rounded-xl">
                          <div className="group mb-2 flex h-16 w-[68px] animate-pulse items-center justify-center rounded bg-[#1a1d27]">
                            <Spinner />
                          </div>
                        </div>
                      </div>
                    )}
                    {screenshotUrl && (
                      <div className={`${isPending ? "invisible" : ""} relative mx-3 mt-3`}>
                        <div className="rounded-xl">
                          <img
                            alt="screenshot"
                            src={screenshotUrl}
                            className="group relative mb-2 h-16 w-[68px] rounded"
                          />
                        </div>
                        <button
                          type="button"
                          id="x-circle-icon"
                          className="absolute -right-3 -top-4 left-14 z-10 size-5 rounded-full bg-[#14171f] text-gray-400 hover:text-gray-300"
                          onClick={() => {
                            setScreenshotUrl(undefined);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                        >
                          <XCircleIcon />
                        </button>
                      </div>
                    )}
                    <TextareaAutosize
                      placeholder="Describe your app or website idea..."
                      required
                      name="prompt"
                      rows={1}
                      className="peer relative min-h-[200px] w-full resize-none bg-transparent p-8 pr-16 text-xl text-white placeholder-gray-500 focus-visible:outline-none disabled:opacity-50"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          event.currentTarget.form?.requestSubmit();
                        }
                      }}
                    />
                  </div>

                  <div className="absolute bottom-2 left-2 right-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <label
                          htmlFor="screenshot"
                          className="flex cursor-pointer gap-2 text-sm text-gray-400 hover:text-gray-300"
                        >
                          <div className="flex size-6 items-center justify-center rounded bg-[#1a1d27] hover:bg-[#22252f]">
                            <Paperclip className="size-4" />
                          </div>
                        </label>
                        <input
                          id="screenshot"
                          type="file"
                          accept="image/png, image/jpeg, image/webp"
                          onChange={handleScreenshotUpload}
                          className="hidden"
                          ref={fileInputRef}
                        />
                      </div>
                    </div>

                    <div className="relative flex shrink-0 has-[:disabled]:opacity-50">
                      <LoadingButton
                        className={`relative inline-flex size-10 items-center justify-center rounded-full transition-all duration-300 ${
                          prompt
                            ? "bg-violet-600 hover:bg-violet-700"
                            : "bg-gray-700"
                        }`}
                        type="submit"
                        disabled={isPending}
                      >
                        {isPending ? (
                          <Spinner className="h-5 w-5" />
                        ) : (
                          <>
                            <ArrowUpIcon
                              className={`absolute h-5 w-5 transform transition-all duration-300 ${
                                prompt
                                  ? "rotate-90 opacity-0"
                                  : "rotate-0 opacity-100"
                              }`}
                            />
                            <ArrowRightIcon
                              className={`absolute h-5 w-5 transform transition-all duration-300  ${
                                prompt
                                  ? "rotate-0 opacity-100"
                                  : "-rotate-90 opacity-0"
                              }`}
                            />
                          </>
                        )}
                      </LoadingButton>
                    </div>
                  </div>
                </div>
              </div>
            </Fieldset>
          </form>

          {/* Projects Section */}
          <div className="w-full max-w-6xl mt-16 mb-24">
            {isLoading ? (
              <div className="flex justify-center">
                <Spinner className="h-8 w-8" />
              </div>
            ) : projects.length > 0 ? (
              <>
                <h2 className="text-2xl font-semibold mb-6 px-4">My Projects</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
                  {projects.map((project) => (
                    <a
                      key={project.id}
                      href={`/chats/${project.id}`}
                      className="block p-6 rounded-lg bg-[#14171f] border border-gray-800 hover:border-violet-500 transition-colors duration-200 aspect-square"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <p className="text-gray-300 line-clamp-2 flex-1">
                          {project.initial_prompt}
                        </p>
                        <span className="text-sm text-gray-500 whitespace-nowrap">
                          {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-8 text-center text-gray-400">
                {/* <h3 className="text-lg font-medium">No projects yet</h3>
                <p className="mt-1">Your projects will appear here once you create them</p> */}
              </div>
            )}
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
       <InsufficientCreditsDialog
        isOpen={showInsufficientCredits}
        onClose={() => setShowInsufficientCredits(false)}
      />
    </div>
  );
}

export const maxDuration = 45;