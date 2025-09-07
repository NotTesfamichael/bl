import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tag, Home } from "lucide-react";

export default function TagNotFound() {
  return (
    <div className="min-h-screen bg-[#F5F0E1] flex items-center justify-center">
      <div className="text-center">
        <Tag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-black mb-4">Tag not found</h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          The tag you&apos;re looking for doesn&apos;t exist or may have been
          removed.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
