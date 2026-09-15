import { existsSync, readdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import { defineConfig } from "cypress";
import registerCodeCoverageTasks from "@cypress/code-coverage/task";

// Chrome for Testing is not auto-detected by Cypress. Look it up in the
// standard browser caches (puppeteer / playwright) and register it as
// the "chromium" browser so it can be launched with --browser chromium.
function findChromeForTesting(): { path: string; version: string } | null {
  const candidates: { bin: string; version: string }[] = [];

  const puppeteerDir = join(homedir(), ".cache", "puppeteer", "chrome");
  if (existsSync(puppeteerDir)) {
    for (const v of readdirSync(puppeteerDir)) {
      candidates.push({
        bin: join(puppeteerDir, v, "chrome-linux64", "chrome"),
        version: v.replace(/^.*-/, ""),
      });
    }
  }

  const playwrightDir = join(homedir(), ".cache", "ms-playwright");
  if (existsSync(playwrightDir)) {
    for (const d of readdirSync(playwrightDir)) {
      if (!/^chrome-/.test(d) && !/^chromium-/.test(d)) continue;
      for (const platform of ["chrome-linux64", "chrome-linux"]) {
        candidates.push({
          bin: join(playwrightDir, d, platform, "chrome"),
          version: d.replace(/^chrome-/, ""),
        });
      }
    }
  }

  for (const c of candidates) {
    if (existsSync(c.bin)) {
      const match = c.version.match(/(\d+\.\d+\.\d+\.\d+)$/);
      return { path: c.bin, version: match ? match[1] : c.version };
    }
  }

  return null;
}

export default defineConfig({
  videosFolder: "cypress/videos",
  screenshotsFolder: "cypress/screenshots",
  fixturesFolder: "cypress/fixtures",
  video: false,

  e2e: {
    setupNodeEvents(on, config) {
      registerCodeCoverageTasks(on, config);

      if (!config.browsers.some((b) => b.name === "chromium")) {
        const chrome = findChromeForTesting();
        if (chrome) {
          config.browsers.push({
            name: "chromium",
            family: "chromium",
            channel: "stable",
            displayName: "Chromium (Chrome for Testing)",
            version: chrome.version,
            majorVersion: Number(chrome.version.split(".")[0]),
            path: chrome.path,
            isHeaded: false,
            isHeadless: true,
          });
        }
      }

      return config;
    },
    baseUrl: "http://localhost:4200",
  },

  component: {
    devServer: {
      framework: "angular",
      bundler: "webpack",
    },
    specPattern: "**/*.cy.ts",
  },
});
