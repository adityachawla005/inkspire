import { Camera } from "./camera";

export class InputManager {
    isSpacePressed = false;
    isLeftClicked = false;
    isErasing = false;
    zoomOut = false;
    zoomIn = false;
    takeScreenShot = false;

    mouseX = 0;
    mouseY = 0;
    ndcX = 0;
    ndcY = 0;

    keyLabel: HTMLElement;
    mouseXLabel: HTMLElement;
    mouseYLabel: HTMLElement;
    pointerLabel: HTMLElement;
    brushSize : number = 0.12;
    smoothingWeight : number = 0.7;
    pressure: number = 1.0;
    usePenPressure: boolean = false;
    pressureCurve: number = 0.8;
    taperPercent : number = 0.15;
    brushColor: number[] = [0.13, 0.157, 0.192];

    constructor(canvas: HTMLCanvasElement) {
        this.keyLabel = document.getElementById("key-down")!;
        this.mouseXLabel = document.getElementById("mouse-x")!;
        this.mouseYLabel = document.getElementById("mouse-y")!;
        this.pointerLabel = document.getElementById("pointerlock")!;

        const colorPicker = document.getElementById("color-picker") as HTMLInputElement;
        colorPicker.addEventListener("input", () => {
            const hex = colorPicker.value;
            const r = parseInt(hex.substring(1, 3), 16);
            const g = parseInt(hex.substring(3, 5), 16);
            const b = parseInt(hex.substring(5, 7), 16);

            this.brushColor = [r / 255, g / 255, b / 255];

            (document.getElementById("color-r") as HTMLElement).innerText = r.toString();
            (document.getElementById("color-g") as HTMLElement).innerText = g.toString();
            (document.getElementById("color-b") as HTMLElement).innerText = b.toString();
            (document.getElementById("brushcolor") as HTMLElement).innerText = `[${r}, ${g}, ${b}]`;
        });

        document.addEventListener("keydown", this.onKeyDown);
        document.addEventListener("keyup", this.onKeyUp);

        canvas.style.cursor = "none";
        canvas.style.touchAction = "none"; // Prevent default touch actions like scrolling

        canvas.addEventListener("pointerdown", e => {
            if (e.button === 0) {
                this.isLeftClicked = true;
                this.updatePointerCoordinates(e, canvas);
            }
        });
        canvas.addEventListener("pointerup", e => {
            if (e.button === 0) this.isLeftClicked = false;
        });
        canvas.addEventListener("pointerleave", () => {
            this.isLeftClicked = false;
            this.mouseX = 0;
            this.mouseY = 0;
        });
        
        const brushSlider = document.getElementById("brush-size-slider") as HTMLInputElement;
        const brushNumber = document.getElementById("brush-size-number") as HTMLInputElement;
        
        brushSlider.addEventListener("input", () => {
            this.brushSize = parseFloat(brushSlider.value);
            brushNumber.value = brushSlider.value;
        });
        
        brushNumber.addEventListener("input", () => {
            this.brushSize = parseFloat(brushNumber.value);
            brushSlider.value = brushNumber.value;
        });
        
        const smoothingSlider = document.getElementById("smoothing-slider") as HTMLInputElement;
        const smoothingNumber = document.getElementById("smoothing-number") as HTMLInputElement;

        smoothingSlider.addEventListener("input", () => {
            this.smoothingWeight = parseFloat(smoothingSlider.value);
            smoothingNumber.value = smoothingSlider.value;
        });

        smoothingNumber.addEventListener("input", () => {
            this.smoothingWeight = parseFloat(smoothingNumber.value);
            smoothingSlider.value = smoothingNumber.value;
        });

        const pressureToggle = document.getElementById("pressure-toggle") as HTMLInputElement;
        pressureToggle.addEventListener("change", () => {
            this.usePenPressure = pressureToggle.checked;
        });

        const pressureCurveSlider = document.getElementById("pressure-curve-slider") as HTMLInputElement;
        const pressureCurveNumber = document.getElementById("pressure-curve-number") as HTMLInputElement;
        pressureCurveSlider.addEventListener("input", () => {
            this.pressureCurve = parseFloat(pressureCurveSlider.value);
            pressureCurveNumber.value = pressureCurveSlider.value;
        });
        pressureCurveNumber.addEventListener("input", () => {
            this.pressureCurve = parseFloat(pressureCurveNumber.value);
            pressureCurveSlider.value = pressureCurveNumber.value;
        });
        
        canvas.addEventListener("pointermove", (e) => this.onPointerMove(e, canvas));
    }

    private onKeyDown = (e: KeyboardEvent) => {
        this.keyLabel.innerText = e.code;
        if (e.code === "Space") this.isSpacePressed = true;
        if(e.code === "Minus"){
            this.zoomOut = true;
        }
        else if(e.code === "Equal"){
            this.zoomIn = true;
        }
    };

    private onKeyUp = (e: KeyboardEvent) => {
        this.keyLabel.innerText = `${e.code} released`;
        if (e.code === "Space") this.isSpacePressed = false;
        if (e.code === "KeyE") {
            this.isErasing = !this.isErasing;
            document.getElementById("erasing")!.innerText = this.isErasing.toString();
        }
        if(e.code === "Minus"){
            this.zoomOut = false;
        }
        else if(e.code === "Equal"){
            this.zoomIn = false;
        }

        if(e.code === "Enter"){
            this.takeScreenShot = true;
        }
    };

    private updatePointerCoordinates(e: PointerEvent, canvas: HTMLCanvasElement) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.ndcX = (x / rect.width) * 2 - 1;
        this.ndcY = 1 - (y / rect.height) * 2;
    }

    private onPointerMove(e: PointerEvent, canvas: HTMLCanvasElement) {
        this.mouseX = e.movementX;
        this.mouseY = e.movementY;
        // e.pressure is 0.5 for mouse (no real pressure), 0–1 for pen tablets
        this.pressure = e.pressure;

        this.updatePointerCoordinates(e, canvas);

        this.mouseXLabel.innerText = this.ndcX.toFixed(3);
        this.mouseYLabel.innerText = this.ndcY.toFixed(3);
        this.pointerLabel.innerText = (this.isSpacePressed && this.isLeftClicked).toString();
    }
}
