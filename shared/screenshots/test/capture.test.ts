import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('playwright', () => ({
  chromium: {
    launch: vi.fn(),
  },
}));

vi.mock('wait-on', () => ({
  default: vi.fn(),
}));

vi.mock('child_process', () => ({
  spawn: vi.fn(() => ({
    pid: 12345,
    kill: vi.fn(),
    on: vi.fn(),
    stderr: { on: vi.fn() },
    stdout: { on: vi.fn() },
  })),
}));

vi.mock('fs/promises', () => ({
  default: {
    mkdtemp: vi.fn(),
    writeFile: vi.fn(),
    rm: vi.fn(),
    mkdir: vi.fn(),
  },
  mkdtemp: vi.fn(),
  writeFile: vi.fn(),
  rm: vi.fn(),
  mkdir: vi.fn(),
}));

import { captureScreenshots } from '../src/index';
import { chromium } from 'playwright';
import waitOn from 'wait-on';
import { spawn } from 'child_process';
import { mkdtemp, writeFile, rm } from 'fs/promises';

const mockedLaunch = vi.mocked(chromium.launch);
const mockedWaitOn = vi.mocked(waitOn);
const mockedSpawn = vi.mocked(spawn);
const mockedMkdtemp = vi.mocked(mkdtemp);
const mockedWriteFile = vi.mocked(writeFile);
const mockedRm = vi.mocked(rm);

function createMockPage() {
  return {
    setViewportSize: vi.fn(),
    goto: vi.fn(),
    screenshot: vi.fn().mockResolvedValue(Buffer.from('fake-png')),
    close: vi.fn(),
  };
}

function createMockBrowser(page: ReturnType<typeof createMockPage>) {
  return {
    newPage: vi.fn().mockResolvedValue(page),
    close: vi.fn(),
  };
}

