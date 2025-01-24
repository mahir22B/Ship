// "use server";

// import prisma from "@/lib/prisma";
// import { notFound } from "next/navigation";
// import Together from "together-ai";
// import { z } from "zod";
// import {
//   getMainCodingPrompt,
//   screenshotToCodePrompt,
//   softwareArchitectPrompt,
// } from "@/lib/prompts";

// export async function createChat(
//   prompt: string,
//   model: string,
//   quality: "high" | "low",
//   screenshotUrl: string | undefined,
// ) {
//   let options: ConstructorParameters<typeof Together>[0] = {};
//   if (process.env.HELICONE_API_KEY) {
//     options.baseURL = "https://together.helicone.ai/v1";
//     options.defaultHeaders = {
//       "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
//       "Helicone-Property-appname": "LlamaCoder",
//     };
//   }

//   const together = new Together(options);

//   async function fetchTitle() {
//     const responseForChatTitle = await together.chat.completions.create({
//       model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
//       messages: [
//         {
//           role: "system",
//           content:
//             "You are a chatbot helping the user create a simple app or script, and your current job is to create a succinct title, maximum 3-5 words, for the chat given their initial prompt. Please return only the title.",
//         },
//         {
//           role: "user",
//           content: prompt,
//         },
//       ],
//     });
//     const title = responseForChatTitle.choices[0].message?.content || prompt;
//     return title;
//   }

//   async function fetchTopExample() {
//     const findSimilarExamples = await together.chat.completions.create({
//       model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
//       messages: [
//         {
//           role: "system",
//           content: `You are a helpful bot. Given a request for building an app, you match it to the most similar example provided. If the request is NOT similar to any of the provided examples, return "none". Here is the list of examples, ONLY reply with one of them OR "none":

//           - landing page
//           - blog app
//           - quiz app
//           - pomodoro timer
//           `,
//         },
//         {
//           role: "user",
//           content: prompt,
//         },
//       ],
//     });

//     const mostSimilarExample =
//       findSimilarExamples.choices[0].message?.content || "none";
//     return mostSimilarExample;
//   }

//   const [title, mostSimilarExample] = await Promise.all([
//     fetchTitle(),
//     fetchTopExample(),
//   ]);

//   let fullScreenshotDescription;
//   if (screenshotUrl) {
//     const screenshotResponse = await together.chat.completions.create({
//       model: "meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo",
//       temperature: 0.2,
//       max_tokens: 1000,
//       messages: [
//         {
//           role: "user",
//           // @ts-expect-error Need to fix the TypeScript library type
//           content: [
//             { type: "text", text: screenshotToCodePrompt },
//             {
//               type: "image_url",
//               image_url: {
//                 url: screenshotUrl,
//               },
//             },
//           ],
//         },
//       ],
//     });

//     fullScreenshotDescription = screenshotResponse.choices[0].message?.content;
//   }

//   let userMessage: string;
//   if (quality === "high") {
//     let initialRes = await together.chat.completions.create({
//       model: "Qwen/Qwen2.5-Coder-32B-Instruct",
//       messages: [
//         {
//           role: "system",
//           content: softwareArchitectPrompt,
//         },
//         {
//           role: "user",
//           content: fullScreenshotDescription
//             ? fullScreenshotDescription + prompt
//             : prompt,
//         },
//       ],
//       temperature: 0.2,
//       max_tokens: 3000,
//     });

//     userMessage = initialRes.choices[0].message?.content ?? prompt;
//   } else {
//     userMessage =
//       prompt +
//       "RECREATE THIS APP AS CLOSELY AS POSSIBLE: " +
//       fullScreenshotDescription;
//   }

//   const chat = await prisma.chat.create({
//     data: {
//       model,
//       quality,
//       prompt,
//       title,
//       shadcn: true,
//       messages: {
//         createMany: {
//           data: [
//             {
//               role: "system",
//               content: getMainCodingPrompt(mostSimilarExample),
//               position: 0,
//             },
//             { role: "user", content: userMessage, position: 1 },
//           ],
//         },
//       },
//     },
//     include: {
//       messages: true,
//     },
//   });

