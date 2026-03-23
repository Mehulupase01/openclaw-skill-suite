import fs from "node:fs/promises";
import path from "node:path";
import { parseFlag, readReleaseManifest } from "./lib/release.ts";
import { repoRoot } from "./lib/skills.ts";

function upsertHomepage(markdown: string, homepage: string) {
  const frontmatterMatch = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(\r?\n[\s\S]*)$/);
  if (!frontmatterMatch) {
    throw new Error("SKILL.md is missing YAML frontmatter.");
  }
  const [, frontmatter, rest] = frontmatterMatch;
  if (frontmatter.includes("homepage:")) {
    const updated = frontmatter.replace(/homepage:\s.*$/m, `homepage: ${homepage}`);
    return `---\n${updated}\n---${rest}`;
  }

  if (!frontmatter.includes("openclaw:")) {
    throw new Error("SKILL.md frontmatter is missing metadata.openclaw.");
  }

  const updated = frontmatter.replace(/(openclaw:\r?\n)/, `$1    homepage: ${homepage}\n`);
  return `---\n${updated}\n---${rest}`;
}

async function main() {
  const repoUrl = parseFlag("--repo-url");
  if (!repoUrl) {
    throw new Error("Usage: tsx tools/set-skill-homepages.ts --repo-url <url>");
  }

  const skills = await readReleaseManifest();
  for (const skill of skills) {
    const filePath = path.join(repoRoot, skill.path, "SKILL.md");
    const markdown = await fs.readFile(filePath, "utf8");
    const homepage = `${repoUrl.replace(/\/$/, "")}/tree/main/${skill.path}`;
    const updated = upsertHomepage(markdown, homepage);
    await fs.writeFile(filePath, updated, "utf8");
    console.log(`Updated homepage for ${skill.slug} -> ${homepage}`);
  }
}

void main();
