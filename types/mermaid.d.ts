declare module 'mermaid' {
  export interface MermaidConfig {
    theme?: string;
    themeVariables?: Record<string, any>;
    fontFamily?: string;
    altFontFamily?: string;
    logLevel?: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
    securityLevel?: 'strict' | 'loose' | 'antiscript';
    startOnLoad?: boolean;
    arrowMarkerAbsolute?: boolean;
    secure?: string[];
    deterministicIds?: boolean;
    deterministicIDSeed?: string;
    flowchart?: Record<string, any>;
    sequence?: Record<string, any>;
    gantt?: Record<string, any>;
    er?: Record<string, any>;
    maxTextSize?: number;
  }

  export interface ParseOptions {
    suppressErrors?: boolean;
  }

  export interface RenderOptions {
    nodes?: Element[];
    suppressErrors?: boolean;
  }

  export interface RenderResult {
    svg: string;
    bindFunctions?: (element: Element) => void;
  }

  export function initialize(config?: MermaidConfig): void;
  export function parse(text: string, parseOptions?: ParseOptions): boolean;
  export function render(
    id: string,
    text: string,
    container?: Element | null,
    renderOptions?: RenderOptions
  ): Promise<RenderResult>;
  export function contentLoaded(): void;
  export function setParseErrorHandler(handler: (error: Error, hash: any) => void): void;
  export function mermaidAPI(): any;
}