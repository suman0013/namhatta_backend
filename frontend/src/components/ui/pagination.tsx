import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showingFrom: number;
  showingTo: number;
  totalItems: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showingFrom,
  showingTo,
  totalItems,
}: PaginationProps) {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
      <p className="text-sm text-gray-700 dark:text-gray-300">
        Showing <span className="font-medium">{showingFrom}</span> to{" "}
        <span className="font-medium">{showingTo}</span> of{" "}
        <span className="font-medium">{totalItems}</span> results
      </p>
      <div className="flex space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="glass border-0 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        {getVisiblePages().map((page, index) => (
          <div key={index}>
            {page === "..." ? (
              <div className="flex items-center justify-center w-8 h-8">
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </div>
            ) : (
              <Button
                variant={page === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className={
                  page === currentPage 
                    ? "bg-indigo-500 hover:bg-indigo-600 text-white" 
                    : "glass border-0 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
                }
              >
                {page}
              </Button>
            )}
          </div>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="glass border-0 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}