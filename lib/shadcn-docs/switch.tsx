export const name = "Switch";
export const importDocs = `
import { Switch } from "@/components/ui/switch"
`;
export const usageDocs = `
<div className="flex items-center space-x-2">
  <Switch id="airplane-mode" />
  <Label htmlFor="airplane-mode">Airplane Mode</Label>
</div>

<div className="flex flex-col space-y-4">
  <div className="flex items-center space-x-2">
    <Switch id="notifications" defaultChecked />
    <Label htmlFor="notifications">Notifications</Label>
  </div>
  <div className="flex items-center space-x-2">
    <Switch id="marketing" disabled />
    <Label htmlFor="marketing">Marketing emails</Label>
  </div>
</div>
`;