import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { basename, extname } from "node:path";

export interface ScreenshotEntry {
  route: string;
  filePath: string;
}

export interface UploadedScreenshot {
  route: string;
  url: string;
}

export interface UploadOptions {
  owner: string;
  repo: string;
  branch: string;
  directory?: string;
}

export type ExecFn = (command: string) => string;

function defaultExec(command: string): string {
  return execSync(command, { encoding: "utf-8", stdio: "pipe" });
}

function getGitHubRawUrl(
  owner: string,
  repo: string,
  branch: string,
  path: string,
): string {
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
}

export async function uploadScreenshots(
  entries: ScreenshotEntry[],
  options: UploadOptions,
  exec: ExecFn = defaultExec,
): Promise<UploadedScreenshot[]> {
  const { owner, repo, branch, directory = "sandcastle/screenshots" } = options;
  const results: UploadedScreenshot[] = [];

  for (const entry of entries) {
    try {
      const fileBuffer = readFileSync(entry.filePath);
      const content = fileBuffer.toString("base64");
      const fileName = basename(entry.filePath);
      const routePath =
        entry.route.replace(/^\//, "").replace(/\//g, "-") || "root";
      const uploadPath = `${directory}/${routePath}${extname(fileName)}`;

      const message = `Upload screenshot for ${entry.route}`;

      const command = [
        "gh",
        "api",
        `repos/${owner}/${repo}/contents/${uploadPath}`,
        "-X",
        "PUT",
        "-f",
        `message=${message}`,
        "-f",
        `content=${content}`,
        "-f",
        `branch=${branch}`,
      ].join(" ");

      exec(command);

      const url = getGitHubRawUrl(owner, repo, branch, uploadPath);
      results.push({ route: entry.route, url });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(
        `Warning: Failed to upload screenshot for route ${entry.route}: ${message}`,
      );
    }
  }

  return results;
}
