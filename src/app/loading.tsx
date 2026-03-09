export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center py-16" role="status" aria-label="読み込み中">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-white/70" />
    </div>
  );
}
