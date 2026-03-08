import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pagePath = `file://${path.join(__dirname, "index.html")}`;

const shotsDir = path.join(__dirname, "screenshots");
const fs = await import("node:fs/promises");
await fs.mkdir(shotsDir, { recursive: true });

const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

const targets = [
  { prefix: "desktop", width: 1440, height: 900 },
  { prefix: "mobile", width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 },
];

for (const target of targets) {
  const page = await browser.newPage();
  await page.setViewport({
    width: target.width,
    height: target.height,
    isMobile: target.isMobile || false,
    deviceScaleFactor: target.deviceScaleFactor || 1,
  });

  await page.goto(pagePath, { waitUntil: "networkidle0" });

  const buttons = await page.$$eval("#screenNav button[data-screen]", (nodes) =>
    nodes.map((node) => ({
      id: node.getAttribute("data-screen"),
      label: node.textContent?.trim() || "screen",
    }))
  );

  for (const [index, button] of buttons.entries()) {
    await page.click(`#screenNav button[data-screen=\"${button.id}\"]`);
    await new Promise((resolve) => setTimeout(resolve, 200));
    const fileName = `${target.prefix}-${String(index + 1).padStart(2, "0")}-${button.id}.png`;
    await page.screenshot({
      path: path.join(shotsDir, fileName),
      fullPage: true,
    });
  }

  await page.close();
}

await browser.close();
console.log("Screenshots generated in:", shotsDir);
