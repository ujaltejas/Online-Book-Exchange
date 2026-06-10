const About = () => {
  const stats = [
    { number: "100%", label: "No on-site payments" },
    { number: "Reuse", label: "Save money & paper" },
    { number: "Exchange", label: "Save money" },
    { number: "Direct", label: "Contact owners yourself" },
  ];

  const values = [
    {
      icon: "fas fa-book",
      title: "Academic reuse",
      description: "Share textbooks and notes so fewer new copies need to be printed.",
    },
    {
      icon: "fas fa-handshake",
      title: "Trust",
      description: "Transparent listings; you arrange swaps or giveaways in person or by email.",
    },
    {
      icon: "fas fa-users",
      title: "Community",
      description: "Built for students helping students.",
    },
  ];

  return (
    <div className="pb-10">
      <section
        className="flex h-[320px] items-center justify-center bg-cover bg-center text-center text-white md:h-[400px]"
        style={{ backgroundImage: "linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)), url('/bookbunch.jpg')" }}
      >
        <div>
          <h1 className="text-4xl font-bold md:text-6xl">About BookSwap</h1>
          <p className="mt-2 text-lg md:text-2xl">Online Book Exchange — no payment gateway</p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <section className="py-12">
          <h2 className="mb-8 text-center text-3xl font-bold text-slate-800">What we do</h2>
          <p className="mx-auto mb-8 max-w-3xl text-center text-lg leading-8 text-slate-600">
            BookSwap lets you list books you want to exchange or give away. Others browse, filter by category and
            condition, and use &quot;Contact owner&quot; so the two of you can meet or email — no money changes hands
            in the app.
          </p>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="rounded-xl bg-white p-6 text-center shadow-sm transition hover:-translate-y-0.5">
                <h3 className="text-3xl font-bold text-violet-600">{stat.number}</h3>
                <p className="mt-1 text-slate-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-slate-100 px-4 py-12 md:px-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-slate-800">Values</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {values.map((value, index) => (
              <div key={index} className="rounded-xl bg-white p-6 text-center shadow-sm transition hover:-translate-y-0.5">
                <i className={`${value.icon} text-3xl text-violet-600`} />
                <h3 className="mt-3 text-xl font-semibold text-slate-800">{value.title}</h3>
                <p className="mt-2 leading-7 text-slate-600">{value.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
