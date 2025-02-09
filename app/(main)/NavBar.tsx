// import React, { useEffect, useState } from 'react';
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { ChevronDown } from "lucide-react";
// import { supabase } from '@/lib/supabase/client';
// import { useRouter } from 'next/navigation';

// interface NavBarProps {
//   onSignIn: () => void;
// }

// const NavBar: React.FC<NavBarProps> = ({ onSignIn }) => {
//   const router = useRouter();
//   const [user, setUser] = useState<any>(null);

//   useEffect(() => {
//     // Get initial session
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setUser(session?.user ?? null);
//     });

//     // Listen for auth changes
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user ?? null);
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   const handleLogout = async () => {
//     await supabase.auth.signOut();
//     router.push('/');
//   };

//   const getDisplayName = () => {
//     if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
//     if (user?.user_metadata?.name) return user.user_metadata.name;
//     if (user?.email) {
//       return user.email.split('@')[0].split('.')[0].charAt(0).toUpperCase() + 
//              user.email.split('@')[0].split('.')[0].slice(1);
//     }
//     return 'User';
//   };

//   return (
//     <nav className="absolute top-0 left-0 right-0 flex justify-end items-center p-4 z-10">
//       <div className="flex gap-4">
//         {user ? (
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white">
//                 <span className="mr-2">{getDisplayName()}</span>
//                 <ChevronDown className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-48">
//               <DropdownMenuItem 
//                 onClick={handleLogout} 
//                 className="text-red-600 hover:text-red-700 cursor-pointer hover:bg-gray-100 focus:text-red-700 focus:bg-gray-100"
//               >
//                 Log out
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         ) : (
//           <Button 
//             onClick={onSignIn}
//             variant="ghost"
//             className="text-white hover:bg-white/20 hover:text-white"
//           >
//             Sign in
//           </Button>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default NavBar;

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface NavBarProps {
  onSignIn: () => void;
}

const NavBar: React.FC<NavBarProps> = ({ onSignIn }) => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const getDisplayName = () => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) {
      return user.email.split('@')[0].split('.')[0].charAt(0).toUpperCase() + 
             user.email.split('@')[0].split('.')[0].slice(1);
    }
    return 'User';
  };

  return (
    <nav className="absolute top-0 left-0 right-0 flex justify-end items-center p-4 z-10">
      <div className="flex gap-4">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-white hover:bg-white/20 hover:text-white">
                <span className="mr-2">{getDisplayName()}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="text-red-600 hover:text-red-700 cursor-pointer hover:bg-gray-100 focus:text-red-700 focus:bg-gray-100"
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            onClick={onSignIn}
            variant="ghost"
            className="text-white hover:bg-white/20 hover:text-white"
          >
            Sign in
          </Button>
        )}
      </div>
    </nav>
  );
};

export default NavBar;