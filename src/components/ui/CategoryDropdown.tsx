import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Check, Filter } from "lucide-react";
import { CATEGORY_GROUPS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface CategoryDropdownProps {
  value: string;                // "all" | category string | group name
  onChange: (value: string) => void;
  /** Width class for the trigger button, defaults to "w-48" */
  triggerClassName?: string;
  /** Width class for the popover panel, defaults to "w-[220px]" */
  contentClassName?: string;
  /** Show the filter icon in the trigger, default true */
  showFilterIcon?: boolean;
}

export function CategoryDropdown({
  value,
  onChange,
  triggerClassName = "w-48",
  contentClassName = "w-[220px]",
  showFilterIcon = true,
}: CategoryDropdownProps) {
  const [open, setOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  // Auto-expand the group that contains the active category whenever the
  // popover opens (or the active value changes while open).
  useEffect(() => {
    if (value === "all") return;
    const activeGroup = CATEGORY_GROUPS.find(
      (g) => g.categories.includes(value) || g.group === value
    );
    if (activeGroup && !expandedGroups.includes(activeGroup.group)) {
      setExpandedGroups((prev) => [...prev, activeGroup.group]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]); // intentionally only on open-state change

  // Toggle a group's expanded state
  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  // Human-readable label for the trigger button
  const getLabel = (): string => {
    if (value === "all") return "All Categories";
    for (const group of CATEGORY_GROUPS) {
      if (group.categories.includes(value)) return value;
      if (group.group === value) return value;
    }
    return "All Categories";
  };

  const handleSelectAll = () => {
    onChange("all");
    setOpen(false);
  };

  const handleSelectCategory = (category: string) => {
    onChange(category);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between bg-secondary border-none text-sm font-normal",
            triggerClassName
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {showFilterIcon && (
              <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            )}
            <span className="truncate">{getLabel()}</span>
          </span>
          <ChevronDown
            className={cn(
              "ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className={cn("p-0 shadow-lg", contentClassName)}
        align="start"
        sideOffset={4}
      >
        <div className="max-h-[420px] overflow-y-auto py-1">

          {/* ── All Categories ── */}
          <button
            onClick={handleSelectAll}
            className={cn(
              "flex w-full items-center px-3 py-2 text-sm transition-colors cursor-pointer",
              "hover:bg-accent hover:text-accent-foreground",
              value === "all" && "bg-accent/60 font-medium text-accent-foreground"
            )}
          >
            <Check
              className={cn(
                "mr-2 h-4 w-4 shrink-0 text-primary transition-opacity",
                value === "all" ? "opacity-100" : "opacity-0"
              )}
            />
            All Categories
          </button>

          {/* Divider */}
          <div className="my-1 border-t border-border" />

          {/* ── Groups ── */}
          {CATEGORY_GROUPS.map((group) => {
            const isExpanded = expandedGroups.includes(group.group);
            const hasSelectedChild = group.categories.includes(value);
            const isGroupActive = hasSelectedChild || value === group.group;

            return (
              <div key={group.group}>
                {/* Group header row — click to expand/collapse */}
                <button
                  onClick={() => toggleGroup(group.group)}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 text-sm",
                    "hover:bg-accent hover:text-accent-foreground",
                    "transition-colors cursor-pointer select-none",
                    isGroupActive && "text-primary font-medium"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    )}
                    <span>{group.group}</span>
                  </div>

                  {/* Category count badge */}
                  <span className="text-xs text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 tabular-nums">
                    {group.categories.length}
                  </span>
                </button>

                {/* Expanded child categories */}
                {isExpanded && (
                  <div className="bg-muted/20">
                    {group.categories.map((category) => {
                      const isSelected = value === category;
                      return (
                        <button
                          key={category}
                          onClick={() => handleSelectCategory(category)}
                          className={cn(
                            "flex w-full items-center pl-8 pr-3 py-1.5 text-sm",
                            "hover:bg-accent hover:text-accent-foreground",
                            "transition-colors cursor-pointer",
                            isSelected && "text-primary font-medium bg-accent/40"
                          )}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-3.5 w-3.5 shrink-0 text-primary transition-opacity",
                              isSelected ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {category}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
