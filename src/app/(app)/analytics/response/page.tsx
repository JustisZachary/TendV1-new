export default function ResponsePage() {
  return (
    <>
      <div className="border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-widest text-gray-400">
          Dashboard
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Response</h1>
        <p className="mt-3 text-sm text-gray-600">
          Track response volume and follow-up performance.
        </p>
      </div>

      <div className="flex flex-col gap-6 px-6 pb-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-900">Coming soon</h2>
          <p className="mt-2 text-sm text-gray-600">
            Response metrics and trends will appear here.
          </p>
        </section>
      </div>
    </>
  );
}
