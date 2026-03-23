import { spawn } from "node:child_process";
import { buildCliAuthUrl, startLoopbackAuthServer } from "../node_modules/clawhub/dist/browserAuth.js";
import { discoverRegistryFromSite } from "../node_modules/clawhub/dist/discovery.js";
import { cmdLogin } from "../node_modules/clawhub/dist/cli/commands/auth.js";

type LoginOpts = {
  workdir: string;
  dir: string;
  site: string;
  registry: string;
  registrySource: "default" | "cli";
};

function parseFlag(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function openUrlInWindowsBrowser(url: string) {
  const escaped = url.replaceAll("'", "''");
  const child = spawn(
    "powershell.exe",
    ["-NoProfile", "-Command", `Start-Process '${escaped}'`],
    { detached: true, stdio: "ignore" },
  );
  child.unref();
}

async function main() {
  if (process.platform !== "win32") {
    throw new Error("This helper is only needed on Windows.");
  }

  const site = parseFlag("--site")?.trim() || "https://clawhub.ai";
  const label = parseFlag("--label")?.trim() || "CLI token";

  const receiver = await startLoopbackAuthServer();
  const discovery = await discoverRegistryFromSite(site).catch(() => null);
  const authBase = discovery?.authBase?.trim() || site;
  const authUrl = buildCliAuthUrl({
    siteUrl: authBase,
    redirectUri: receiver.redirectUri,
    label,
    state: receiver.state,
  });

  console.log("Opening browser with Windows-safe quoting:");
  console.log(authUrl);
  openUrlInWindowsBrowser(authUrl);

  const result = await receiver.waitForResult();
  const opts: LoginOpts = {
    workdir: process.cwd(),
    dir: "skills",
    site,
    registry: result.registry?.trim() || site,
    registrySource: result.registry?.trim() ? "cli" : "default",
  };
  await cmdLogin(opts, result.token, true);
}

void main();
