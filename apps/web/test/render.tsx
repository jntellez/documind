import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import { act, type ReactElement } from "react";

type RenderAsyncResult = RenderResult & {
  rerenderAsync: (ui: ReactElement) => Promise<void>;
};

async function flushActQueue() {
  await Promise.resolve();
  await Promise.resolve();
}

export async function renderAsync(ui: ReactElement, options?: Omit<RenderOptions, "queries">): Promise<RenderAsyncResult> {
  let result!: RenderResult;

  await act(async () => {
    result = render(ui, options);
    await flushActQueue();
  });

  return {
    ...result,
    rerenderAsync: async (nextUi: ReactElement) => {
      await act(async () => {
        result.rerender(nextUi);
        await flushActQueue();
      });
    },
  };
}
