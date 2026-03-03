"use client";

import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Map,
  Wind,
  CloudSun,
  BarChart3,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const links = [
  {
    label: "Dashboard",
    href: "#",
    icon: <LayoutDashboard className="text-slate-400 h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Weather Map",
    href: "#",
    icon: <Map className="text-slate-400 h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Air Quality",
    href: "#",
    icon: <Wind className="text-slate-400 h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Forecasts",
    href: "#",
    icon: <BarChart3 className="text-slate-400 h-5 w-5 flex-shrink-0" />,
  },
  {
    label: "Settings",
    href: "#",
    icon: <Settings className="text-slate-400 h-5 w-5 flex-shrink-0" />,
  },
];

const Logo = () => (
  <Link href="/" className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20">
    <CloudSun className="h-6 w-6 text-blue-400 flex-shrink-0" />
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="font-bold text-white whitespace-pre text-base"
    >
      WeatherPulse
    </motion.span>
  </Link>
);

const LogoIcon = () => (
  <Link href="/" className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20">
    <CloudSun className="h-6 w-6 text-blue-400 flex-shrink-0" />
  </Link>
);

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("flex flex-col md:flex-row w-full flex-1 overflow-hidden", "h-screen")}>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 border-r border-white/5 bg-[#0c1222]">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-1 overflow-auto">
        <div className="flex-1 w-full h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
