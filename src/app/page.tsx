export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center gap-6 px-6 py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">
          Tend Contact Form
        </h1>
        <p className="text-sm text-gray-600">
          Use the form to capture submissions and view them in the dashboard.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href="/form"
          className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          Open Form
        </a>
        <a
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
        >
          View Dashboard
        </a>
      </div>
    </main>
  );
}
