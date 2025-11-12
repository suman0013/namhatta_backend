import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import { api } from "@/services/api";
// Custom debounce hook inline
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface SearchablePincodeSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  country: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SearchablePincodeSelect({
  value,
  onValueChange,
  country,
  placeholder = "Search pincode...",
  disabled = false,
  className = ""
}: SearchablePincodeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [allPincodes, setAllPincodes] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["/api/pincodes/search", country, debouncedSearchTerm, page],
    queryFn: () => api.searchPincodes(country, debouncedSearchTerm, page),
    enabled: !!country && isOpen,
    staleTime: 0, // Disable cache to ensure fresh results
  });

  // Reset when search term changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) return;
    
    if (page === 1) {
      setAllPincodes(data?.pincodes || []);
    } else {
      setAllPincodes(prev => [...prev, ...(data?.pincodes || [])]);
    }
  }, [data, page, debouncedSearchTerm, searchTerm]);

  // Reset when search term changes or country changes
  useEffect(() => {
    setPage(1);
    setAllPincodes([]);
  }, [debouncedSearchTerm, country]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleOptionClick = (option: string) => {
    onValueChange(option);
    setSearchTerm("");
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    if (!country) return;
    setIsOpen(true);
    // Don't clear search term on focus to preserve user input
  };

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.2 && data?.hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  }, [data?.hasMore, isLoading]);

  const displayPincodes = allPincodes.filter(pincode => 
    !searchTerm || pincode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={containerRef} className={`relative ${className}`} data-searchable-select-open={isOpen}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={isOpen ? searchTerm : value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={!country ? "Select country first" : placeholder}
          disabled={disabled || !country}
          className="pr-8 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-2"
          onClick={() => {
            if (!country) return;
            setIsOpen(!isOpen);
            if (!isOpen) {
              inputRef.current?.focus();
            }
          }}
          disabled={disabled || !country}
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </div>
      
      {isOpen && !disabled && country && (
        <div 
          ref={dropdownRef}
          className="searchable-select-dropdown absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl max-h-64 overflow-y-auto z-50"
          onScroll={handleScroll}
        >
          {isLoading && page === 1 ? (
            <div className="flex items-center justify-center px-3 py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-gray-500">Loading pincodes...</span>
            </div>
          ) : displayPincodes.length > 0 ? (
            <>
              {displayPincodes.map((pincode, index) => (
                <div
                  key={`${pincode}-${index}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer text-left select-none transition-colors"
                  onClick={() => handleOptionClick(pincode)}
                >
                  <span className="text-sm">{pincode}</span>
                  {value === pincode && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              ))}
              {isLoading && page > 1 && (
                <div className="flex items-center justify-center px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-xs text-gray-500">Loading more...</span>
                </div>
              )}
              {data?.hasMore && !isLoading && (
                <div className="px-3 py-2 text-xs text-gray-500 text-center">
                  Scroll down for more pincodes
                </div>
              )}
            </>
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? `No pincodes found for "${searchTerm}"` : "No pincodes available"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}