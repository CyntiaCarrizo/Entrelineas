import Logo from '@/components/Logo';

export default function Inicio() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-4 py-16">
      <h1 className="text-[39px] leading-tight">
        <Logo />
      </h1>
      <p className="mt-6 max-w-[68ch] font-serif text-xl leading-relaxed text-tinta">
        Estamos acomodando los estantes.
      </p>
      <p className="mt-2 text-grafito">
        Muy pronto vas a poder ver qué libros hay, armar tu pedido y enviarlo por WhatsApp.
      </p>
    </main>
  );
}
