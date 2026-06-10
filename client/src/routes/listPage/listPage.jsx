import { useState, useEffect, useCallback } from "react";
import Card from "../../components/card/Card";
import Filter from "../../components/filter/Filter";
import useBookStore from "../../store/useBookStore";
import useAuthStore from "../../store/useAuthStore";

function ListPage() {
  const { getAllBooks, books, loading, error } = useBookStore();
  const { user } = useAuthStore();
  const [filters, setFilters] = useState({
    q: "",
    university: "",
    college: "",
    category: "",
    condition: "",
    exchangeType: "",
  });

  const fetchBooks = useCallback(
    (filterData) => {
      const params = { ...filterData };
      if (user?._id) {
        params.excludeOwner = user._id;
      }
      return getAllBooks(params);
    },
    [getAllBooks, user]
  );

  useEffect(() => {
    fetchBooks(filters);
  }, [filters, fetchBooks]);

  const handleFilterChange = useCallback((filterData) => {
    setFilters(filterData);
  }, []);

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-80px)] bg-slate-100">
      <div className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 md:px-6">
        <div className="flex h-full flex-col gap-6 pb-8">
          <Filter onFilterChange={handleFilterChange} />

          {loading ? (
            <div className="flex h-[300px] w-full flex-col items-center justify-center rounded-lg bg-white shadow-sm">
              <div className="mb-5 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-violet-600" />
              <p className="text-lg text-slate-500">Loading books…</p>
            </div>
          ) : error ? (
            <div className="flex h-[300px] w-full flex-col items-center justify-center rounded-lg bg-white p-8 text-center shadow-sm">
              <h3 className="mb-4 text-2xl font-semibold text-red-500">Error</h3>
              <p className="mb-6 max-w-xl text-base text-slate-500">{error}</p>
              <button
                type="button"
                className="rounded-lg bg-gradient-to-r from-indigo-400 to-violet-600 px-6 py-3 text-base font-medium text-white transition hover:-translate-y-0.5"
                onClick={() => fetchBooks(filters)}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="rounded-lg bg-white px-6 py-4 shadow-sm">
                <h2 className="text-xl font-medium text-slate-800">Books available: {books.length}</h2>
                {user && (
                  <p className="mt-1 text-[0.95rem] text-slate-600/90">
                    Your own listings are hidden here so you can focus on other students’ books.
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
                {books.length > 0 ? (
                  books.map((item) => (
                    <Card
                      key={item._id}
                      item={{
                        id: item._id,
                        title: item.title,
                        author: item.author,
                        university: item.university,
                        college: item.college,
                        category: item.category,
                        condition: item.condition,
                        exchangeType: item.exchangeType,
                        images: item.images?.length ? item.images[0].url : null,
                      }}
                    />
                  ))
                ) : (
                  <div className="col-span-full rounded-lg bg-white px-8 py-12 text-center shadow-sm">
                    <h3 className="mb-4 text-2xl font-semibold text-slate-800">No books match your filters</h3>
                    <p className="text-base text-slate-500">Try clearing filters or check back later.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ListPage;
