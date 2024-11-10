"use client";

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { MapPin, Trash, Coins, MessageSquare, Medal, Settings, Home, ArrowUpDownIcon, PiggyBank } from "lucide-react";

const sidebarItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/report", icon: MapPin, label: "Track Food" },
  { href: "/collect", icon: Trash, label: "Collect Food" },
  { href: "/rewards", icon: Coins, label: "Rewards" },
  { href: "/leaderboard", icon: Medal, label: "Leaderboard" },
  { href: "/pickupdrop", icon: ArrowUpDownIcon, label: "Pick Up & Drop" },
  { href: "/foodbank", icon: PiggyBank, label: "Food Bank" },
];

interface SidebarProps {
  open: boolean;
}

export default function Sidebar({ open }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`py-2 bg-opacity-20 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 text-white w-64 fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out shadow-lg ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      <nav className="h-full py-12 flex flex-col justify-between">
        <div className="px-6 py-8 space-y-6">
          {sidebarItems.map((item) => (
            <Link key={item.href} href={item.href} passHref>
              <Button
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={`w-full justify-start py-3 rounded-lg transition-all duration-200 ease-in-out 
                  ${pathname === item.href ? "bg-purple-100 text-purple-800 shadow-md" : "text-white hover:bg-white hover:bg-opacity-10"}
                `}
              >
                <item.icon className="mr-3 h-6 w-6" />
                <span className="text-base">{item.label}</span>
              </Button>
            </Link>
          ))}
        </div>
        <div className="p-4 border-t border-gray-300 ">
          <Link href="/settings" passHref>
            <Button 
              variant={pathname === "/settings" ? "secondary" : "outline"}
              className={`w-full  py-3 rounded-lg transition-all duration-200 ease-in-out 
                ${pathname === "/settings" ? "bg-purple-100 text-purple-800 shadow-md" : "text-white border-white hover:bg-white hover:bg-opacity-10"}
              `}
            >
              <Settings className="mr-3 h-6 w-6 text-black" />
              <span className="text-base text-black">Settings</span>
            </Button>
          </Link>
        </div>
      </nav>
    </aside>
  );
}
