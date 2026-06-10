import { Link } from "react-router-dom";

function Card({ item }) {
  const imageUrl = item.images || item.img || "/placeholder-property.jpg";
  const exchangeLabel = item.exchangeType === "free" ? "Free" : "Exchange";

  return (
    <div className="overflow-hidden rounded-[10px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.1)]">
      <Link to={`/${item.id}`} className="relative block h-[200px] w-full">
        <img src={imageUrl} alt={item.title} className="h-full w-full object-cover" />
        {item.condition && (
          <div
            className={`absolute left-2.5 top-2.5 rounded px-2.5 py-1 text-xs font-medium capitalize text-white ${
              item.exchangeType === "free" ? "bg-emerald-500" : "bg-sky-500"
            }`}
          >
            {item.condition} · {exchangeLabel}
          </div>
        )}
      </Link>
      <div className="flex flex-col gap-2.5 p-4">
        <h2 className="line-clamp-2 min-h-[2.8em] text-lg font-medium leading-6 text-slate-800">
          <Link to={`/${item.id}`} className="transition hover:text-violet-600">
            {item.title}
          </Link>
        </h2>
        <p className="m-0 flex items-center gap-1 text-sm text-slate-500">
          <span>{item.author}</span>
        </p>
        {(item.university || item.college) && (
          <p className="my-1 text-sm text-slate-600/90">
            {item.university}
            {item.university && item.college ? " · " : ""}
            {item.college}
          </p>
        )}
        <p className="my-1 text-lg font-semibold text-violet-600">{item.category}</p>
        <div className="mt-1 flex items-center justify-between max-md:flex-col max-md:items-start max-md:gap-2.5">
          <div className="flex flex-wrap gap-2.5 max-md:w-full">
            <div className="flex items-center gap-1 rounded bg-violet-100 px-2.5 py-1 text-[13px] text-slate-600">
              <span>{exchangeLabel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
