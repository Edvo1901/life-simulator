import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { createServer } from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';
import type { DesktopConfig } from './types/common/desktop';

export async function assertPortAvailable(port: number): Promise<void> {
  const server = createServer();
  await new Promise<void>((resolve, reject) => {
    server.once('error', () =>
      reject(
        new Error(
          `Port ${port} is already in use. Close the existing local server or change its configured port.`,
        ),
      ),
    );
    server.listen(port, '127.0.0.1', () =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  });
}

/** Own exactly the two processes started here, including Next's worker process. */
export class LocalServers {
  private readonly children: ChildProcess[] = [];
  private stopping = false;
  private ready = false;

  constructor(private readonly onUnexpectedExit: () => void) {}

  async start(config: DesktopConfig, production: boolean): Promise<void> {
    const node = spawnSync('node', ['--version'], {
      encoding: 'utf8',
      windowsHide: true,
    });
    if (node.status !== 0 || node.stdout.trim() !== 'v24.19.0') {
      throw new Error(
        'Put Node.js 24.19.0 on PATH before starting the desktop demo.',
      );
    }
    await assertPortAvailable(config.frontendPort);
    await assertPortAvailable(config.backendPort);
    const backend = this.launch(
      [
        '--env-file-if-exists=.env',
        '--env-file-if-exists=.env.local',
        'dist/main.js',
      ],
      config.backendDirectory,
      config.backendEnv,
    );
    await this.waitForHttp(
      `http://127.0.0.1:${config.backendPort}/`,
      backend,
      404,
    );
    const frontend = this.launch(
      [
        'src/config/startNext.mts',
        production ? 'start' : 'dev',
        '--hostname',
        '127.0.0.1',
        '--port',
        String(config.frontendPort),
      ],
      config.frontendDirectory,
      {
        ...config.frontendEnv,
        NEXT_DIST_DIR: production ? '.next' : '.next-desktop',
      },
    );
    await this.waitForHttp(config.frontendUrl, frontend, 200);
    this.ready = true;
  }

  private launch(
    args: string[],
    cwd: string,
    env: NodeJS.ProcessEnv,
  ): ChildProcess {
    const child = spawn('node', args, {
      cwd,
      env,
      windowsHide: true,
      stdio: 'ignore',
    });
    this.children.push(child);
    child.on('error', () => {
      if (!this.stopping) this.onUnexpectedExit();
    });
    child.on('exit', () => {
      if (this.ready && !this.stopping) this.onUnexpectedExit();
    });
    return child;
  }

  private async waitForHttp(
    url: string,
    child: ChildProcess,
    expectedStatus: number,
  ): Promise<void> {
    const deadline = Date.now() + 60_000;
    while (!this.stopping && Date.now() < deadline) {
      if (child.exitCode !== null || child.signalCode !== null)
        throw new Error(
          'A local server exited during startup. Check application configuration and builds.',
        );
      try {
        const response = await fetch(url, {
          signal: AbortSignal.timeout(2000),
        });
        await response.body?.cancel();
        if (response.status === expectedStatus) return;
      } catch {
        /* The server may still be compiling or starting. */
      }
      await delay(250);
    }
    throw new Error(
      'Local server startup did not complete. Check application configuration and available ports.',
    );
  }

  stop(): void {
    this.stopping = true;
    for (const child of this.children) {
      if (!child.pid || child.exitCode !== null || child.signalCode !== null)
        continue;
      if (process.platform === 'win32') {
        // Target only our child PID/tree, never a process name or unrelated app.
        spawnSync('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], {
          windowsHide: true,
          stdio: 'ignore',
          timeout: 5000,
        });
      } else child.kill('SIGTERM');
    }
  }
}
