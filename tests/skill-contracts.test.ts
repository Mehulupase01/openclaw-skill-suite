import { describe, expect, it } from "vitest";
import { buildPackagingSummary, discoverSkills, validateSkill } from "../tools/lib/skills.ts";

describe("skill suite contracts", () => {
  it("discovers the expected four skills", async () => {
    const skills = await discoverSkills();
    expect(skills.map((skill) => skill.slug)).toEqual([
      "code-review-bot",
      "expense-snap",
      "job-tracker",
      "smart-scheduler"
    ]);
  });

  it("keeps every skill publish-safe", async () => {
    const skills = await discoverSkills();
    for (const skill of skills) {
      const result = await validateSkill(skill);
      expect(result.errors).toEqual([]);
    }
  });

  it("keeps each bundle well under the registry size limit", async () => {
    const skills = await discoverSkills();
    for (const skill of skills) {
      const summary = buildPackagingSummary(skill);
      expect(summary.fileCount).toBeGreaterThan(1);
      expect(summary.totalBytes).toBeLessThan(50 * 1024 * 1024);
    }
  });
});
