export const privacyPolicySections = [
  {
    title: "Information we collect",
    body: "Documind may receive account details from authentication providers, content you choose to upload or link, and local device storage needed for offline access, preferences, and session persistence.",
  },
  {
    title: "How we use information",
    body: "Collected information is used to authenticate users, organize documents, power reading and document chat features, support offline access, and improve reliability.",
  },
  {
    title: "AI processing",
    body: "Some submitted content may be processed by AI-powered services for search, summarization, and document question answering. Avoid sending highly sensitive information unless you are comfortable with that processing.",
  },
  {
    title: "Data sharing and contact",
    body: "Documind does not sell personal information. Data is shared only with authentication, infrastructure, and AI-processing providers required to operate the app.",
  },
] as const;

export const supportChecklist = [
  "Download the APK only from the official Documind download page or the official GitHub Releases page.",
  "If Android blocks installation, confirm you allowed installs from your browser or file manager, then retry.",
  "If the latest APK is unavailable, use the official GitHub Releases page while metadata recovery is in progress.",
] as const;

export const termsPlaceholder = {
  title: "Terms of Service",
  summary:
    "Launch placeholder: the public terms are being finalized for the first official Android landing release.",
  followUp:
    "Until the final terms publish, contact support for distribution, usage, or policy questions before installing the APK.",
} as const;
