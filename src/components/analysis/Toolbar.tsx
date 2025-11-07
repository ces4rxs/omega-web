"use client";

import {
  Home,
  Folder,
  RefreshCw,
  ZoomIn,
  Square,
  ArrowRight,
  Grid3x3,
  List,
  Settings,
} from "lucide-react";

export function Toolbar() {
  return (
    <div className="flex items-center justify-between border-t border-[#1f2937] bg-[#05070f]/80 px-6 py-3 backdrop-blur">
      {/* Left side - Navigation */}
      <div className="flex items-center gap-4">
        <button className="rounded-lg border border-transparent bg-[#0f1422]/60 p-2 text-[#9ca3af] transition-colors hover:border-[#00d4ff]/40 hover:text-[#00d4ff]">
          <Home className="h-4 w-4" />
        </button>
        <button className="rounded-lg border border-transparent bg-[#0f1422]/60 p-2 text-[#9ca3af] transition-colors hover:border-[#00d4ff]/40 hover:text-[#00d4ff]">
          <Folder className="h-4 w-4" />
        </button>
        <button className="rounded-lg border border-transparent bg-[#0f1422]/60 p-2 text-[#9ca3af] transition-colors hover:border-[#00d4ff]/40 hover:text-[#00d4ff]">
          <RefreshCw className="h-4 w-4" />
        </button>
        <button className="rounded-lg border border-transparent bg-[#0f1422]/60 p-2 text-[#9ca3af] transition-colors hover:border-[#00d4ff]/40 hover:text-[#00d4ff]">
          <ZoomIn className="h-4 w-4" />
        </button>
        <button className="rounded-lg border border-transparent bg-[#0f1422]/60 p-2 text-[#9ca3af] transition-colors hover:border-[#00d4ff]/40 hover:text-[#00d4ff]">
          <Square className="h-4 w-4" />
        </button>
        <button className="rounded-lg border border-transparent bg-[#0f1422]/60 p-2 text-[#9ca3af] transition-colors hover:border-[#00d4ff]/40 hover:text-[#00d4ff]">
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Right side - View options */}
      <div className="flex items-center gap-4">
        <button className="rounded-lg border border-transparent bg-[#0f1422]/60 p-2 text-[#9ca3af] transition-colors hover:border-[#00d4ff]/40 hover:text-[#00d4ff]">
          <Grid3x3 className="h-4 w-4" />
        </button>
        <button className="rounded-lg border border-transparent bg-[#0f1422]/60 p-2 text-[#9ca3af] transition-colors hover:border-[#00d4ff]/40 hover:text-[#00d4ff]">
          <List className="h-4 w-4" />
        </button>
        <button className="rounded-lg border border-transparent bg-[#0f1422]/60 p-2 text-[#9ca3af] transition-colors hover:border-[#00d4ff]/40 hover:text-[#00d4ff]">
          <Settings className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
