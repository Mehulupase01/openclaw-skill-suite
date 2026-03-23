import { buildPublishCommand, parseFlag, readReleaseManifest } from "./lib/release.ts";

async function main() {
  const repoUrl = parseFlag("--repo-url");
  const skills = await readReleaseManifest();

  console.log("# Publish Commands");
  console.log("");
  if (repoUrl) {
    console.log(`Repo URL: ${repoUrl}`);
    console.log("");
  } else {
    console.log("Repo URL: <set with --repo-url after GitHub repo creation>");
    console.log("");
  }
  for (const skill of skills) {
    console.log(`## ${skill.name}`);
    console.log("");
    console.log(`- slug: ${skill.slug}`);
    console.log(`- version: ${skill.version}`);
    console.log(`- path: ${skill.path}`);
    console.log("");
    console.log("```bash");
    console.log(buildPublishCommand(skill));
    console.log("```");
    console.log("");
  }
}

void main();
