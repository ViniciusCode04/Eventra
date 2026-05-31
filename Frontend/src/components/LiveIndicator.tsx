export function LiveIndicator({ label = 'Ao vivo' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-eventra-cyan/10 border border-eventra-cyan/20 text-xs text-eventra-cyan">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-eventra-cyan opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-eventra-cyan" />
      </span>
      {label}
    </span>
  );
}
