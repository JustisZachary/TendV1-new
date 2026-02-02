const emailChannels = [
  {
    id: "gmail",
    name: "Google",
    description: "Add a Gmail account or Google Group distribution list.",
    logoUrl: "https://logo.clearbit.com/google.com",
  },
  {
    id: "microsoft",
    name: "Microsoft",
    description: "Add an Outlook, Office365, or Exchange account.",
    logoUrl: "https://logo.clearbit.com/microsoft.com",
  },
  {
    id: "other-email",
    name: "Other email account",
    description: "Forward your emails to Tether to sync messages.",
    logoUrl: "https://logo.clearbit.com/icloud.com",
  },
];

const messagingChannels = [
  {
    id: "facebook",
    name: "Facebook",
    description: "Manage Facebook DMs and comments.",
    logoUrl: "https://logo.clearbit.com/facebook.com",
  },
  {
    id: "instagram",
    name: "Instagram",
    description: "Manage Instagram DMs and comments.",
    logoUrl: "https://logo.clearbit.com/instagram.com",
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: "Connect TikTok DMs to generate tags.",
    logoUrl: "https://logo.clearbit.com/tiktok.com",
  },
];

const churchManagementChannels = [
  {
    id: "pco",
    name: "Planning Center",
    description: "Sync people profiles and groups from PCO.",
  },
  {
    id: "rock",
    name: "Rock RMS",
    description: "Connect Rock profiles to match people in Tether.",
  },
  {
    id: "ccb",
    name: "CCB",
    description: "Pull member data to keep profiles in sync.",
  },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-widest text-gray-400">
          Dashboard
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Settings</h1>
        <p className="mt-3 text-sm text-gray-600">
          Connect your channels so Tether can tag incoming messages and surface
          requests in the dashboard.
        </p>
      </div>

      <section className="space-y-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Email</h2>
            <p className="mt-1 text-xs text-gray-500">
              Connect an inbox so Tether can tag requests from email.
            </p>
          </div>
          <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
            Coming soon
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {emailChannels.map((channel) => (
            <div
              key={channel.id}
              className="rounded-xl border border-gray-200 bg-gray-50/40 p-4"
            >
              <div className="flex items-start gap-3">
                <img
                  alt={`${channel.name} logo`}
                  className="h-8 w-8 rounded-full bg-white p-1"
                  src={channel.logoUrl}
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {channel.name}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {channel.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Church management systems
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Link profiles from PCO, Rock, or CCB. Full setup coming soon.
              </p>
            </div>
            <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
              Coming soon
            </span>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {churchManagementChannels.map((channel) => (
              <div
                key={channel.id}
                className="rounded-xl border border-gray-200 bg-gray-50/40 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {channel.name}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {channel.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900">Messaging</h3>
          <p className="mt-1 text-xs text-gray-500">
            Connect social accounts so Tether can scan DMs and tag requests.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {messagingChannels.map((channel) => (
              <div
                key={channel.id}
                className="rounded-xl border border-gray-200 bg-gray-50/40 p-4"
              >
                <div className="flex items-start gap-3">
                  <img
                    alt={`${channel.name} logo`}
                    className="h-8 w-8 rounded-full bg-white p-1"
                    src={channel.logoUrl}
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {channel.name}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {channel.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900">
          Automation preview
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Once connected, Tether will scan new DMs, suggest tags, and route
          requests into your dashboard for review.
        </p>
      </section>
    </div>
  );
}
