import { describe, expect, it } from "vitest";

import {
  AuthRequestTimeoutError,
  authFailureMessage,
  signupConfirmationUrl,
  withAuthTimeout,
} from "../lib/auth.js";

describe("dashboard authentication", () => {
  it("returns successful authentication responses", async () => {
    await expect(withAuthTimeout(Promise.resolve("ok"), 10)).resolves.toBe("ok");
  });

  it("bounds an unavailable authentication service", async () => {
    await expect(withAuthTimeout(new Promise(() => undefined), 1)).rejects.toBeInstanceOf(
      AuthRequestTimeoutError,
    );
  });

  it("uses a stable user-facing network error", () => {
    expect(authFailureMessage(new TypeError("Failed to fetch"))).toBe(
      "Authentication is temporarily unreachable. Please try again.",
    );
  });

  it("returns confirmations to the single-origin dashboard", () => {
    expect(signupConfirmationUrl("https://usekratose.vercel.app")).toBe(
      "https://usekratose.vercel.app/auth/callback?redirect=%2Fdashboard",
    );
  });
});
