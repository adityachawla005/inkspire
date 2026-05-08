import { CircleMesh } from "./circleMesh";
import { Stroke } from "./stroke";
import { GPUContextManager } from "./gpuContextManager";
import { HistoryManager } from "../control/historyManager";

export class StrokeManager {
    canvas: HTMLCanvasElement;
    contextMgr: GPUContextManager;
    circleMesh!: CircleMesh;
    strokes: Stroke[] = [];
    currentStrokePoints: number[][] = [];
    defaultBrushSize: number = 0.07;
    minRadius: number;
    maxRadius: number;

    instanceBuffer!: GPUBuffer;
    maxInstances: number = 100000;
    instanceCount: number = 0;
    instanceData!: Float32Array;

    constructor(
        canvas: HTMLCanvasElement,
        contextMgr: GPUContextManager,
        public historyMgr: HistoryManager,
        maxRadius: number = 0.07,
        minRadius: number = 0.02
    ) {
        this.canvas = canvas;
        this.contextMgr = contextMgr;
        this.maxRadius = maxRadius;
        this.minRadius = minRadius;
    }

    initialize() {
        this.circleMesh = new CircleMesh(this.contextMgr.device);

        this.instanceData = new Float32Array(this.maxInstances * 6);
        this.instanceBuffer = this.contextMgr.device.createBuffer({
            size: this.instanceData.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
    }

    getBufferLayout(): GPUVertexBufferLayout[] {
        const instanceLayout: GPUVertexBufferLayout = {
            arrayStride: 24, // 6 floats (x, y, r, g, b, radius) * 4 bytes
            stepMode: "instance",
            attributes: [
                { shaderLocation: 1, format: "float32x2", offset: 0 },
                { shaderLocation: 2, format: "float32x3", offset: 8 },
                { shaderLocation: 3, format: "float32", offset: 20 }
            ]
        };
        return [this.circleMesh.bufferLayout, instanceLayout];
    }

    update(
        drawing: boolean,
        erasing: boolean,
        drawX: number,
        drawY: number,
        lastDrawX: number | null,
        lastDrawY: number | null,
        brushSize: number,
        brushColor: number[] = [0.13, 0.157, 0.192],
        pressure: number = 1.0,
        usePenPressure: boolean = false,
        pressureCurve: number = 1.0
    ) {
        brushColor = [0.2, 0.2, 0.2];
        const minSize = 0.01;
        const maxSize = 2.5;
        const clamped = Math.min(Math.max(brushSize, minSize), maxSize);

        const maxTaper = 0.7;
        const scale = 20;
        const taper = maxTaper / (1 + scale * clamped * clamped);
        const taperFactor = Math.min(Math.max(taper, 0), 0.95);

        this.defaultBrushSize = brushSize;
        this.maxRadius = brushSize;
        this.minRadius = brushSize * (1 - taperFactor);

        const maxSizeElem = document.getElementById('maxsize');
        const minSizeElem = document.getElementById('minsize');
        if (maxSizeElem) maxSizeElem.innerText = this.maxRadius.toFixed(3);
        if (minSizeElem) minSizeElem.innerText = this.minRadius.toFixed(3);

        if (drawing && !erasing) {
            const prevX = lastDrawX;
            const prevY = lastDrawY;

            if (prevX === null || prevY === null) {
                if (usePenPressure) {
                    const effectivePressure = Math.pow(Math.max(0, Math.min(1, pressure)), pressureCurve);
                    const radius = this.maxRadius * effectivePressure;
                    this.currentStrokePoints.push([drawX, drawY, pressure, radius]);
                    this.drawCircle(drawX, drawY, brushColor, radius); // real radius, not preview
                } else {
                    this.currentStrokePoints.push([drawX, drawY, pressure, this.defaultBrushSize]);
                    this.drawCircle(drawX, drawY, brushColor); // preview at default size
                }
            } else {
                const dx = drawX - prevX;
                const dy = drawY - prevY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const spacing = 0.02;
                const steps = Math.max(1, Math.floor(dist / spacing));

                for (let i = 0; i <= steps; i++) {
                    const t = i / steps;
                    const x = prevX + dx * t;
                    const y = prevY + dy * t;
                    const prevPressure = this.currentStrokePoints.length > 0
                        ? this.currentStrokePoints[this.currentStrokePoints.length - 1][2]
                        : pressure;
                    const interpPressure = prevPressure + (pressure - prevPressure) * t;

                    if (usePenPressure) {
                        const effectivePressure = Math.pow(Math.max(0, Math.min(1, interpPressure)), pressureCurve);
                        const radius = this.maxRadius * effectivePressure;
                        this.currentStrokePoints.push([x, y, interpPressure, radius]);
                        this.drawCircle(x, y, brushColor, radius); // real radius in real-time
                    } else {
                        this.currentStrokePoints.push([x, y, interpPressure, this.defaultBrushSize]);
                        this.drawCircle(x, y, brushColor); // preview at default size
                    }
                }
            }
        }

        if (!drawing && !erasing && this.currentStrokePoints.length > 0) {
            this.historyMgr.save(this.strokes);

            const totalPoints = this.currentStrokePoints.length;
            const taperPercent = 0.15;
            const radii: number[] = [];

            if (usePenPressure) {
                // Circles are already drawn with the correct radius — just save the Stroke record.
                const startIndex = this.instanceCount - totalPoints;
                for (let i = 0; i < totalPoints; i++) {
                    radii.push(this.currentStrokePoints[i][3]); // already-applied radius
                }
                const endIndex = this.instanceCount - 1;
                this.strokes.push(new Stroke(
                    this.currentStrokePoints.map(p => [p[0], p[1]]),
                    radii,
                    brushColor,
                    startIndex,
                    endIndex
                ));
            } else {
                // Taper mode: rewind preview circles and redraw with position-based taper.
                this.instanceCount -= totalPoints;
                const startIndex = this.instanceCount;

                for (let i = 0; i < totalPoints; i++) {
                    let t = 1;
                    if (i < totalPoints * taperPercent)
                        t = i / (totalPoints * taperPercent);
                    else if (i > totalPoints * (1 - taperPercent))
                        t = (totalPoints - i) / (totalPoints * taperPercent);
                    t = Math.max(0, Math.min(1, t));
                    const radius = this.minRadius + (this.maxRadius - this.minRadius) * t;
                    const [x, y] = this.currentStrokePoints[i];
                    this.drawCircle(x, y, brushColor, radius);
                    radii.push(radius);
                }

                const endIndex = this.instanceCount - 1;
                this.strokes.push(new Stroke(
                    this.currentStrokePoints.map(p => [p[0], p[1]]),
                    radii,
                    brushColor,
                    startIndex,
                    endIndex
                ));
            }

            this.currentStrokePoints = [];
        }


        if (erasing && drawing) {
            for (let i = 0; i < this.strokes.length; i++) {
                const stroke = this.strokes[i];
                if (stroke.isPointOnStroke(drawX, drawY)) {
                    this.historyMgr.save(this.strokes);
                    const count = stroke.meshEndIndex - stroke.meshStartIndex + 1;

                    // Erase by setting radius to 0
                    for (let j = 0; j < count; j++) {
                        const idx = (stroke.meshStartIndex + j) * 6;
                        this.instanceData[idx + 5] = 0; // radius = 0
                    }
                    this.updateInstanceBufferRange(stroke.meshStartIndex, count);

                    this.strokes.splice(i, 1);
                    break;
                }
            }
        }
    }

    private drawCircle(x: number, y: number, rgb: number[], radius = this.defaultBrushSize) {
        if (this.instanceCount >= this.maxInstances) return; // Prevent overflow

        const idx = this.instanceCount * 6;
        this.instanceData[idx] = x;
        this.instanceData[idx + 1] = y;
        this.instanceData[idx + 2] = rgb[0];
        this.instanceData[idx + 3] = rgb[1];
        this.instanceData[idx + 4] = rgb[2];
        this.instanceData[idx + 5] = radius;
        
        this.updateInstanceBufferRange(this.instanceCount, 1);
        this.instanceCount++;
    }

    private updateInstanceBufferRange(startIndex: number, count: number) {
        const offset = startIndex * 24; // 6 floats * 4 bytes
        const data = this.instanceData.subarray(startIndex * 6, (startIndex + count) * 6);
        this.contextMgr.device.queue.writeBuffer(
            this.instanceBuffer,
            offset,
            data.buffer,
            data.byteOffset,
            data.byteLength
        );
    }

    render(pass: GPURenderPassEncoder, pipeline: GPURenderPipeline, bindGroup: GPUBindGroup) {
        if (this.instanceCount === 0) return;
        
        pass.setPipeline(pipeline);
        pass.setVertexBuffer(0, this.circleMesh.buffer);
        pass.setVertexBuffer(1, this.instanceBuffer);
        pass.setBindGroup(0, bindGroup);
        // 66 vertices per circle
        pass.draw(66, this.instanceCount, 0, 0);

        const strokeCountElem = document.getElementById("strokes");
        if (strokeCountElem) strokeCountElem.innerText = this.strokes.length.toString();
    }

    applyStrokes(newStrokes: Stroke[]) {
        this.strokes = newStrokes;
        this.rebuildMeshes();
    }

    private rebuildMeshes() {
        this.instanceCount = 0;
        for (const stroke of this.strokes) {
            stroke.meshStartIndex = this.instanceCount;
            for (let i = 0; i < stroke.points.length; i++) {
                const [x, y] = stroke.points[i];
                const radius = stroke.radii[i];
                this.drawCircle(x, y, stroke.color, radius);
            }
            stroke.meshEndIndex = this.instanceCount - 1;
        }
    }
}
