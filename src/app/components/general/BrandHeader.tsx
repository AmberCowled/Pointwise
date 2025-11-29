import Image from 'next/image';

export default function BrandHeader() {
  return (
    <header className="flex items-center justify-center gap-3 mb-8">
      <div className="relative h-12 w-12 sm:h-14 sm:w-14">
        <Image
          src="/logo.png"
          alt="Pointwise"
          width={56}
          height={56}
          className="object-contain"
          priority
        />
      </div>
      <span className="text-2xl font-semibold tracking-tight">Pointwise</span>
    </header>
  );
}
