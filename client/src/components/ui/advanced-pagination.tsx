import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from "lucide-react";

interface AdvancedPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  showingFrom: number;
  showingTo: number;
  pageSizeOptions?: number[];
}

export function AdvancedPagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  showingFrom,
  showingTo,
  pageSizeOptions = [12, 24, 48, 96],
}: AdvancedPaginationProps) {
  const getVisiblePages = () => {
    const delta = 1;
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

    return rangeWithDots.filter((item, index, arr) => arr.indexOf(item) === index);
  };

  if (totalPages <= 1 && totalItems <= pageSize) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 p-4 bg-white/5 dark:bg-gray-900/20 backdrop-blur-sm rounded-lg border border-white/10">
      <div className="flex items-center space-x-4">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Showing <span className="font-medium">{showingFrom}</span> to{" "}
          <span className="font-medium">{showingTo}</span> of{" "}
          <span className="font-medium">{totalItems}</span> results
        </p>
        
        {onPageSizeChange && (
          <div className="flex items-center space-x-2">
            <p className="text-sm text-gray-700 dark:text-gray-300">Show:</p>
            <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(parseInt(value))}>
              <SelectTrigger className="w-20 h-8 glass border-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="glass border-0 h-8 w-8 p-0"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="glass border-0 h-8 px-3"
        >
          <ChevronLeft className="h-4 w-4" />
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
                    ? "bg-indigo-500 hover:bg-indigo-600 h-8 w-8 p-0" 
                    : "glass border-0 h-8 w-8 p-0"
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
          className="glass border-0 h-8 px-3"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="glass border-0 h-8 w-8 p-0"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}