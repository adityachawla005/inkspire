import { mat4 } from "gl-matrix";
import { Camera } from "../core/camera";
import { GPUContextManager } from "./gpuContextManager";
import { StrokeManager } from "./strokeManager";
import { CursorRenderer } from "./cursor";
import { HistoryManager } from "../control/historyManager";
import { AnimationManager } from "../control/animationManager";

export class Renderer {
    canvas: HTMLCanvasElement;
    resolutionScale = 2.0;
    camera: Camera;
    zoomValue = 10;

    contextMgr: GPUContextManager;
    strokeMgr: StrokeManager;
    cursorRenderer: CursorRenderer;
    historyManager: HistoryManager;

    constructor(canvas: HTMLCanvasElement, animMgr: AnimationManager) {
        this.canvas = canvas;
        this.camera = new Camera([this.zoomValue, 0, 0]);
        this.historyManager = new HistoryManager();
        this.contextMgr = new GPUContextManager(canvas);
        this.strokeMgr = new StrokeManager(canvas, this.contextMgr, this.historyManager, animMgr);
        this.cursorRenderer = new CursorRenderer(this.contextMgr);
    }

    async initialize() {
        await this.contextMgr.setup();
        this.strokeMgr.initialize();
        this.cursorRenderer.initialize();
        this.setCanvasResolution();
        this.contextMgr.configure();

        await this.contextMgr.createPipeline(this.strokeMgr.getBufferLayouts());
        window.addEventListener("resize", () => this.setCanvasResolution());
    }

    setCanvasResolution() {
        const cssWidth  = 800;
        const cssHeight = 600;

        this.canvas.style.width  = `${cssWidth}px`;
        this.canvas.style.height = `${cssHeight}px`;
        this.canvas.width  = cssWidth  * this.resolutionScale;
        this.canvas.height = cssHeight * this.resolutionScale;

        this.contextMgr.configure();
    }

    render(
        panning: boolean,
        drawing: boolean,
        mouseX: number, mouseY: number,
        drawX: number, drawY: number,
        lastDrawX: number | null, lastDrawY: number | null,
        evaporating: boolean,
        trueErasing: boolean,
        brushSize  = 0.12,
        brushColor = [0.2, 0.2, 0.2],
        pressure   = 1.0,
        usePenPressure = false,
        pressureCurve  = 0.8,
        showOnion = false,
        hideCursor = false
    ) {
        if (panning) this.camera.pan(mouseX, mouseY);

        this.strokeMgr.update(
            drawing, evaporating, trueErasing, drawX, drawY, lastDrawX, lastDrawY,
            brushSize, brushColor, pressure, usePenPressure, pressureCurve
        );
        this.cursorRenderer.update(drawX, drawY, evaporating || trueErasing, brushSize + 0.02);

        const projection = mat4.create();
        mat4.perspective(projection, Math.PI / 4, this.canvas.width / this.canvas.height, 0.001, 1000);
        const view  = this.camera.get_view();
        const model = mat4.create();
        this.contextMgr.updateUniforms(model, view, projection);

        const device = this.contextMgr.device;
        const encoder = device.createCommandEncoder();
        const textureView = this.contextMgr.context.getCurrentTexture().createView();

        const pass = encoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: { r: 0.97, g: 0.97, b: 0.96, a: 1.0 },
                loadOp: "clear",
                storeOp: "store",
            }],
        });

        this.strokeMgr.render(pass, this.contextMgr, showOnion, trueErasing);
        this.cursorRenderer.render(pass, this.contextMgr.pipeline, this.contextMgr.bindGroup, !panning && !hideCursor);

        pass.end();
        device.queue.submit([encoder.finish()]);
    }
}
