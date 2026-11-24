import Logo from "../../components/ui/Logo";
import Shelf from "../../components/books/Shelf";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-lamp-deep p-12 text-white lg:flex">
        <Logo light />
        <div>
          <p className="max-w-sm text-3xl font-extrabold leading-tight">Every book you pass on is one less a student has to buy.</p>
          <div className="mt-12 max-w-md"><Shelf /></div>
        </div>
        <p className="text-sm text-white/60">No payments. No middlemen. Just students.</p>
      </div>
      <div className="flex flex-col px-5 py-8 sm:px-12">
        <div className="lg:hidden"><Logo /></div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="text-4xl font-extrabold">{title}</h1>
          <p className="mt-2 text-[15px] text-ink-soft">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-8 text-[15px] text-ink-soft">{footer}</p>
        </div>
      </div>
    </div>
  );
}
