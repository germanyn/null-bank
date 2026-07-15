import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  uploadScreenshots,
  type ScreenshotEntry,
  type ExecFn,
} from "../github-upload.mts";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const TEST_DIR = join(import.meta.dirname, "__test_fixtures__");

describe("uploadScreenshots", () => {
  beforeEach(() => {
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it("uploads a single screenshot and returns its URL", async () => {
    const filePath = join(TEST_DIR, "home.png");
    writeFileSync(filePath, Buffer.from("fake png data"));

    const entries: ScreenshotEntry[] = [{ route: "/home", filePath }];
    const mockExec: ExecFn = vi.fn().mockReturnValue("{}");

    const results = await uploadScreenshots(
      entries,
      {
        owner: "germanyn",
        repo: "null-bank",
        branch: "test-branch",
      },
      mockExec,
    );

    expect(results).toEqual([
      {
        route: "/home",
        url: "https://raw.githubusercontent.com/germanyn/null-bank/test-branch/sandcastle/screenshots/home.png",
      },
    ]);
  });

  it("uploads multiple screenshots and returns all URLs", async () => {
    const homePath = join(TEST_DIR, "home.png");
    const transferPath = join(TEST_DIR, "transfer.png");
    writeFileSync(homePath, Buffer.from("home data"));
    writeFileSync(transferPath, Buffer.from("transfer data"));

    const entries: ScreenshotEntry[] = [
      { route: "/home", filePath: homePath },
      { route: "/transfer", filePath: transferPath },
    ];
    const mockExec: ExecFn = vi.fn().mockReturnValue("{}");

    const results = await uploadScreenshots(
      entries,
      {
        owner: "germanyn",
        repo: "null-bank",
        branch: "test-branch",
      },
      mockExec,
    );

    expect(results).toHaveLength(2);
    expect(results[0]?.route).toBe("/home");
    expect(results[1]?.route).toBe("/transfer");
  });

  it("skips failed uploads and continues with remaining", async () => {
    const goodPath = join(TEST_DIR, "good.png");
    const badPath = join(TEST_DIR, "bad.png");
    writeFileSync(goodPath, Buffer.from("good data"));
    writeFileSync(badPath, Buffer.from("bad data"));

    const entries: ScreenshotEntry[] = [
      { route: "/bad", filePath: badPath },
      { route: "/good", filePath: goodPath },
    ];

    let callCount = 0;
    const mockExec: ExecFn = vi.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        throw new Error("gh auth failed");
      }
      return "{}";
    });

    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const results = await uploadScreenshots(
      entries,
      {
        owner: "germanyn",
        repo: "null-bank",
        branch: "test-branch",
      },
      mockExec,
    );

    expect(results).toHaveLength(1);
    expect(results[0]?.route).toBe("/good");
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining("Failed to upload screenshot for route /bad"),
    );

    consoleWarn.mockRestore();
  });

  it("handles root route by using 'root' as path segment", async () => {
    const filePath = join(TEST_DIR, "root.png");
    writeFileSync(filePath, Buffer.from("root data"));

    const entries: ScreenshotEntry[] = [{ route: "/", filePath }];
    const mockExec: ExecFn = vi.fn().mockReturnValue("{}");

    const results = await uploadScreenshots(
      entries,
      {
        owner: "germanyn",
        repo: "null-bank",
        branch: "test-branch",
      },
      mockExec,
    );

    expect(results[0]?.url).toContain("/root.png");
  });

  it("uses custom directory when provided", async () => {
    const filePath = join(TEST_DIR, "custom.png");
    writeFileSync(filePath, Buffer.from("custom data"));

    const entries: ScreenshotEntry[] = [{ route: "/custom", filePath }];
    const mockExec: ExecFn = vi.fn().mockReturnValue("{}");

    const results = await uploadScreenshots(
      entries,
      {
        owner: "germanyn",
        repo: "null-bank",
        branch: "test-branch",
        directory: "custom/screenshots",
      },
      mockExec,
    );

    expect(results[0]?.url).toContain("custom/screenshots/custom.png");
  });

  it("calls gh api with correct command structure", async () => {
    const filePath = join(TEST_DIR, "cmd.png");
    writeFileSync(filePath, Buffer.from("cmd data"));

    const entries: ScreenshotEntry[] = [{ route: "/cmd", filePath }];
    const mockExec: ExecFn = vi.fn().mockReturnValue("{}");

    await uploadScreenshots(
      entries,
      {
        owner: "germanyn",
        repo: "null-bank",
        branch: "test-branch",
      },
      mockExec,
    );

    expect(mockExec).toHaveBeenCalledOnce();
    const command = mockExec.mock.calls[0]?.[0] as string;
    expect(command).toContain("gh api");
    expect(command).toContain("repos/germanyn/null-bank/contents/");
    expect(command).toContain("-X PUT");
    expect(command).toContain("-f message=");
    expect(command).toContain("-f content=");
    expect(command).toContain("-f branch=test-branch");
  });
});
