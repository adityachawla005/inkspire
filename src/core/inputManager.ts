import { AnimationManager } from "../control/animationManager";

const RECENT_COLORS_KEY = "inkspire-recent-colors";
const MAX_RECENT = 8;
const DEFAULT_COLORS = ["#1c1814","#f7f3ec","#c0392b","#e67e22","#c0860a","#2980b9","#27ae60","#8e44ad"];

export class InputManager {
    isSpacePressed = false;
    isLeftClicked  = false;
    isErasing      = false;
    isGrabMode     = false;
    isRotateMode   = false;
    zoomOut = false;
    zoomIn  = false;

    // Set by App so NDC calculation can compensate for canvas rotation
    canvasAngle = 0;

    mouseX = 0;
    mouseY = 0;
    ndcX   = 0;
    ndcY   = 0;

    brushSize       = 0.12;
    smoothingWeight = 0.7;
    pressure        = 1.0;
    usePenPressure  = true;   // pressure-toggle starts as .on
    pressureCurve   = 0.8;
    brushColor: number[] = [0.11, 0.094, 0.078]; // #1c1814

    private activeHex = "#1c1814";
    private recentColors: string[] = [];

    constructor(canvas: HTMLCanvasElement, _animMgr: AnimationManager) {
        canvas.style.cursor = "none";
        canvas.style.touchAction = "none";

        // Pointer events
        canvas.addEventListener("pointerdown", e => {
            if (e.button === 0) {
                this.isLeftClicked = true;
                this.pressure = e.pressure;
                this.updateNDC(e, canvas);
            }
        });
        canvas.addEventListener("pointerup",    () => { this.isLeftClicked = false; });
        canvas.addEventListener("pointerleave", () => { this.isLeftClicked = false; this.mouseX = 0; this.mouseY = 0; });
        canvas.addEventListener("pointermove",  e => this.onMove(e, canvas));

        document.addEventListener("keydown", this.onKeyDown);
        document.addEventListener("keyup",   this.onKeyUp);

        this.initControls();
    }

    private initControls() {
        // ── Sliders (no paired number inputs in new UI) ──────────────────────
        const bindSlider = (id: string, get: () => number, set: (v: number) => void) => {
            const el = document.getElementById(id) as HTMLInputElement | null;
            if (!el) return;
            el.value = String(get());
            el.addEventListener("input", () => set(parseFloat(el.value)));
        };
        bindSlider("brush-size-slider",    () => this.brushSize,       v => this.brushSize = v);
        bindSlider("smoothing-slider",     () => this.smoothingWeight, v => this.smoothingWeight = v);
        bindSlider("pressure-curve-slider",() => this.pressureCurve,  v => this.pressureCurve = v);

        // ── Pressure toggle (now a <div class="toggle on">) ──────────────────
        const pressureTog = document.getElementById("pressure-toggle");
        if (pressureTog) {
            // Initial state: starts with .on class → usePenPressure = true
            this.usePenPressure = pressureTog.classList.contains("on");
            // The inline script also listens and toggles the .on class.
            // We toggle our state to match, using capture phase to run before inline.
            pressureTog.addEventListener("click", () => {
                // Read state AFTER the inline script toggles (microtask)
                Promise.resolve().then(() => {
                    this.usePenPressure = pressureTog.classList.contains("on");
                });
            });
        }

        // ── Color picker ─────────────────────────────────────────────────────
        const colorPicker = document.getElementById("color-picker") as HTMLInputElement | null;
        if (colorPicker) {
            colorPicker.value = this.activeHex;
            colorPicker.addEventListener("input", () => {
                this.setColor(colorPicker.value, false);
            });
            colorPicker.addEventListener("change", () => {
                // Commit color to recent list on close
                this.setColor(colorPicker.value, true);
            });
        }

        // ── Tool buttons ─────────────────────────────────────────────────────
        document.getElementById("eraser-btn")?.addEventListener("click", () => {
            this.isErasing = true;
            document.getElementById("eraser-btn")?.classList.add("active");
            document.getElementById("brush-btn")?.classList.remove("active");
        });
        document.getElementById("brush-btn")?.addEventListener("click", () => {
            this.isErasing = false;
            document.getElementById("brush-btn")?.classList.add("active");
            document.getElementById("eraser-btn")?.classList.remove("active");
        });

        // ── Load & render recent colors ───────────────────────────────────────
        const stored = localStorage.getItem(RECENT_COLORS_KEY);
        this.recentColors = stored ? JSON.parse(stored) : [...DEFAULT_COLORS];
        this.renderSwatches();
    }

