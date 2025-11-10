export default function BrandHeader() {
  return (
    <header className="flex items-center justify-center gap-3 mb-8">
      <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-rose-500 shadow-lg shadow-fuchsia-700/20 grid place-items-center text-xl font-bold">
        PW
      </div>
      <span className="text-2xl font-semibold tracking-tight">Pointwise</span>
    </header>
  );
}
