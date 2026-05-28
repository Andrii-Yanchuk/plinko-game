import { memo } from "react";

type LoadMoreButtonProps = {
  isLoading: boolean;
  onLoadMore: () => void;
};

export const LoadMoreButton = memo(function LoadMoreButton({
  isLoading,
  onLoadMore,
}: LoadMoreButtonProps) {
  return (
    <button
      className="self-center cursor-pointer rounded-lg border border-[#2A2F3E] bg-[#1A1F2E] px-5 py-2 text-sm font-medium text-[#D1D5DC] transition-colors hover:bg-[#222A3D] disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isLoading}
      onClick={onLoadMore}
      type="button"
    >
      {isLoading ? "Loading..." : "Load more"}
    </button>
  );
});
