import { afterEach, describe, expect, it } from "vitest";

import { backendUrl } from "../lib/backend.js";

const originalMarketingUrl = process.env.NEXT_PUBLIC_MARKETING_URL;
const originalApiUrl = process.env.USEKRATOSE_API_URL;

afterEach(() => {
  process.env.NEXT_PUBLIC_MARKETING_URL = originalMarketingUrl;
  process.env.USEKRATOSE_API_URL = originalApiUrl;
});

describe("dashboard backend URL", () => {
  it("uses the canonical marketing origin before a deployment alias", () => {
    process.env.NEXT_PUBLIC_MARKETING_URL = "https://usekratose.site";
    process.env.USEKRATOSE_API_URL = "https://usekratose.vercel.app";

    expect(backendUrl("/api/v1/dashboard")).toBe(
      "https://usekratose.site/api/v1/dashboard",
    );
  });
});