function createMockProcess() {
  return {
    pid: 12345,
    kill: vi.fn(),
    on: vi.fn(),
    stderr: { on: vi.fn() },
    stdout: { on: vi.fn() },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedMkdtemp.mockResolvedValue('/tmp/screenshots-abc123');
  mockedWriteFile.mockResolvedValue(undefined);
  mockedRm.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('captureScreenshots', () => {
  it('returns a screenshot file path for each route × viewport combination', async () => {
    const page = createMockPage();
    const browser = createMockBrowser(page);
    mockedLaunch.mockResolvedValue(browser as any);
    mockedWaitOn.mockResolvedValue(undefined);
    mockedSpawn.mockReturnValue(createMockProcess() as any);

    const results = await captureScreenshots({
      routes: ['/account', '/transfer'],
      viewports: [
        { width: 1024, height: 768 },
        { width: 375, height: 667 },
      ],
      devCommand: 'pnpm dev',
      baseUrl: 'http://localhost:4200',
    });

    expect(results).toHaveLength(4);
  });

  it('names screenshots using <route>-<width>.png convention', async () => {
    const page = createMockPage();
    const browser = createMockBrowser(page);
    mockedLaunch.mockResolvedValue(browser as any);
    mockedWaitOn.mockResolvedValue(undefined);
    mockedSpawn.mockReturnValue(createMockProcess() as any);

    const results = await captureScreenshots({
      routes: ['/account'],
      viewports: [{ width: 1024, height: 768 }],
      devCommand: 'pnpm dev',
      baseUrl: 'http://localhost:4200',
    });

    expect(results[0].filePath).toContain('/account-1024.png');
  });

  it('sets viewport size before navigating to each route', async () => {
    const page = createMockPage();
    const browser = createMockBrowser(page);
    mockedLaunch.mockResolvedValue(browser as any);
    mockedWaitOn.mockResolvedValue(undefined);
    mockedSpawn.mockReturnValue(createMockProcess() as any);

    await captureScreenshots({
      routes: ['/account'],
      viewports: [{ width: 1366, height: 768 }],
      devCommand: 'pnpm dev',
      baseUrl: 'http://localhost:4200',
    });

    expect(page.setViewportSize).toHaveBeenCalledWith({ width: 1366, height: 768 });
  });

  it('navigates to the full URL with route appended to baseUrl', async () => {
    const page = createMockPage();
    const browser = createMockBrowser(page);
    mockedLaunch.mockResolvedValue(browser as any);
    mockedWaitOn.mockResolvedValue(undefined);
    mockedSpawn.mockReturnValue(createMockProcess() as any);

    await captureScreenshots({
      routes: ['/account'],
      viewports: [{ width: 1024, height: 768 }],
      devCommand: 'pnpm dev',
      baseUrl: 'http://localhost:4200',
    });

    expect(page.goto).toHaveBeenCalledWith('http://localhost:4200/account', {
      waitUntil: 'networkidle',
    });
  });

  it('captures full-page screenshots', async () => {
    const page = createMockPage();
    const browser = createMockBrowser(page);
    mockedLaunch.mockResolvedValue(browser as any);
    mockedWaitOn.mockResolvedValue(undefined);
    mockedSpawn.mockReturnValue(createMockProcess() as any);

    await captureScreenshots({
      routes: ['/account'],
      viewports: [{ width: 1024, height: 768 }],
      devCommand: 'pnpm dev',
      baseUrl: 'http://localhost:4200',
    });

    expect(page.screenshot).toHaveBeenCalledWith({
      path: expect.stringContaining('/account-1024.png'),
      fullPage: true,
    });
  });

  it('starts the dev server before capturing', async () => {
    const page = createMockPage();
    const browser = createMockBrowser(page);
    mockedLaunch.mockResolvedValue(browser as any);
    mockedWaitOn.mockResolvedValue(undefined);
    mockedSpawn.mockReturnValue(createMockProcess() as any);

    await captureScreenshots({
      routes: ['/account'],
      viewports: [{ width: 1024, height: 768 }],
      devCommand: 'pnpm dev',
      baseUrl: 'http://localhost:4200',
    });

    expect(mockedSpawn).toHaveBeenCalledWith('pnpm', ['dev'], {
      stdio: 'inherit',
      shell: true,
    });
  });

  it('waits for the server URL to be available before launching browser', async () => {
    const page = createMockPage();
    const browser = createMockBrowser(page);
    mockedLaunch.mockResolvedValue(browser as any);
    mockedWaitOn.mockResolvedValue(undefined);
    mockedSpawn.mockReturnValue(createMockProcess() as any);

    await captureScreenshots({
      routes: ['/account'],
      viewports: [{ width: 1024, height: 768 }],
      devCommand: 'pnpm dev',
      baseUrl: 'http://localhost:4200',
    });

    expect(mockedWaitOn).toHaveBeenCalledWith(
      'http://localhost:4200',
      expect.objectContaining({ timeout: expect.any(Number) }),
    );
  });

  it('closes the browser after capture completes', async () => {
    const page = createMockPage();
    const browser = createMockBrowser(page);
    mockedLaunch.mockResolvedValue(browser as any);
    mockedWaitOn.mockResolvedValue(undefined);
    mockedSpawn.mockReturnValue(createMockProcess() as any);

    await captureScreenshots({
      routes: ['/account'],
      viewports: [{ width: 1024, height: 768 }],
      devCommand: 'pnpm dev',
      baseUrl: 'http://localhost:4200',
    });

    expect(browser.close).toHaveBeenCalled();
  });

  it('kills the dev server after capture completes', async () => {
    const mockProc = createMockProcess();
    const page = createMockPage();
    const browser = createMockBrowser(page);
    mockedLaunch.mockResolvedValue(browser as any);
    mockedWaitOn.mockResolvedValue(undefined);
    mockedSpawn.mockReturnValue(mockProc as any);

    await captureScreenshots({
      routes: ['/account'],
      viewports: [{ width: 1024, height: 768 }],
      devCommand: 'pnpm dev',
      baseUrl: 'http://localhost:4200',
    });

    expect(mockProc.kill).toHaveBeenCalledWith('SIGTERM');
  });

  it('kills the dev server even when browser launch fails', async () => {
    const mockProc = createMockProcess();
    mockedLaunch.mockRejectedValue(new Error('Browser failed'));
    mockedWaitOn.mockResolvedValue(undefined);
    mockedSpawn.mockReturnValue(mockProc as any);

    await expect(
      captureScreenshots({
        routes: ['/account'],
        viewports: [{ width: 1024, height: 768 }],
        devCommand: 'pnpm dev',
        baseUrl: 'http://localhost:4200',
      }),
    ).rejects.toThrow();

    expect(mockProc.kill).toHaveBeenCalledWith('SIGTERM');
  });

  it('throws when the dev server fails to start', async () => {
    mockedSpawn.mockReturnValue({
      pid: 12345,
      kill: vi.fn(),
      on: vi.fn((_event, cb) => {
        cb(1);
      }),
      stderr: { on: vi.fn() },
      stdout: { on: vi.fn() },
    } as any);
    mockedWaitOn.mockRejectedValue(new Error('timeout'));

    await expect(
      captureScreenshots({
        routes: ['/account'],
        viewports: [{ width: 1024, height: 768 }],
        devCommand: 'pnpm dev',
        baseUrl: 'http://localhost:4200',
      }),
    ).rejects.toThrow();
  });

  it('saves each screenshot to the correct directory via Playwright', async () => {
    const page = createMockPage();
    const browser = createMockBrowser(page);
    mockedLaunch.mockResolvedValue(browser as any);
    mockedWaitOn.mockResolvedValue(undefined);
    mockedSpawn.mockReturnValue(createMockProcess() as any);

    await captureScreenshots({
      routes: ['/account'],
      viewports: [{ width: 1024, height: 768 }],
      devCommand: 'pnpm dev',
      baseUrl: 'http://localhost:4200',
    });

    expect(page.screenshot).toHaveBeenCalledWith({
      path: '/tmp/screenshots-abc123/account-1024.png',
      fullPage: true,
    });
  });

  it('creates a temporary directory for screenshots', async () => {
    const page = createMockPage();
    const browser = createMockBrowser(page);
    mockedLaunch.mockResolvedValue(browser as any);
    mockedWaitOn.mockResolvedValue(undefined);
    mockedSpawn.mockReturnValue(createMockProcess() as any);

    await captureScreenshots({
      routes: ['/account'],
      viewports: [{ width: 1024, height: 768 }],
      devCommand: 'pnpm dev',
      baseUrl: 'http://localhost:4200',
    });

    expect(mockedMkdtemp).toHaveBeenCalled();
  });

  it('includes route and width metadata in each result', async () => {
    const page = createMockPage();
    const browser = createMockBrowser(page);
    mockedLaunch.mockResolvedValue(browser as any);
    mockedWaitOn.mockResolvedValue(undefined);
    mockedSpawn.mockReturnValue(createMockProcess() as any);

    const results = await captureScreenshots({
      routes: ['/account', '/transfer'],
      viewports: [{ width: 1024, height: 768 }],
      devCommand: 'pnpm dev',
      baseUrl: 'http://localhost:4200',
    });

    expect(results[0]).toEqual({
      route: '/account',
      width: 1024,
      height: 768,
      filePath: expect.stringContaining('/account-1024.png'),
    });
    expect(results[1]).toEqual({
      route: '/transfer',
      width: 1024,
      height: 768,
      filePath: expect.stringContaining('/transfer-1024.png'),
    });
  });

  it('uses custom screenshotDir when provided', async () => {
    const page = createMockPage();
    const browser = createMockBrowser(page);
    mockedLaunch.mockResolvedValue(browser as any);
    mockedWaitOn.mockResolvedValue(undefined);
    mockedSpawn.mockReturnValue(createMockProcess() as any);

    const results = await captureScreenshots({
      routes: ['/account'],
      viewports: [{ width: 1024, height: 768 }],
      devCommand: 'pnpm dev',
      baseUrl: 'http://localhost:4200',
      screenshotDir: '/custom/dir',
    });

    expect(results[0].filePath).toMatch(/^\/custom\/dir\//);
    expect(mockedMkdtemp).not.toHaveBeenCalled();
  });

  it('uses custom timeout for wait-on when provided', async () => {
    const page = createMockPage();
    const browser = createMockBrowser(page);
    mockedLaunch.mockResolvedValue(browser as any);
    mockedWaitOn.mockResolvedValue(undefined);
    mockedSpawn.mockReturnValue(createMockProcess() as any);

    await captureScreenshots({
      routes: ['/account'],
      viewports: [{ width: 1024, height: 768 }],
      devCommand: 'pnpm dev',
      baseUrl: 'http://localhost:4200',
      timeout: 60000,
    });

    expect(mockedWaitOn).toHaveBeenCalledWith(
      'http://localhost:4200',
      expect.objectContaining({ timeout: 60000 }),
    );
  });
});
