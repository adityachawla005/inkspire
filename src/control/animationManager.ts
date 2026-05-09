import { IAnimation, IFrame, ILayerDef, IStroke } from "../types/animationTypes";

const STORAGE_KEY = "inkspire-session-v1";
const AUTO_SAVE_DELAY = 5000;

export class AnimationManager {
    animation: IAnimation;
    currentFrameIndex = 0;
    currentLayerIndex = 0;

    /** Called by App whenever animation state changes (frame add/delete etc.) */
    onChanged: (() => void) | null = null;

    private autoSaveTimer: number | null = null;

    constructor() {
        this.animation = this.createDefault();
    }

    // ─── Defaults ──────────────────────────────────────────────────────────────

    private createDefault(): IAnimation {
        return {
            version: 1,
            fps: 12,
            layers: [{ name: "Layer 1", visible: true, opacity: 1.0 }],
            frames: [{ layerStrokes: [[]] }],
        };
    }

    // ─── Convenience getters ───────────────────────────────────────────────────

    get currentFrame(): IFrame {
        return this.animation.frames[this.currentFrameIndex];
    }

    get currentLayer(): ILayerDef {
        return this.animation.layers[this.currentLayerIndex];
    }

    get currentStrokes(): IStroke[] {
        return this.currentFrame.layerStrokes[this.currentLayerIndex] ?? [];
    }

    get frameCount() { return this.animation.frames.length; }
    get layerCount()  { return this.animation.layers.length; }

    // ─── Navigation ────────────────────────────────────────────────────────────

    setCurrentFrame(index: number) {
        if (index < 0 || index >= this.frameCount) return;
        this.currentFrameIndex = index;
    }

    setCurrentLayer(index: number) {
        if (index < 0 || index >= this.layerCount) return;
        this.currentLayerIndex = index;
    }

    // ─── Stroke operations ─────────────────────────────────────────────────────

    addStroke(stroke: IStroke) {
        this.currentFrame.layerStrokes[this.currentLayerIndex].push(stroke);
        this.scheduleAutoSave();
    }

    setLayerStrokes(strokes: IStroke[]) {
        this.currentFrame.layerStrokes[this.currentLayerIndex] = strokes;
        this.scheduleAutoSave();
    }

    // ─── Frame operations ──────────────────────────────────────────────────────

    addFrame(afterIndex?: number) {
        const idx = afterIndex ?? this.frameCount - 1;
        const newFrame: IFrame = {
            layerStrokes: this.animation.layers.map(() => []),
        };
        this.animation.frames.splice(idx + 1, 0, newFrame);
        this.scheduleAutoSave();
        this.onChanged?.();
    }

    duplicateFrame(index: number) {
        const src = this.animation.frames[index];
        const newFrame: IFrame = {
            layerStrokes: src.layerStrokes.map(ls =>
                ls.map(s => ({
                    points: s.points.map(p => [...p]),
                    radii:  [...s.radii],
                    color:  [...s.color],
                }))
            ),
        };
        this.animation.frames.splice(index + 1, 0, newFrame);
        this.currentFrameIndex = index + 1;
        this.scheduleAutoSave();
        this.onChanged?.();
    }

    deleteFrame(index: number) {
        if (this.frameCount <= 1) return;
        this.animation.frames.splice(index, 1);
        if (this.currentFrameIndex >= this.frameCount)
            this.currentFrameIndex = this.frameCount - 1;
        this.scheduleAutoSave();
        this.onChanged?.();
    }

    // ─── Layer operations ──────────────────────────────────────────────────────

    addLayer(name?: string) {
        this.animation.layers.push({
            name: name ?? `Layer ${this.layerCount + 1}`,
            visible: true,
            opacity: 1.0,
        });
        for (const frame of this.animation.frames) frame.layerStrokes.push([]);
        this.scheduleAutoSave();
        this.onChanged?.();
    }

    deleteLayer(index: number) {
        if (this.layerCount <= 1) return;
        this.animation.layers.splice(index, 1);
        for (const frame of this.animation.frames) frame.layerStrokes.splice(index, 1);
        if (this.currentLayerIndex >= this.layerCount)
            this.currentLayerIndex = this.layerCount - 1;
        this.scheduleAutoSave();
        this.onChanged?.();
    }

    toggleLayerVisible(index: number) {
        this.animation.layers[index].visible = !this.animation.layers[index].visible;
        this.scheduleAutoSave();
        this.onChanged?.();
    }

    renameLayer(index: number, name: string) {
        this.animation.layers[index].name = name;
        this.scheduleAutoSave();
    }

    // ─── Combined rendering helpers ─────────────────────────────────────────────

    /** All visible strokes for a given frame (all layers merged). */
    getFrameStrokes(frameIndex: number): IStroke[] {
        const frame = this.animation.frames[frameIndex];
        if (!frame) return [];
        const out: IStroke[] = [];
        for (let li = 0; li < this.animation.layers.length; li++) {
            if (this.animation.layers[li].visible)
                out.push(...(frame.layerStrokes[li] ?? []));
        }
        return out;
    }

    // ─── Persistence ───────────────────────────────────────────────────────────

    saveSession() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.animation));
        } catch (e) {
            console.warn("Auto-save failed:", e);
        }
    }

    loadSession(): boolean {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return false;
            const parsed = JSON.parse(raw) as IAnimation;
            if (!parsed.frames?.length || !parsed.layers?.length) return false;
            this.animation = parsed;
            this.currentFrameIndex = 0;
            this.currentLayerIndex = 0;
            return true;
        } catch { return false; }
    }

    exportProject() {
        const blob = new Blob([JSON.stringify(this.animation, null, 2)], { type: "application/json" });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement("a");
        a.href     = url;
        a.download = "animation.inkspire";
        a.click();
        URL.revokeObjectURL(url);
    }

    importProject(json: string) {
        try {
            const parsed = JSON.parse(json) as IAnimation;
            if (!parsed.frames?.length || !parsed.layers?.length) throw new Error("invalid");
            this.animation = parsed;
            this.currentFrameIndex = 0;
            this.currentLayerIndex = 0;
            this.onChanged?.();
        } catch (e) { console.error("Import failed:", e); }
    }

    private scheduleAutoSave() {
        if (this.autoSaveTimer !== null) clearTimeout(this.autoSaveTimer);
        this.autoSaveTimer = window.setTimeout(() => this.saveSession(), AUTO_SAVE_DELAY);
    }
}
