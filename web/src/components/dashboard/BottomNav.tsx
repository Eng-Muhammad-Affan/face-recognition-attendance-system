"use client"
import { dashboardNavLinks } from "@/constants";
import Link from "next/link"; // or from your routing library
import { usePathname } from "next/navigation"; // if using Next.js


 const BottomNav = () => {
  const pathname = usePathname(); // Get current path for active state

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 h-[10vh] bg-background border-t z-50">
      <div className="flex h-full items-center justify-around px-4">
        {dashboardNavLinks.map((link, idx) => {
          const isActive = pathname === link.url; // Assuming your links have a href property
          
          return (
            <Link
              key={idx}
              href={link.url}
              className={`flex flex-col items-center justify-center gap-1 transition-colors
                ${isActive 
                  ? "text-green-500 bg-black p-4 rounded-full" 
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <link.icon className="h-5 w-5" />
              {/* {link.title && (
                <span className="text-xs">{link.title}</span>
              )} */}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav