import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:8080";
const OUT = "/tmp/tangle-shots";
mkdirSync(OUT, { recursive: true });

// Key Designer-journey screens to capture.
const SCREENS = [
  ["splash", "/"],
  ["welcome-1", "/welcome/1"],
  ["welcome-2", "/welcome/2"],
  ["account-type", "/account-type"],
  ["sign-in", "/sign-in"],
  ["plans", "/plans"],
  ["signup", "/signup"],
  ["add-work", "/signup/work"],
  ["consent", "/signup/consent"],
  ["welcome", "/welcome"],
  ["tour", "/tour"],
  ["home", "/home"],
  ["foundation", "/foundation"],
];

const browser = await chromium.launch();
for (const scheme of ["light", "dark"]) {
  const ctx = await browser.newContext({
    colorScheme: scheme, // exercises system-follow (preference stays "system")
    viewport: { width: 440, height: 880 },
    deviceScaleFactor: 2,
  });
  for (const [name, path] of SCREENS) {
    const page = await ctx.newPage();
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(700); // let fonts + splash settle
    await page.screenshot({ path: `${OUT}/${scheme}-${name}.png` });
    console.log("shot:", scheme, name);
    await page.close();
  }
  await ctx.close();
}
await browser.close();
console.log("done →", OUT);
