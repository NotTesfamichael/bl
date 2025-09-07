export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F5F0E1] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#556B2F] mx-auto mb-4"></div>
        <p className="text-[#556B2F] font-medium">Loading...</p>
      </div>
    </div>
  );
}
