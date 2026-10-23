export type Point = [number, number];
export type Stroke = Point[];
export interface Line {
  text: string;
  strokes: Stroke[];
}
export interface GenerateOptions {
  style?: number | 'random';
  bias?: number;
  seed?: number | null;
}
export interface Bounds {
  minX: number; minY: number; maxX: number; maxY: number;
  width: number; height: number;
}

export function setSeed(seed: number | null): void;
export function loadModel(url: string): Promise<void>;
export function isLoaded(): boolean;
export function styleCount(): number;
export function generate(text: string, options?: GenerateOptions): { lines: Line[] };
export function bounds(strokes: Stroke[]): Bounds;
export const SUPPORTED_CHARS: string[];
