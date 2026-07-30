import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { type Table } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import getPageNumbers from "@/lib/getPageNumbers";

type SimplePaginationProps<TData> = {
    table: Table<TData>;
    className?: string;
    totalRows?: number;
};

export function SimplePagination<TData>({ table, className, totalRows }: SimplePaginationProps<TData>) {
    const currentPage = table.getState().pagination.pageIndex + 1;
    const totalPages = table.getPageCount();
    const pageNumbers = getPageNumbers(currentPage, totalPages);

    const pageSize = table.getState().pagination.pageSize || 10;
    const resolvedTotal = totalRows ?? table.getFilteredRowModel().rows.length;

    const startRow = resolvedTotal === 0 ? 0 : Math.min((currentPage - 1) * pageSize + 1, resolvedTotal);
    const endRow = Math.min(currentPage * pageSize, resolvedTotal);

    if (resolvedTotal === 0) return null;

    return (
        <div className={cn("flex flex-col items-center gap-6", className)}>
            <div className="flex items-center gap-2">
                <button
                    className="text-foreground hover:bg-muted/50 border-input flex h-9 w-14 items-center justify-center rounded-full border bg-white transition-colors disabled:opacity-50"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    <span className="sr-only">Previous page</span>
                    <ChevronLeftIcon className="size-4" />
                </button>

                {pageNumbers.map((pageNumber, index) => (
                    <div key={`${pageNumber}-${index}`} className="flex items-center">
                        {pageNumber === "..." ? (
                            <span className="text-foreground/70 px-1 text-sm">..</span>
                        ) : (
                            <button
                                className={cn(
                                    "flex size-9 items-center justify-center rounded-full text-sm font-medium transition-colors",
                                    currentPage === pageNumber ? "bg-slate-900 text-white" : "text-foreground hover:bg-muted/50 bg-transparent"
                                )}
                                onClick={() => table.setPageIndex((pageNumber as number) - 1)}
                            >
                                <span className="sr-only">Go to page {pageNumber}</span>
                                {pageNumber}
                            </button>
                        )}
                    </div>
                ))}

                <button
                    className="text-foreground hover:bg-muted/50 border-input flex h-9 w-14 items-center justify-center rounded-full border bg-white transition-colors disabled:opacity-50"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    <span className="sr-only">Next page</span>
                    <ChevronRightIcon className="size-4" />
                </button>
            </div>

            <p className="text-muted-foreground text-xs font-medium">
                Showing results {startRow}-{endRow} of {resolvedTotal}
            </p>
        </div>
    );
}
