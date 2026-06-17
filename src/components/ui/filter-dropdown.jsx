"use client";

import { Menu } from "@base-ui/react/menu";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export function FilterDropdown({
  label,
  options = ["Any"],
  value = "Any",
  onValueChange = () => {},
  disabled = false,
}) {
  const trimmedValue = value?.length ? value : "Any";
  const triggerText = trimmedValue === "Any" ? label : `${label}: ${trimmedValue}`;

  return (
    <Menu.Root>
      <Menu.Trigger
        className={cn(
          "inline-flex h-10 sm:h-11 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 sm:px-4 text-[13px] sm:text-[15px] font-medium text-gray-700 shadow-sm transition-colors hover:border-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a855f7]/60",
          "data-[state=open]:bg-gray-50 data-[state=open]:border-gray-300",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none border-gray-100 bg-gray-50/50"
        )}
      >
        <span className="max-w-[160px] sm:max-w-[210px] truncate whitespace-nowrap">{triggerText}</span>
        <ChevronDown className="h-4 w-4 text-gray-400" strokeWidth={2.5} />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner sideOffset={6} align="start">
          <Menu.Popup
            className={cn(
              "min-w-[180px] rounded-2xl border border-gray-100 bg-white p-2 shadow-[0_25px_50px_-20px_rgba(15,23,42,0.35)]",
              "overflow-hidden"
            )}
          >
            {options.map((option) => {
              const isSelected = option === trimmedValue;
              return (
                <Menu.Item
                  key={option}
                  onClick={() => onValueChange(option)}
                  className={cn(
                    "w-full rounded-xl px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#a855f7]/60",
                    isSelected
                      ? "bg-[#f5f3ff] text-[#7c3aed]"
                      : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {option}
                </Menu.Item>
              );
            })}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
