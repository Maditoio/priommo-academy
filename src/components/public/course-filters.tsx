"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const LEVELS = ["Débutant", "Professionnel", "Spécialisé", "Exécutif"];

interface CourseFiltersProps {
  searchPlaceholder: string;
  allLevelsLabel: string;
  defaultSearch?: string;
  defaultLevel?: string;
}

export function CourseFilters({
  searchPlaceholder,
  allLevelsLabel,
  defaultSearch,
  defaultLevel,
}: CourseFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(defaultSearch ?? "");
  const [level, setLevel] = useState(defaultLevel ?? "all");

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());
    if (search) params.set("search", search);
    else params.delete("search");
    if (level && level !== "all") params.set("level", level);
    else params.delete("level");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row">
      <Input
        placeholder={searchPlaceholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && applyFilters()}
        className="sm:max-w-xs"
      />
      <Select value={level} onValueChange={setLevel}>
        <SelectTrigger className="sm:w-48">
          <SelectValue placeholder={allLevelsLabel} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{allLevelsLabel}</SelectItem>
          {LEVELS.map((l) => (
            <SelectItem key={l} value={l}>
              {l}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={applyFilters}>OK</Button>
    </div>
  );
}
