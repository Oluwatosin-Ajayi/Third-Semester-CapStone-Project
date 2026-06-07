"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  defaultValue?: string;
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  defaultValue = "",
  onSearch,
  placeholder = "Search by name, city, or LGA...",
}: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = e.target.value;
    setValue(newValue);

    // Debounce — fire after 300ms of no typing
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      onSearch?.(newValue);
    }, 300);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    onSearch?.(value);
  }

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search hospitals"
      className="flex gap-2"
    >
      <input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label="Search hospitals"
        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
      />
      <button
        type="submit"
        className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
      >
        Search
      </button>
    </form>
  );
}
