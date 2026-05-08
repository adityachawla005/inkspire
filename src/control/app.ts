import { Renderer } from "../graphics/renderer";
import { InputManager } from "../core/inputManager";
import { Camera } from "../core/camera";

export class App {
    canvas: HTMLCanvasElement;
    renderer: Renderer;
    input: InputManager;

    lastDrawX: number | null = null;
    lastDrawY: number | null = null;
    smoothedX = 0;
    smoothedY = 0;
    smoothedSpeed = 0;
    zoomLevel : number = 10;
    

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
        this.input = new InputManager(canvas);
        this.renderer.camera.position[0] = this.zoomLevel;
    }

    async initialize() {
        await this.renderer.initialize();
        window.addEventListener("keydown", (e) => {
            if (e.ctrlKey && e.key === "z") {
                e.preventDefault();
                const undoStrokes = this.renderer.strokeMgr.historyMgr.undo(this.renderer.strokeMgr.strokes);
                if (undoStrokes) this.renderer.strokeMgr.applyStrokes(undoStrokes);
            }
            if (e.ctrlKey && e.key === "y") {
                e.preventDefault();
                const redoStrokes = this.renderer.strokeMgr.historyMgr.redo(this.renderer.strokeMgr.strokes);
                if (redoStrokes) this.renderer.strokeMgr.applyStrokes(redoStrokes);
            }
        });
    }

    


    run = () => {
        const i = this.input;
        const alpha = i.smoothingWeight; 

        if(i.takeScreenShot){
            i.takeScreenShot = false;
            // remove cursor
            this.renderer.render(
                true, // panning (hide cursor)
                false,
                i.mouseX,
                i.mouseY,
                this.smoothedX,
                this.smoothedY,
                this.lastDrawX,
                this.lastDrawY,
                i.isErasing,
                i.brushSize,
                i.brushColor,
                i.pressure,
                i.usePenPressure,
                i.pressureCurve
            );
            const dataURL = this.canvas.toDataURL("image/png");

            const link = document.createElement("a");
            link.href = dataURL;
            link.download = "screenshot.png";
            link.click();
        } // perfecto

        if(i.zoomIn && this.zoomLevel > 1.5){
            this.zoomLevel -= 0.5;
            // i.zoomIn = false;
        }
        
        else if (i.zoomOut) {
            this.zoomLevel += 0.5;
            // i.zoomOut = false;
        }

        this.renderer.camera.position[0] = this.zoomLevel;
        this.renderer.camera.update();
        document.getElementById('zoom')!.innerText = this.zoomLevel.toString();

        const isDrawing = i.isLeftClicked && !i.isSpacePressed;
        
        const fovy = Math.PI / 4;
        const aspect = this.canvas.width / this.canvas.height;
        const p11 = 1 / Math.tan(fovy / 2);
        const p00 = p11 / aspect;

        const worldY = this.renderer.camera.position[1] + (i.ndcX * this.zoomLevel) / p00;
        const worldZ = this.renderer.camera.position[2] + (i.ndcY * this.zoomLevel) / p11;

        if (this.lastDrawX === null && isDrawing) {
            this.smoothedX = worldY;
            this.smoothedY = worldZ;
        } else {
            this.smoothedX = (1 - alpha) * this.smoothedX + alpha * worldY;
            this.smoothedY = (1 - alpha) * this.smoothedY + alpha * worldZ;
        }

        this.renderer.render(
            i.isSpacePressed && i.isLeftClicked, // panning
            isDrawing,
            i.mouseX,
            i.mouseY,
            this.smoothedX,
            this.smoothedY,
            this.lastDrawX,
            this.lastDrawY,
            i.isErasing,
            i.brushSize,
            i.brushColor,
            i.pressure,
            i.usePenPressure,
            i.pressureCurve
        );

        if (isDrawing) {
            this.lastDrawX = this.smoothedX;
            this.lastDrawY = this.smoothedY;
        } else {
            this.lastDrawX = null;
            this.lastDrawY = null;
        }

        i.mouseX = 0;
        i.mouseY = 0;

        requestAnimationFrame(this.run);

        
    };
}