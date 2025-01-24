"use client";

import Fieldset from "@/components/fieldset";
import { ArrowUpIcon, ArrowRightIcon, Paperclip } from "lucide-react";
// import UploadIcon from "@/components/icons/upload-icon";
import LoadingButton from "@/components/loading-button";
import Spinner from "@/components/spinner";
import { XCircleIcon } from "@heroicons/react/20/solid";
import { useRouter } from "next/navigation";
import { use, useState, useRef, useTransition } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { streamCompletion } from "./actions";
import { Context } from "./providers";
import { useS3Upload } from "next-s3-upload";

export default function Home() {
  const { setStreamPromise } = use(Context);
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState<string | undefined>(
    undefined,
  );
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isPending, startTransition] = useTransition();

  const { uploadToS3 } = useS3Upload();
  const handleScreenshotUpload = async (event: any) => {
    if (prompt.length === 0) setPrompt("Build this");
    setScreenshotLoading(true);
    let file = event.target.files[0];
    // const { url } = await uploadToS3(file);
    // setScreenshotUrl(url);
    setScreenshotLoading(false);
  };

  return (
    <div className="relative flex grow flex-col bg-black text-white">
      <div className="absolute inset-0 flex justify-center">
        {/* Background image commented out as in original */}
      </div>

      <div className="isolate flex h-full grow flex-col">
        {/* <Header /> */}

        <div className="mt-10 flex grow flex-col items-center px-4 lg:mt-16">
          <h1 className="mt-4 text-balance text-center text-4xl leading-none text-white md:text-[64px] lg:mt-8">
            Let's <span className="text-violet-500">build</span> your{" "}
            <span className="text-violet-500">idea</span>
          </h1>

          <form
            className="relative mt-8 w-full max-w-6xl pt-6 lg:pt-12"
            onSubmit={async (e) => {
              e.preventDefault();
              startTransition(async () => {
                try {
                  const stream = await streamCompletion(prompt, screenshotUrl);
                  setStreamPromise(Promise.resolve(stream));
                  const chatId = Date.now().toString();
                  const newChat = {
                    id: chatId,
                    title: "New Chat",
                    prompt: prompt, // This preserves the initial prompt
                    messages: []
                  };

                     // Store it in a db later
                   localStorage.setItem(`chat-${chatId}`, JSON.stringify(newChat));

                  router.push(`/chats/${chatId}`);
                } catch (error) {
                  console.error("Error in form submission:", error);
                }
              });
            }}
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
                      <div
                        className={`${isPending ? "invisible" : ""} relative mx-3 mt-3`}
                      >
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
                          {/* <div className="flex items-center justify-center transition">
                            Attach
                          </div> */}
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

                  {/* {isPending && (
                    <LoadingMessage screenshotUrl={screenshotUrl} />
                  )} */}
                </div>
              </div>
              <div className="mt-4 flex w-full flex-wrap justify-center gap-3">
                {/* {SUGGESTED_PROMPTS.map((v) => (
                  <button
                    key={v.title}
                    type="button"
                    onClick={() => setPrompt(v.description)}
                    className="rounded-xl bg-[#14171f] px-6 py-2 text-sm text-gray-400 hover:bg-[#1a1d27] transition-colors"
                  >
                    {v.title}
                  </button>
                ))} */}
              </div>
            </Fieldset>
          </form>
        </div>
      </div>
    </div>
  );
}

// function LoadingMessage({
//   screenshotUrl,
// }: {
//   screenshotUrl: string | undefined;
// }) {
//   return (
//     <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-[#14171f] px-1 py-3 md:px-3">
//       <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
//         <span className="animate-pulse text-balance text-center text-sm md:text-base">
//           {screenshotUrl
//             ? "Analyzing your screenshot..."
//             : "Building your app..."}
//         </span>
//         <Spinner />
//       </div>
//     </div>
//   );
// }

export const maxDuration = 45;
