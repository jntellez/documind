import {
  initializeRetryScheduler,
  resetRetryScheduler,
  scheduleRetryAt,
} from "./retryScheduler";

describe("retryScheduler", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    resetRetryScheduler();
    jest.useRealTimers();
  });

  it("runs the callback when the scheduled retry time is reached", () => {
    const callback = jest.fn();
    initializeRetryScheduler(callback);

    scheduleRetryAt(new Date(Date.now() + 1_000).toISOString());
    jest.advanceTimersByTime(1_000);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("keeps the earliest scheduled retry", () => {
    const callback = jest.fn();
    initializeRetryScheduler(callback);

    scheduleRetryAt(new Date(Date.now() + 1_000).toISOString());
    scheduleRetryAt(new Date(Date.now() + 5_000).toISOString());

    jest.advanceTimersByTime(1_000);

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
