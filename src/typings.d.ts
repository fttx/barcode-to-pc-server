/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

declare var window: Window;
interface Window {
  require: any;
  process: any;
}