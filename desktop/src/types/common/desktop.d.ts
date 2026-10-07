export interface DesktopConfig {
  frontendDirectory: string;
  backendDirectory: string;
  frontendPort: number;
  backendPort: number;
  frontendUrl: string;
  frontendEnv: NodeJS.ProcessEnv;
  backendEnv: NodeJS.ProcessEnv;
}