//   const lastMessage = chat.messages
//     .sort((a, b) => a.position - b.position)
//     .at(-1);
//   if (!lastMessage) throw new Error("No new message");

//   return {
//     chatId: chat.id,
//     lastMessageId: lastMessage.id,
//   };
// }

// export async function createMessage(
//   chatId: string,
//   text: string,
//   role: "assistant" | "user",
// ) {
//   const chat = await prisma.chat.findUnique({
//     where: { id: chatId },
//     include: { messages: true },
//   });
//   if (!chat) notFound();

//   const maxPosition = Math.max(...chat.messages.map((m) => m.position));

//   const newMessage = await prisma.message.create({
//     data: {
//       role,
//       content: text,
//       position: maxPosition + 1,
//       chatId,
//     },
//   });

//   return newMessage;
// }

// export async function getNextCompletionStreamPromise(
//   messageId: string,
//   model: string,
// ) {
//   const message = await prisma.message.findUnique({ where: { id: messageId } });
//   if (!message) notFound();

//   const messagesRes = await prisma.message.findMany({
//     where: { chatId: message.chatId, position: { lte: message.position } },
//     orderBy: { position: "asc" },
//   });

//   const messages = z
//     .array(
//       z.object({
//         role: z.enum(["system", "user", "assistant"]),
//         content: z.string(),
//       }),
//     )
//     .parse(messagesRes);

//   let options: ConstructorParameters<typeof Together>[0] = {};
//   if (process.env.HELICONE_API_KEY) {
//     options.baseURL = "https://together.helicone.ai/v1";
//     options.defaultHeaders = {
//       "Helicone-Auth": `Bearer ${process.env.HELICONE_API_KEY}`,
//       "Helicone-Property-appname": "LlamaCoder",
//       "Helicone-Property-chatId": message.chatId,
//     };
//   }

//   const together = new Together(options);

//   return {
//     streamPromise: new Promise<ReadableStream>(async (resolve) => {
//       const res = await together.chat.completions.create({
//         model,
//         messages: messages.map((m) => ({ role: m.role, content: m.content })),
//         stream: true,
//         temperature: 0.2,
//         max_tokens: 9000,
//       });

//       resolve(res.toReadableStream());
//     }),
//   };
// }



// TODO: Implement Appwrite for:
// - Chat history persistence
// - Message ordering and relationships
// - User session management
// - Chat sharing capabilities
// - Analytics and usage tracking
// 
// Example schema in Appwrite:
// Collection: chats
//   - id: string
//   - created_at: datetime
//   - title: string
//   - user_id: string (relation)
//
// Collection: messages
//   - id: string
//   - chat_id: string (relation)
//   - role: enum("user", "assistant", "system")
//   - content: string
//   - position: number
//   - created_at: datetime


"use server";

import { Anthropic } from "@anthropic-ai/sdk";
import { getMainCodingPrompt } from "@/lib/prompts";

const anthropic = new Anthropic({
  apiKey: "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",
});

// export async function streamCompletion(
//   prompt: string,
//   screenshotUrl?: string
// ) {
//   const userMessage = screenshotUrl 
//     ? `${prompt}\nScreenshot URL: ${screenshotUrl}`
//     : prompt;

//   const stream = await anthropic.messages.stream({
//     model: "claude-3-5-sonnet-20241022",
//     max_tokens: 8192,
//     messages: [
//       {
//         role: "user",
//         content: `For all web apps I ask you to make, have them be beautiful, comprehensive, and not cookie cutter. 
//         Make webpages that are fully featured, comprehensive and worthy for production. 
//         By default, this template supports JSX syntax with Tailwind CSS classes, React hooks, Framer Motion for animations, Shadcn for UI components, recharts for charts, Context api for state management and Lucide React for icons. 
//         DO NOT install other packages for UI themes, icons, etc unless I request them. Use icons from lucide-react for icons, only valid icons you know exist. 
//         Use stock photos from unsplash where appropriate, only valid URLs you know exist. 
//         Do not download the images, only link to them in image tags. DO NOT MENTION THE TECH STACK.${userMessage}`,
//       }
//     ],
//     system: getMainCodingPrompt(),
//   });

