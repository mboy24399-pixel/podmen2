import Link from "next/link";
import { Disc } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="w-20 h-20 bg-dark-card border border-dark-border rounded-3xl flex items-center justify-center text-accent shadow-skeuo">
        <Disc className="w-10 h-10 animate-spin" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-white">404 — Track Not Found</h1>
        <p className="text-dark-muted text-sm max-w-md">
          The page or audio track you are looking for has been removed or does not exist.
        </p>
      </div>
      <Link
        href="/"
        className="px-6 py-3 bg-accent text-dark font-bold rounded-xl shadow-skeuo-btn hover:scale-105 transition text-sm"
      >
        Return to Home
      </Link>
    </div>
  );
}
