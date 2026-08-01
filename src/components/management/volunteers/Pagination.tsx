export default function Pagination() {
  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t px-6 py-4 md:flex-row">

      <p className="text-sm text-gray-500">
        Showing <strong>1</strong> to <strong>10</strong> of <strong>245</strong> volunteers
      </p>

      <div className="flex items-center gap-2">

        <button className="rounded-lg border px-3 py-2 hover:bg-slate-100">
          Previous
        </button>

        <button className="rounded-lg bg-[#0F2B7B] px-4 py-2 text-white">
          1
        </button>

        <button className="rounded-lg border px-4 py-2 hover:bg-slate-100">
          2
        </button>

        <button className="rounded-lg border px-4 py-2 hover:bg-slate-100">
          3
        </button>

        <button className="rounded-lg border px-3 py-2 hover:bg-slate-100">
          Next
        </button>

      </div>

    </div>
  );
}