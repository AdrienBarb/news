import Image from "next/image";

export default function BrandLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-secondary rounded-lg">
        <Image
          src="/logo-svg.svg"
          alt="TechPulse Logo"
          width={32}
          height={32}
          className="aspect-square"
        />
      </div>
      <span className="font-semibold text-xl">PREDIQTE</span>
    </div>
  );
}
