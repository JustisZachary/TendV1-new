const contactTeams = [
  {
    name: "Care Team",
    description: "Pastoral care and follow-up coverage.",
  },
  {
    name: "Prayer Volunteers",
    description: "Prayer request triage and assignment.",
  },
  {
    name: "Campus Leads",
    description: "Local campus touchpoints and escalation.",
  },
] as const;

const contacts = [
  {
    name: "Avery Johnson",
    role: "Care Coordinator",
    campus: "Main",
    email: "avery@tend.church",
  },
  {
    name: "Micah Brooks",
    role: "Volunteer Lead",
    campus: "North",
    email: "micah@tend.church",
  },
  {
    name: "Jordan Lee",
    role: "Campus Pastor",
    campus: "Downtown",
    email: "jordan@tend.church",
  },
] as const;

export default function PeoplePage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-gray-400">
          Contacts
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">
          Staff + volunteer directory
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Connect with teammates and keep coverage organized. Full profile
          interactions are coming soon.
        </p>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        {contactTeams.map((team) => (
          <div
            key={team.name}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-semibold text-gray-900">{team.name}</p>
            <p className="mt-2 text-sm text-gray-600">{team.description}</p>
            <span className="mt-4 inline-flex rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
              Coming soon
            </span>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Staff and volunteer list
          </h2>
          <span className="text-xs text-gray-500">Preview</span>
        </div>
        <div className="mt-4 grid gap-3">
          {contacts.map((contact) => (
            <div
              key={contact.email}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {contact.name}
                </p>
                <p className="text-xs text-gray-500">{contact.role}</p>
              </div>
              <div className="text-right text-xs text-gray-500">
                <p>{contact.campus} campus</p>
                <p>{contact.email}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
