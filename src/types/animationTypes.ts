export interface IStroke {
    points: number[][];   // [x, y][]
    radii:  number[];     // per-point radius
    color:  number[];     // [r, g, b] normalized 0-1
    isEraser?: boolean;
}

export interface IFrame {
    // indexed by layer index; each entry is the strokes on that layer for this frame
    layerStrokes: IStroke[][];
}

export interface ILayerDef {
    name:    string;
    visible: boolean;
    opacity: number;   // 0-1 (reserved for future shader use)
}

export interface IAnimation {
    version: number;
    fps:     number;
    layers:  ILayerDef[];
    frames:  IFrame[];
}
