import { readFileSync } from "node:fs";
import path from "node:path";

export type PrivacyPolicySubsection = {
  body: string[];
  title: string;
};

export type PrivacyPolicySection = {
  body: string[];
  bullets: string[];
  subsections: PrivacyPolicySubsection[];
  title: string;
};

export type PrivacyPolicyDocument = {
  intro: string[];
  lastUpdated: string;
  sections: PrivacyPolicySection[];
  title: string;
};

const privacyPolicyPath = path.resolve(process.cwd(), "..", "..", "docs", "privacy-policy.md");

function normalizeMarkdownInline(value: string) {
  return value.replace(/\*\*(.*?)\*\*/g, "$1").trim();
}

export function getPrivacyPolicyDocument(): PrivacyPolicyDocument {
  const markdown = readFileSync(privacyPolicyPath, "utf8");
  const lines = markdown.split(/\r?\n/);

  const title = normalizeMarkdownInline(lines.find((line) => line.startsWith("# "))?.replace(/^#\s+/, "") ?? "Privacy Policy");
  const lastUpdated = normalizeMarkdownInline(lines.find((line) => line.startsWith("**Last updated:**"))?.replace("**Last updated:**", "").trim() ?? "");

  const sections: PrivacyPolicySection[] = [];
  const intro: string[] = [];

  let currentSection: PrivacyPolicySection | null = null;
  let currentSubsection: PrivacyPolicySubsection | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line || line.startsWith("# ") || line.startsWith("**Last updated:**")) {
      continue;
    }

    if (line.startsWith("## ")) {
      currentSection = {
        title: normalizeMarkdownInline(line.replace(/^##\s+/, "")),
        body: [],
        bullets: [],
        subsections: [],
      };
      sections.push(currentSection);
      currentSubsection = null;
      continue;
    }

    if (line.startsWith("### ")) {
      if (!currentSection) {
        continue;
      }

      currentSubsection = {
        title: normalizeMarkdownInline(line.replace(/^###\s+/, "")),
        body: [],
      };
      currentSection.subsections.push(currentSubsection);
      continue;
    }

    if (line.startsWith("- ")) {
      const bullet = normalizeMarkdownInline(line.replace(/^-\s+/, ""));

      if (currentSubsection) {
        currentSubsection.body.push(`• ${bullet}`);
      } else if (currentSection) {
        currentSection.bullets.push(bullet);
      }

      continue;
    }

    if (!currentSection) {
      intro.push(normalizeMarkdownInline(line));
      continue;
    }

    if (currentSubsection) {
      currentSubsection.body.push(normalizeMarkdownInline(line));
    } else {
      currentSection.body.push(normalizeMarkdownInline(line));
    }
  }

  return {
    title,
    lastUpdated,
    intro,
    sections,
  };
}
