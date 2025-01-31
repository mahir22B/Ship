export const name = "Skeleton";
export const importDocs = `
import { Skeleton } from "@/components/ui/skeleton"
`;
export const usageDocs = `
<div className="flex items-center space-x-4">
  <Skeleton className="h-12 w-12 rounded-full" />
  <div className="space-y-2">
    <Skeleton className="h-4 w-[250px]" />
    <Skeleton className="h-4 w-[200px]" />
  </div>
</div>

<div className="space-y-2">
  <Skeleton className="h-40 w-full" />
  <div className="space-y-2">
    <Skeleton className="h-4 w-[60%]" />
    <Skeleton className="h-4 w-[80%]" />
    <Skeleton className="h-4 w-[70%]" />
  </div>
</div>
`;