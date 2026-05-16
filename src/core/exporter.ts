import * as Mp4Muxer from "mp4-muxer";
import { GIFEncoder, quantize, applyPalette } from "gifenc";
import JSZip from "jszip";
import { AnimationManager } from "../control/animationManager";
import { Renderer } from "../graphics/renderer";

export class Exporter {
    private animMgr: AnimationManager;
    private renderer: Renderer;
    private canvas: HTMLCanvasElement;
    
    constructor(animMgr: AnimationManager, renderer: Renderer, canvas: HTMLCanvasElement) {
        this.animMgr = animMgr;
        this.renderer = renderer;
        this.canvas = canvas;
    }

    private async updateProgress(percent: number) {
        const fill = document.getElementById("exp-progress-fill");
        if (fill) fill.style.width = `${percent}%`;
        // Allow UI to paint
        await new Promise(r => setTimeout(r, 0));
    }

    private showProgressModal(show: boolean) {
        const modal = document.getElementById("export-progress");
        if (modal) {
            if (show) modal.classList.remove("hidden");
            else modal.classList.add("hidden");
        }
    }

    private async captureFrame(frameIndex: number): Promise<ImageData> {
        // Fast-render the frame synchronously
        this.animMgr.setCurrentFrame(frameIndex);
        this.renderer.strokeMgr.loadFrame();
        // Render without cursor, without onion skins
        this.renderer.render(
            false, false, 0, 0, 0, 0, null, null, false, false,
            0.1, [0,0,0], 1.0, false, 1.0, false,
            true // hide cursor
        );

        // Await WebGPU queue submission and rendering
        await this.renderer.contextMgr.device.queue.onSubmittedWorkDone();

        // Read back pixels using a temporary canvas (since WebGPU canvas is usually not directly readPixels-able)
        // Wait, WebGPU canvas can be drawn to a 2D canvas if it's configured with alphaMode:'premultiplied' etc.
        // Actually, the easiest way to read pixels in WebGPU is to copy the texture to a buffer.
        // But since we want ImageData, and we already draw to the canvas, we can just do drawImage to an offscreen 2D canvas!
        const offscreen = document.createElement("canvas");
        offscreen.width = this.canvas.width;
        offscreen.height = this.canvas.height;
        const ctx = offscreen.getContext("2d", { willReadFrequently: true })!;
        ctx.drawImage(this.canvas, 0, 0);
        return ctx.getImageData(0, 0, offscreen.width, offscreen.height);
    }

    // ── MP4 EXPORT ────────────────────────────────────────────────────────────

    async exportMP4() {
        this.showProgressModal(true);
        this.updateProgress(0);

        try {
            const fps = this.animMgr.animation.fps;
            const muxer = new Mp4Muxer.Muxer({
                target: new Mp4Muxer.ArrayBufferTarget(),
                video: {
                    codec: "avc",
                    width: this.canvas.width,
                    height: this.canvas.height
                },
                fastStart: "in-memory"
            });

            // @ts-ignore - VideoEncoder is available in modern browsers
            const videoEncoder = new VideoEncoder({
                output: (chunk: any, meta: any) => muxer.addVideoChunk(chunk, meta),
                error: (e: any) => console.error("VideoEncoder error:", e)
            });

            videoEncoder.configure({
                codec: "avc1.42E01F", // H.264 Baseline Profile
                width: this.canvas.width,
                height: this.canvas.height,
                bitrate: 5_000_000,
                framerate: fps
            });

            const originalFrame = this.animMgr.currentFrameIndex;

            for (let i = 0; i < this.animMgr.frameCount; i++) {
                const imgData = await this.captureFrame(i);
                
                // Create VideoFrame
                // @ts-ignore
                const frame = new VideoFrame(imgData.data.buffer, {
                    format: "RGBA",
                    codedWidth: this.canvas.width,
                    codedHeight: this.canvas.height,
                    timestamp: (i * 1_000_000) / fps // microseconds
                });

                videoEncoder.encode(frame, { keyFrame: i % 30 === 0 });
                frame.close();

                await this.updateProgress(((i + 1) / this.animMgr.frameCount) * 90);
            }

            await videoEncoder.flush();
            videoEncoder.close();
            muxer.finalize();

            const buffer = muxer.target.buffer;
            this.downloadBlob(new Blob([buffer], { type: "video/mp4" }), "animation.mp4");

            // Restore state
            this.animMgr.setCurrentFrame(originalFrame);
            this.renderer.strokeMgr.loadFrame();
        } catch (e) {
            console.error("Export MP4 failed", e);
            alert("MP4 Export failed. Check console or try GIF.");
        } finally {
            this.showProgressModal(false);
        }
    }

    // ── GIF EXPORT ────────────────────────────────────────────────────────────

    async exportGIF() {
        this.showProgressModal(true);
        this.updateProgress(0);

        try {
            const fps = this.animMgr.animation.fps;
            const delay = Math.round(1000 / fps);
            const gif = GIFEncoder();

            const originalFrame = this.animMgr.currentFrameIndex;

            for (let i = 0; i < this.animMgr.frameCount; i++) {
                const imgData = await this.captureFrame(i);
                
                // Quantize and palettize
                const palette = quantize(imgData.data, 256);
                const index = applyPalette(imgData.data, palette);

                gif.writeFrame(index, this.canvas.width, this.canvas.height, {
                    palette,
                    delay
                });

                await this.updateProgress(((i + 1) / this.animMgr.frameCount) * 90);
            }

            gif.finish();
            const bytes = gif.bytes();
            this.downloadBlob(new Blob([bytes], { type: "image/gif" }), "animation.gif");

            // Restore state
            this.animMgr.setCurrentFrame(originalFrame);
            this.renderer.strokeMgr.loadFrame();
        } catch (e) {
            console.error("Export GIF failed", e);
        } finally {
            this.showProgressModal(false);
        }
    }

    // ── ZIP EXPORT ────────────────────────────────────────────────────────────

    async exportZIP() {
        this.showProgressModal(true);
        this.updateProgress(0);

        try {
            const zip = new JSZip();
            const originalFrame = this.animMgr.currentFrameIndex;

            for (let i = 0; i < this.animMgr.frameCount; i++) {
                await this.captureFrame(i); // Render to canvas
                
                // Get data URL
                const dataUrl = this.canvas.toDataURL("image/png");
                const base64 = dataUrl.split(",")[1];
                
                // Add to zip
                const frameName = `frame_${String(i + 1).padStart(3, "0")}.png`;
                zip.file(frameName, base64, { base64: true });

                await this.updateProgress(((i + 1) / this.animMgr.frameCount) * 90);
            }

            const content = await zip.generateAsync({ type: "blob" });
            this.downloadBlob(content, "frames.zip");

            // Restore state
            this.animMgr.setCurrentFrame(originalFrame);
            this.renderer.strokeMgr.loadFrame();
        } catch (e) {
            console.error("Export ZIP failed", e);
        } finally {
            this.showProgressModal(false);
        }
    }

    // ── CURRENT FRAME EXPORT ──────────────────────────────────────────────────

    async exportCurrentFrame() {
        // No modal needed, instantaneous
        const dataUrl = this.canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `inkspire_frame_${this.animMgr.currentFrameIndex + 1}.png`;
        a.click();
    }

    // ── UTILS ─────────────────────────────────────────────────────────────────

    private downloadBlob(blob: Blob, filename: string) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}