    // ── Color management ───────────────────────────────────────────────────────

    private setColor(hex: string, addToRecent: boolean) {
        this.activeHex = hex;
        const r = parseInt(hex.substring(1, 3), 16) / 255;
        const g = parseInt(hex.substring(3, 5), 16) / 255;
        const b = parseInt(hex.substring(5, 7), 16) / 255;
        this.brushColor = [r, g, b];

        const picker = document.getElementById("color-picker") as HTMLInputElement | null;
        if (picker && picker.value !== hex) picker.value = hex;

        if (addToRecent) {
            this.recentColors = this.recentColors.filter(c => c.toLowerCase() !== hex.toLowerCase());
            this.recentColors.unshift(hex);
            this.recentColors = this.recentColors.slice(0, MAX_RECENT);
            try { localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(this.recentColors)); } catch {}
            this.renderSwatches();
        } else {
            // Just update active highlight without reordering
            document.querySelectorAll(".swatch").forEach((s: Element) => {
                (s as HTMLElement).classList.toggle("current",
                    (s as HTMLElement).dataset.color?.toLowerCase() === hex.toLowerCase());
            });
        }
    }

    private renderSwatches() {
        const row = document.getElementById("swatch-row");
        if (!row) return;
        row.innerHTML = "";
        for (const color of this.recentColors) {
            const sw = document.createElement("div");
            sw.className = "swatch" + (color.toLowerCase() === this.activeHex.toLowerCase() ? " current" : "");
            sw.style.background = color;
            sw.dataset.color = color;
            sw.addEventListener("click", () => this.setColor(color, true));
            row.appendChild(sw);
        }
    }

    // ── Keyboard ──────────────────────────────────────────────────────────────

    private onKeyDown = (e: KeyboardEvent) => {
        if (e.code === "Space") { e.preventDefault(); this.isSpacePressed = true; }
        if (!e.shiftKey && e.code === "Minus") this.zoomOut = true;
        if (!e.shiftKey && e.code === "Equal") this.zoomIn  = true;
        if (e.code === "KeyG")  this.isGrabMode   = true;
        if (e.code === "KeyR")  this.isRotateMode = true;
    };

    private onKeyUp = (e: KeyboardEvent) => {
        if (e.code === "Space") this.isSpacePressed = false;
        if (e.code === "Minus") this.zoomOut = false;
        if (e.code === "Equal") this.zoomIn  = false;
        if (e.code === "KeyG")  this.isGrabMode   = false;
        if (e.code === "KeyR")  this.isRotateMode = false;
        if (e.code === "KeyE") {
            this.isErasing = !this.isErasing;
        }
    };

    private updateNDC(e: PointerEvent, canvas: HTMLCanvasElement) {
        const rect   = canvas.getBoundingClientRect();
        const cx     = rect.left + rect.width  / 2;
        const cy     = rect.top  + rect.height / 2;
        // Screen-space vector from canvas centre to pointer
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        // Rotate by -canvasAngle to get canvas-local coords
        const rad = -this.canvasAngle * Math.PI / 180;
        const rx  = dx * Math.cos(rad) - dy * Math.sin(rad);
        const ry  = dx * Math.sin(rad) + dy * Math.cos(rad);
        // Divide by canvas half-extents (CSS size)
        this.ndcX =  rx / (canvas.offsetWidth  / 2);
        this.ndcY = -ry / (canvas.offsetHeight / 2);
    }

    private onMove(e: PointerEvent, canvas: HTMLCanvasElement) {
        this.mouseX   = e.movementX;
        this.mouseY   = e.movementY;
        this.pressure = e.pressure;
        this.updateNDC(e, canvas);
    }
}
