// "Entrelíneas" en Literata con una línea ocre que pasa por debajo, como un renglón (docs/design.md, sección 3).
export default function Logo({ className = '' }) {
  return (
    <span className={`relative inline-block font-serif font-semibold text-tinta ${className}`}>
      Entrelíneas
      <span aria-hidden="true" className="absolute inset-x-0 -bottom-[0.02em] h-[2px] bg-ocre" />
    </span>
  );
}
