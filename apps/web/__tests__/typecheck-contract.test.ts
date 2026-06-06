import packageJson from "../package.json";
import tsconfig from "../tsconfig.json";

import { describe, expect, it } from "vitest";

describe("web typecheck contract", () => {
  it("generates Next route types before running TypeScript", () => {
    expect(packageJson.scripts.typecheck).toBe(
      "next typegen && tsc --project tsconfig.json --noEmit",
    );
  });

  it("keeps Next generated route types included in tsconfig", () => {
    expect(tsconfig.include).toContain(".next/types/**/*.ts");
  });
});
