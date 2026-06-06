import "@testing-library/jest-dom/vitest";
import "@testing-library/react/dont-cleanup-after-each";

import { cleanup } from "@testing-library/react";
import { act } from "react";
import { afterEach } from "vitest";

async function flushActQueue() {
  await Promise.resolve();
  await Promise.resolve();
}

afterEach(async () => {
  await act(async () => {
    cleanup();
    await flushActQueue();
  });
});
