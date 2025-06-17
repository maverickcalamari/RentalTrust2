import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Building2, 
  Users, 
  CreditCard, 
  BarChart3,
  Wrench
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface MobileNavProps {
  setIsMobileOpen: (isOpen: boolean) => void;
}

export default function MobileNav({ setIsMobileOpen }: MobileNavProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  
  // Only show for authenticated users
  if (!user) return null;
  
  const navigationItems = user.userType === "landlord" ? [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Properties", href: "/properties", icon: Building2 },
    { name: "Tenants", href: "/tenants", icon: Users },
    { name: "Payments", href: "/payments", icon: CreditCard },
    { name: "Reports", href: "/reports", icon: BarChart3 }
  ] : [
    { name: "Portal", href: "/tenant-portal", icon: Home },
    { name: "Requests", href: "/service-requests", icon: Wrench },
  ];
  
  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <h1 className="ml-2 text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">RentEZ</h1>
        </div>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="text-neutral-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-10">
        <div className={`grid grid-cols-${navigationItems.length}`}>
          {navigationItems.map(item => (
            <Link key={item.name} href={item.href}>
              <a 
                className={cn(
                  "flex flex-col items-center py-3 px-2",
                  location === item.href ? "text-blue-600" : "text-gray-500"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.name}</span>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}