//   return stream.toReadableStream();

// }

// actions.ts

function getModificationSystemPrompt() {
  return `You are a React development assistant specializing in code modifications.
Your task is to modify existing code based on user requests while maintaining code quality and structure.

 For any component that needs to be modified or created, ALWAYS wrap it in file path tags:
  {filePath=path/to/file.tsx}

   {/filePath}

 Use exact paths:
  - Root components: {filePath=src/App.tsx}
  - Custom components: {filePath=src/components/ComponentName.tsx}  

 Example 

  {filePath=src/components/TaskList.tsx}
  import { useState } from "react"
  import { Card, CardHeader, CardContent } from "@/components/ui/card"
  import { Input } from "@/components/ui/input"
  import { Button } from "@/components/ui/button"
  import { Plus, Trash } from "lucide-react"
  import { Checkbox } from "@/components/ui/checkbox"

  type Task = {
    id: string
    title: string
    completed: boolean
  }

  export default function TaskList() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [newTask, setNewTask] = useState("")

    const addTask = () => {
      if (newTask.trim()) {
        setTasks([...tasks, {
          id: Date.now().toString(),
          title: newTask,
          completed: false
        }])
        setNewTask("")
      }
    }

    const toggleTask = (id: string) => {
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      ))
    }

    return (
     // Add rest of the code here
    )
  }
  {/filePath}
    {filePath=src/components/Dashboard.tsx}
  import UserCard from "./UserCard"
  import { LineChart, XAxis, YAxis, CartesianGrid, Line, ResponsiveContainer } from "recharts"

  const data = [
    { month: "Jan", value: 100 },
    { month: "Feb", value: 200 }
  ]

  export default function Dashboard() {
    return (
    <div>
    <ResponsiveContainer width="100%" height={300}> - FOLLOW THIS STRICTLY
      // ... rest of your chart code
</div>
  }
  {/filePath}

  - Always add global styles in App.tsx  
   {filePath=src/App.tsx}
  import { useState } from "react"
  import { Card, CardContent } from "@/components/ui/card"
  import TaskList from "./components/TaskList"
  import UserCard from "./components/UserCard"
  import Dashboard from "./components/Dashboard"

  export default function App() {
  const styles = {
  // ADD global.css styles HERE directly
   global:
    :root {}
  }
    return (
     <>
    <style>{styles.global}</style>
       // Add rest of the code here
       </>
    )
  }
  {/filePath}

 
  If using THEME PROVIDER, ALWAYS generate as shown then import it in App.tsx

  {filePath=src/components/ThemeProvider.tsx}
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"

      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
{/filePath}
  
- Always add global styles in App.tsx  
  Example of Main App Structure WITH Theme Provider:

  {filePath=src/App.tsx}
  import { useState } from "react"
  import { Card, CardContent } from "@/components/ui/card"
  import { ThemeProvider } from "./components/ThemeProvider"
  import TaskList from "./components/TaskList"
  import UserCard from "./components/UserCard"
  import Dashboard from "./components/Dashboard"

  export default function App() {
  const styles = {
  //ADD global.css styles HERE directly
   global:
    :root {}
  }
    return (
     <ThemeProvider defaultTheme="" storageKey="">
     <>
    <style>{styles.global}</style>
       // Add rest of the code here
       </>
    </ThemeProvider>
    )
  }
  {/filePath}

IMPORTANT NOTE:

ALWAYS return FULL COMPONENT CODE. ALWAYS.
NEVER EVER add text like 
// ... previous state declarations remain the same ... or 
// ... previous methods remain the same ...  or 
{/* ... rest of the JSX remains the same ... */} or 
[Previous ThemeProvider code as shown in the template] or
[Previous ThemeProvider code as shown in the examples]


It SHOULD BE FULL COMPONENT CODE

 

Guidelines:
- Always respond in a conversational tone first, then provide code
- Maintain the existing code structure and patterns
- If using Theme Provider, ALWAYS use it in App.tsx
- Only modify what's necessary to implement the requested changes
- Keep all imports and component structures consistent
- Ensure all custom components are in the /components directory
- Use only shadcn/ui components from @/components/ui/
- Use lucide-react for icons
- Use Tailwind for styling
- Return complete files, not just changed sections
- Include ALL necessary components, even if unchanged
- Write production-quality, maintainable code

Remember:
- You have access to all shadcn/ui components
- You can use React hooks,Framer Motion and lucide-react
- You can use Context API for state management
- You can use recharts for charts
- Don't suggest installing additional packages`
}

const modificationPrompt = `


All shadcn/ui components are available via import from @/components/ui/
You only need to provide custom components and App.tsx.

Instructions:
- First provide a brief conversational response
- For any component that needs to be modified or created, wrap it in file path tags:
  {filePath=path/to/file.tsx}
- Use exact paths:
  - Root components: {filePath=src/App.tsx}
  - Custom components: {filePath=src/components/ComponentName.tsx}  
- DO NOT include unchanged components  
- If using Theme Provider, ALWAYS use it in App.tsx
- Then provide the complete updated code for ALL components that need changing
- ONLY include App.tsx and custom components in /components/
- DO NOT include any shadcn components or files from /components/ui/
- All shadcn components are available through import from @/components/ui/
- Maintain the same file structure
- ONLY RETURN THE CHANGED FILES, not the full codebase
- Provide the complete code for EACH CHANGED file, not just the changes
`;


export type GeneratedCodeFile = {
  name: string;
  extension: string;
  path: string;
  content: string;
};

export type CodeModificationRequest = {
  chatHistory: {
    messages: Array<{
      content: string;
      role: "user" | "assistant";
      timestamp: number;
    }>;
  };
  currentCode: {
    files: GeneratedCodeFile[];
  };
  newMessage: string;
};

// Initial code generation
export async function streamCompletion(prompt: string, screenshotUrl?: string) {
  const userMessage = screenshotUrl
    ? `${prompt}\nScreenshot URL: ${screenshotUrl}`
    : prompt;

  const stream = await anthropic.messages.stream({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: `For all web apps I ask you to make, have them be beautiful, comprehensive and functional with a clean, modern design and smooth animations.
                  Make webpages that are fully featured, comprehensive and worthy for production. 
                  By default, this template supports JSX syntax with Tailwind CSS classes, React hooks, Framer Motion for animations, Shadcn for UI components, recharts for charts, Context api for state management and Lucide React for icons. 
                  DO NOT install other packages for UI themes, icons, etc unless I request them. Use icons from lucide-react for icons, only valid icons you know exist. 
                  Use stock photos from unsplash where appropriate, only valid URLs you know exist. 
                  Do not download the images, only link to them in image tags. DO NOT MENTION THE TECH STACK.${userMessage}`,
      }
    ],
    system: getMainCodingPrompt(),
  });
  
  return stream.toReadableStream();
}

// Code modification
export async function streamCodeModification(request: CodeModificationRequest) {

  const stream = await anthropic.messages.stream({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: [
          "Current code state:",
          ...request.currentCode.files.map(f => 
            `${f.path}/${f.name}.${f.extension}\n\`\`\`tsx\n${f.content}\n\`\`\``
          ),
          "\nChat history:",
          ...request.chatHistory.messages.map(m => `${m.role}: ${m.content}`),
          "\nNew request:",
          request.newMessage
        ].join('\n')
      },
      {
        role:'user',
        content: modificationPrompt
      }
    ],
    system: getModificationSystemPrompt(),
  });

  return stream.toReadableStream();
}
