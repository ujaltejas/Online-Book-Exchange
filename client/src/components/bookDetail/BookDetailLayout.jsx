import PropertySlider from "../slider/slider";
import { useState } from "react";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlineCategory, MdOutlineAutoStories, MdOutlineWorkspacePremium } from "react-icons/md";

/**
 * Shared book detail layout (single-page grid): main column + sidebar.
 * Used by public SinglePage and profile BookView.
 */
function BookDetailLayout({
  book,
  sidebar,
  topBar = null,
  detailExtraCells = null,
  emptyImagesMessage = "No image uploaded",
}) {
  const [, setIsFullscreen] = useState(false);

  const {
    title,
    author,
    university,
    college,
    description,
    category,
    condition,
    exchangeType,
    images,
  } = book;

  const formattedImages = (images || []).map((img) => img.url);
  const locationLine = [university, college].filter(Boolean).join(", ");

  return (
    <div className="mx-auto min-h-[calc(100vh-80px)] max-w-[1180px] px-6 pb-12 pt-7">
      {topBar}
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <main className="min-w-0">
          <div className="overflow-hidden rounded-xl shadow-[0_4px_24px_rgba(15,23,42,0.08)]">
            {formattedImages.length > 0 ? (
              <PropertySlider images={formattedImages} onFullscreenChange={setIsFullscreen} />
            ) : (
              <div className="flex min-h-[280px] items-center justify-center bg-slate-50 text-base text-slate-500">
                {emptyImagesMessage}
              </div>
            )}
          </div>

          <div className="mt-7">
            <div className="mb-2.5 flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
              <h1 className="min-w-0 flex-1 text-[clamp(1.5rem,4vw,2rem)] font-bold leading-tight text-slate-800">
                {title}
              </h1>
              <span className="shrink-0 rounded-full bg-gradient-to-r from-violet-500 via-violet-600 to-violet-700 px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(124,58,237,0.35)]">
                {exchangeType === "free" ? "Free" : "Exchange"}
              </span>
            </div>
            <p className="mb-3 text-[1.05rem] font-medium text-slate-600">{author}</p>
            {locationLine && (
              <p className="mb-5 flex items-start gap-2 text-sm leading-6 text-slate-500">
                <IoLocationOutline className="mt-0.5 h-[22px] w-[22px] shrink-0 text-violet-600" aria-hidden />
                <span>{locationLine}</span>
              </p>
            )}
            <div className="grid gap-3 rounded-xl bg-slate-100 p-4 sm:grid-cols-3">
              <div className="flex min-w-0 flex-col gap-1">
                <MdOutlineCategory className="mb-0.5 h-[22px] w-[22px] text-violet-600" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category</span>
                <span className="break-words text-sm font-semibold text-slate-800">{category}</span>
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <MdOutlineWorkspacePremium className="mb-0.5 h-[22px] w-[22px] text-violet-600" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Condition</span>
                <span className="break-words text-sm font-semibold text-slate-800">{condition}</span>
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <MdOutlineAutoStories className="mb-0.5 h-[22px] w-[22px] text-violet-600" aria-hidden />
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Author</span>
                <span className="break-words text-sm font-semibold text-slate-800">{author}</span>
              </div>
            </div>
          </div>

          <section className="mt-8">
            <h2 className="mb-3.5 border-b-2 border-slate-200 pb-2.5 text-xl font-bold text-slate-800">Description</h2>
            <p className="text-base leading-7 text-slate-600">{description}</p>
          </section>

          <section className="mt-8">
            <h2 className="mb-3.5 border-b-2 border-slate-200 pb-2.5 text-xl font-bold text-slate-800">Book details</h2>
            <div className="grid gap-3.5 sm:grid-cols-2">
              <div className="rounded-[10px] border border-slate-200 bg-slate-50 px-4 py-3.5">
                <span className="mb-1.5 block text-xs font-medium text-slate-500">Category</span>
                <span className="break-words text-sm font-semibold text-slate-800">{category}</span>
              </div>
              <div className="rounded-[10px] border border-slate-200 bg-slate-50 px-4 py-3.5">
                <span className="mb-1.5 block text-xs font-medium text-slate-500">Condition</span>
                <span className="break-words text-sm font-semibold text-slate-800">{condition}</span>
              </div>
              <div className="rounded-[10px] border border-slate-200 bg-slate-50 px-4 py-3.5">
                <span className="mb-1.5 block text-xs font-medium text-slate-500">Listing type</span>
                <span className="break-words text-sm font-semibold text-slate-800">
                  {exchangeType === "free" ? "Free giveaway" : "Exchange"}
                </span>
              </div>
              <div className="rounded-[10px] border border-slate-200 bg-slate-50 px-4 py-3.5">
                <span className="mb-1.5 block text-xs font-medium text-slate-500">Author</span>
                <span className="break-words text-sm font-semibold text-slate-800">{author}</span>
              </div>
              {university && (
                <div className="rounded-[10px] border border-slate-200 bg-slate-50 px-4 py-3.5">
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">University</span>
                  <span className="break-words text-sm font-semibold text-slate-800">{university}</span>
                </div>
              )}
              {college && (
                <div className="rounded-[10px] border border-slate-200 bg-slate-50 px-4 py-3.5">
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">College</span>
                  <span className="break-words text-sm font-semibold text-slate-800">{college}</span>
                </div>
              )}
              {detailExtraCells}
            </div>
          </section>

          {locationLine && (
            <section className="mt-8">
              <h2 className="mb-3.5 border-b-2 border-slate-200 pb-2.5 text-xl font-bold text-slate-800">Location</h2>
              <div className="flex items-start gap-3.5 rounded-xl border border-slate-200 bg-slate-50 px-5 py-[18px]">
                <IoLocationOutline className="mt-0.5 h-7 w-7 shrink-0 text-violet-600" aria-hidden />
                <div>
                  <p className="mb-1 text-[1.05rem] font-semibold text-slate-800">{university}</p>
                  {college && <p className="text-sm text-slate-600">{college}</p>}
                </div>
              </div>
            </section>
          )}
        </main>

        {sidebar}
      </div>
    </div>
  );
}

export default BookDetailLayout;
