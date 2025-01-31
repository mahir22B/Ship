export const name = "NavigationMenu";
export const importDocs = `
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
`;
export const usageDocs = `
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid gap-3 p-4 w-[400px] md:w-[500px] md:grid-cols-2">
          <li>
            <NavigationMenuLink href="/docs">
              <div className="font-medium">Documentation</div>
              <p className="text-sm text-muted-foreground">
                Learn how to use and customize components.
              </p>
            </NavigationMenuLink>
          </li>
          <li>
            <NavigationMenuLink href="/components">
              <div className="font-medium">Components</div>
              <p className="text-sm text-muted-foreground">
                Browse the available components.
              </p>
            </NavigationMenuLink>
          </li>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Components</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
          <li>
            <NavigationMenuLink href="/buttons">
              <div className="font-medium">Buttons</div>
              <p className="text-sm text-muted-foreground">
                Button components and variants.
              </p>
            </NavigationMenuLink>
          </li>
          <li>
            <NavigationMenuLink href="/cards">
              <div className="font-medium">Cards</div>
              <p className="text-sm text-muted-foreground">
                Card components for displaying content.
              </p>
            </NavigationMenuLink>
          </li>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
`;