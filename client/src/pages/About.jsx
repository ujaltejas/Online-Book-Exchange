import { Link } from "react-router-dom";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const SECTIONS = [
  { title: "Listing a book", body: ["Create a free account, choose List a book, and fill in the details. Photos are optional but help.", "Choose Swap if you would like something in return, or Give it away if you just want it to be used. Mention what you would like in the description."] },
  { title: "Getting in touch", body: ["Every listing has a message form. When someone writes, we email you their message, their name and their email address. Your own email address is never shown on the site.", "Reply to that email to continue the conversation. You can message up to five owners an hour."] },
  { title: "Handing the book over", body: ["BookSwap does not handle payments, shipping or meetings. Agree a time and place between yourselves, and a public spot on campus is best.", "Once it has gone, mark the listing as Reserved or Exchanged so other students know."] },
];

const FAQ = [
  ["Does it cost anything?", "No. BookSwap is free for students, and no money changes hands through the site."],
  ["How many books can I list?", "Up to 20 at a time. Delete or mark books as exchanged to make room."],
  ["Who can see my email address?", "Only owners you choose to message. They receive it in the email we send on your behalf."],
];

export default function About() {
  useDocumentTitle("How it works");
  return (
    <div className="page max-w-3xl py-14">
      <h1 className="text-[clamp(2.2rem,5vw,3.4rem)] font-extrabold leading-tight">How BookSwap works</h1>
      <p className="reading mt-4 text-lg text-ink-soft">A simple way to keep good books in circulation on campus.</p>

      <div className="mt-12 space-y-10">
        {SECTIONS.map((s) => (
          <section key={s.title} className="border-l-[6px] border-brass pl-6">
            <h2 className="text-2xl font-bold">{s.title}</h2>
            {s.body.map((p) => <p key={p} className="reading mt-3">{p}</p>)}
          </section>
        ))}
      </div>

      <h2 className="mt-16 text-2xl font-bold">Questions</h2>
      <dl className="mt-4 divide-y divide-line border-y border-line">
        {FAQ.map(([q, a]) => (
          <div key={q} className="py-5">
            <dt className="font-bold">{q}</dt>
            <dd className="reading mt-1 text-ink-soft">{a}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-12 flex gap-3">
        <Link to="/books" className="btn btn-primary">Browse books</Link>
        <Link to="/add-book" className="btn btn-ghost">List a book</Link>
      </div>
    </div>
  );
}
