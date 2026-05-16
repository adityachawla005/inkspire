declare module "gifenc" {
    export function GIFEncoder(): any;
    export function quantize(data: Uint8ClampedArray | Uint8Array, maxColors: number): number[][];
    export function applyPalette(data: Uint8ClampedArray | Uint8Array, palette: number[][], format?: string): Uint8Array;
}
