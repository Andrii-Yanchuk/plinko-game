"use client";

import { Check, Upload, X } from "lucide-react";
import { useId, useRef, useState, type DragEvent } from "react";

const maxAvatarSize = 5 * 1024 * 1024;
const acceptedAvatarTypes = ["image/png", "image/jpeg"];

type AvatarUploadModalProps = {
  errorMessage?: string;
  isPending: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<unknown>;
};

function getAvatarFileError(file: File) {
  if (!acceptedAvatarTypes.includes(file.type)) {
    return "Please choose a PNG or JPG image.";
  }

  if (file.size > maxAvatarSize) {
    return "Image must be 5MB or smaller.";
  }

  return null;
}

export function AvatarUploadModal({
  errorMessage,
  isPending,
  onClose,
  onUpload,
}: AvatarUploadModalProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const selectFile = (nextFile: File | null) => {
    if (!nextFile) {
      return;
    }

    const validationError = getAvatarFileError(nextFile);

    setLocalError(validationError);
    setFile(validationError ? null : nextFile);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    selectFile(event.dataTransfer.files.item(0));
  };

  const handleUpload = async () => {
    if (!file || isPending) {
      return;
    }

    await onUpload(file);
    onClose();
  };

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4"
      role="dialog"
    >
      <div className="w-full max-w-[474px] rounded-lg border border-[#242B3B] bg-[#1A1F2E] p-4 text-[#F4F7FB] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Upload Avatar</h2>
            <p className="mt-3 text-sm text-[#9AA3B5]">
              Choose a profile picture (max 5MB)
            </p>
          </div>
          <button
            aria-label="Close upload avatar modal"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[#A7B0C2] transition-colors hover:bg-[#252B3A] hover:text-white"
            disabled={isPending}
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>

        <label
          className="mt-8 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#30384A] bg-[#1B2130] px-4 py-8 text-center transition-colors hover:border-[#3F89FF]"
          htmlFor={inputId}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <Upload aria-hidden="true" className="h-12 w-12 text-[#9CA5B8]" />
          <span className="mt-4 text-sm text-[#F4F7FB]">
            {file ? file.name : "Drop an image here or click to browse"}
          </span>
          <span className="mt-1 text-xs text-[#6F788B]">PNG, JPG up to 5MB</span>
        </label>
        <input
          ref={inputRef}
          accept="image/png,image/jpeg"
          className="sr-only"
          disabled={isPending}
          id={inputId}
          onChange={(event) => selectFile(event.target.files?.item(0) ?? null)}
          type="file"
        />

        {localError || errorMessage ? (
          <p className="mt-3 text-sm text-[#FDA4AF]">
            {localError ?? errorMessage}
          </p>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            className="h-10 rounded-lg bg-[#2B3142] text-sm font-medium text-[#F4F7FB] transition-colors hover:bg-[#343B4F] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#0F7D42] text-sm font-medium text-[#B8F4D0] transition-colors hover:bg-[#11964F] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!file || isPending}
            onClick={handleUpload}
            type="button"
          >
            <Check aria-hidden="true" className="h-4 w-4" />
            {isPending ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
