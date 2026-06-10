import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="mx-auto max-w-[1180px] px-4 py-10 md:px-6">
      <section className="grid items-center gap-8 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-2 md:p-10">
        <div>
          <h1 className="text-3xl font-bold leading-tight text-slate-800 md:text-5xl">Exchange Academic Books</h1>
          <h2 className="mt-2 text-xl font-semibold text-violet-600 md:text-2xl">No payments on the platform</h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            List books you want to swap or give away. Browse what other students offer and contact owners directly to
            arrange an exchange offline. Built for saving money and cutting waste.
          </p>
          <Link
            to="/list"
            className="mt-5 inline-block rounded-lg bg-gradient-to-r from-violet-500 to-violet-600 px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5"
          >
            Browse books
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl">
          <img src="/bookbunch.jpg" alt="Students with books" className="h-full w-full object-cover" />
        </div>
      </section>
    </div>
  );
}

export default HomePage;