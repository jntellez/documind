export type LegalSectionLink = {
  href: string;
  label: string;
};

export type LegalContentSection = {
  bullets?: readonly string[];
  links?: readonly LegalSectionLink[];
  paragraphs?: readonly string[];
  title: string;
};

export type LegalPageContent = {
  cta: {
    primary: LegalSectionLink;
    secondary: LegalSectionLink;
  };
  eyebrow: string;
  intro: readonly string[];
  sections: readonly LegalContentSection[];
  title: string;
};

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

export const supportPageContent = {
  eyebrow: "Support",
  title: "Support",
  intro: [
    "Need help installing Documind for Android or confirming that you are using the official release path? This page covers the first troubleshooting steps before you contact support.",
    "We keep these instructions practical: use the first-party download route, verify release details, and collect a few basics if something goes wrong.",
  ],
  sections: [
    {
      title: "Install safely from official sources",
      bullets: [
        "Download the APK only from the official Documind download page or the official GitHub Releases page.",
        "Check the version, publish date, and file name shown on the download route before installing.",
        "If the latest APK is temporarily unavailable on the website, use the official GitHub Releases page while metadata recovery is in progress.",
      ],
      links: [
        { href: "/download", label: "Go to the official download page" },
        { href: "https://github.com/jntellez/documind/releases", label: "Open the official GitHub Releases page" },
      ],
    },
    {
      title: "Common Android install blockers",
      paragraphs: [
        "If Android blocks installation, approve installs from your browser or file manager when the system prompt appears, then reopen the APK.",
        "If the installer opens but does not finish, confirm you have enough free storage and remove older conflicting test builds before retrying.",
      ],
      bullets: [
        "Retry the download on a stable connection if the APK file looks incomplete or Android reports that it cannot open the package.",
        "Use the version shown on the download page or releases page to make sure you are testing the expected build.",
      ],
    },
    {
      title: "Before you contact support",
      paragraphs: [
        "Include enough detail for us to reproduce the problem quickly.",
      ],
      bullets: [
        "Your device model and Android version.",
        "Whether you downloaded from documind.app or the official GitHub Releases page.",
        "The app version or release tag you tried to install.",
        "A screenshot or exact text of the error, if Android shows one.",
      ],
    },
    {
      title: "Policy and account questions",
      paragraphs: [
        "For privacy, terms, or release authenticity questions, review the public policy pages first and then email support if you still need clarification.",
        "Support is currently handled by email, so clear reproduction steps help more than short " +
          '"it does not work" notes.',
      ],
      links: [
        { href: "/privacy", label: "Review the privacy policy" },
        { href: "/terms", label: "Review the terms of service" },
      ],
    },
  ],
  cta: {
    primary: { href: "/download", label: "Go to the official download page" },
    secondary: { href: "https://github.com/jntellez/documind/releases", label: "Browse GitHub releases" },
  },
} as const satisfies LegalPageContent;

export const termsPageContent = {
  eyebrow: "Legal",
  title: "Terms of Service",
  intro: [
    "These public terms explain the basic rules for using the Documind website and Android app. They are written as a practical first public version for launch, not as a dead-end placeholder.",
    "If you do not agree with these terms, do not use the site, download the APK, or submit documents for processing.",
  ],
  sections: [
    {
      title: "Using Documind",
      paragraphs: [
        "You may use Documind only in ways that follow applicable law and these terms.",
        "If you create an account or authenticate through a third-party provider, you are responsible for the accuracy of the information you use and for maintaining access to that account.",
      ],
    },
    {
      title: "Your documents and permissions",
      paragraphs: [
        "You keep ownership of the documents and content you upload or connect to the app.",
        "You are responsible for making sure you have the right to upload, sync, process, or ask AI questions about that content.",
      ],
      bullets: [
        "Do not upload content that is unlawful, malicious, or infringes another party's rights.",
        "Do not use Documind to distribute malware, spam, or abusive material.",
      ],
    },
    {
      title: "AI-assisted features",
      paragraphs: [
        "Documind may use AI-powered services to help with search, summarization, and question answering over your documents.",
        "AI responses can be incomplete or incorrect, so you should verify important answers before relying on them for legal, financial, medical, or other high-stakes decisions.",
      ],
      links: [{ href: "/privacy", label: "See how AI processing is described in the privacy policy" }],
    },
    {
      title: "Availability, updates, and release delivery",
      paragraphs: [
        "We may update, improve, pause, or remove parts of the website or app as the product evolves.",
        "The website aims to point you to the latest official Android APK, but temporary metadata issues can require fallback to the official GitHub Releases page.",
      ],
      bullets: [
        "We do not guarantee uninterrupted availability on every device, Android version, or network connection.",
        "You are responsible for keeping your device, browser, and installed app version reasonably up to date.",
      ],
    },
    {
      title: "Acceptable use",
      bullets: [
        "Do not interfere with the service, abuse automated systems, or attempt to bypass security or distribution controls.",
        "Do not misrepresent unofficial builds, mirrors, or modified APKs as official Documind releases.",
        "Do not reverse engineer or probe the service in ways that could harm other users or the platform.",
      ],
    },
    {
      title: "Disclaimers and contact",
      paragraphs: [
        "To the extent allowed by law, Documind is provided on an \"as is\" and \"as available\" basis without guarantees that every feature will always be available or error free.",
        "We may update these terms as the app and website mature. Material updates will be posted on this page, and continued use after publication means you accept the revised terms.",
      ],
      links: [
        { href: "/support", label: "Contact support" },
        { href: "/privacy", label: "Review the privacy policy" },
      ],
    },
  ],
  cta: {
    primary: { href: "/download", label: "Go to the official download page" },
    secondary: { href: "/support", label: "Contact support" },
  },
} as const satisfies LegalPageContent;
