import { chromium } from 'playwright';
import waitOn from 'wait-on';
import { spawn, type ChildProcess } from 'child_process';
import { mkdtemp } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

export interface ViewportConfig {
  width: number;
  height: number;
}

export interface CaptureConfig {
  routes: string[];
  viewports: ViewportConfig[];
  devCommand: string;
  baseUrl: string;
  screenshotDir?: string;
  timeout?: number;
}

export interface ScreenshotResult {
  route: string;
  width: number;
  height: number;
  filePath: string;
}

function screenshotFileName(route: string, width: number): string {
  const safeRoute = route.replace(/^\/+/, '').replace(/\//g, '_') || 'index';
  return `${safeRoute}-${width}.png`;
}

export async function captureScreenshots(
  config: CaptureConfig,
): Promise<ScreenshotResult[]> {
  const {
    routes,
    viewports,
    devCommand,
    baseUrl,
    screenshotDir: customDir,
    timeout = 30_000,
  } = config;

  const screenshotDir = customDir || await mkdtemp(join(tmpdir(), 'screenshots-'));
  const [command, ...args] = devCommand.split(/\s+/);

  let serverProcess: ChildProcess | undefined;
  let serverFailed = false;

  try {
    serverProcess = await startServer(command, args, () => {
      serverFailed = true;
    });

    if (serverFailed) {
      throw new Error(`Dev server exited before becoming ready`);
    }

    await waitOn(baseUrl, { timeout });

    const browser = await chromium.launch();
    const results: ScreenshotResult[] = [];

    try {
      for (const route of routes) {
        for (const { width, height } of viewports) {
          const page = await browser.newPage();
          await page.setViewportSize({ width, height });
          await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });

          const filePath = join(screenshotDir, screenshotFileName(route, width));
          await page.screenshot({ path: filePath, fullPage: true });

          results.push({ route, width, height, filePath });
          await page.close();
        }
      }
    } finally {
      await browser.close();
    }

    return results;
  } finally {
    if (serverProcess) {
      serverProcess.kill('SIGTERM');
    }
  }
}

function startServer(
  command: string,
  args: string[],
  onFail: () => void,
): Promise<ChildProcess> {
  return new Promise((resolve) => {
    const proc = spawn(command, args, { stdio: 'inherit', shell: true });

    proc.on('error', () => {
      onFail();
    });

    proc.on('exit', (code) => {
      if (code !== null && code !== 0) {
        onFail();
      }
    });

    resolve(proc);
  });
}
