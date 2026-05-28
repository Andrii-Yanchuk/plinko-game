import { memo } from "react";

type RowsSelectorProps = {
  disabled?: boolean;
  maxRows: number;
  minRows: number;
  onRowsChange: (rows: number) => void;
  rows: number;
  rowsProgress: number;
};

export const RowsSelector = memo(function RowsSelector({
  disabled = false,
  maxRows,
  minRows,
  onRowsChange,
  rows,
  rowsProgress,
}: RowsSelectorProps) {
  return (
    <>
      <div className="mt-5 flex items-center justify-between text-xs">
        <span className="text-sm font-medium text-[#D1D5DC]">Rows</span>
        <span className="rounded-[10px] border border-[#2A2F3E] bg-[#0B1220] px-3 py-0.5 text-sm font-bold text-[#00E783]">
          {rows}
        </span>
      </div>
      <input
        disabled={disabled}
        type="range"
        min={minRows}
        max={maxRows}
        onChange={(event) => onRowsChange(Number(event.target.value))}
        style={{
          background: `linear-gradient(to right, #FAFAFA ${rowsProgress}%, #262626 ${rowsProgress}%)`,
        }}
        value={rows}
        className="mt-2 h-4 w-full cursor-pointer appearance-none rounded-full bg-[#262626] disabled:cursor-not-allowed disabled:opacity-60 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#FAFAFA] [&::-moz-range-thumb]:bg-[#0A0A0A] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#FAFAFA] [&::-webkit-slider-thumb]:bg-[#0A0A0A]"
      />

      <div className="mt-2 flex justify-between text-xs text-[#6F788B]">
        <span>{minRows}</span>
        <span>{maxRows}</span>
      </div>
    </>
  );
})
