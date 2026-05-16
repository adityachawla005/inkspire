export class AudioManager {
    private ctx: AudioContext | null = null;
    private buffer: AudioBuffer | null = null;
    private source: AudioBufferSourceNode | null = null;
    private isPlaying = false;

    constructor() {
        // Waveform rendering is handled by the HTML-side inline script
        // via window.inkspireAudio + window.refreshAudioTrack().
    }

    async loadAudio(file: File) {
        if (!this.ctx) this.ctx = new AudioContext();
        if (this.ctx.state === "suspended") await this.ctx.resume();

        const arrayBuffer = await file.arrayBuffer();
        this.buffer = await this.ctx.decodeAudioData(arrayBuffer);

        // Hand off to the HTML waveform system.
        // duration → how many frames wide to draw
        // peaks    → normalized Float32Array for bar heights
        const peaks = this.computePeaks(this.buffer, 2000);
        (window as any).inkspireAudio = {
            duration: this.buffer.duration,
            peaks,
        };
        if (typeof (window as any).refreshAudioTrack === "function") {
            (window as any).refreshAudioTrack();
        }
    }

    /** Downsample the buffer into `numBars` normalized peak values (0–1). */
    private computePeaks(buffer: AudioBuffer, numBars: number): Float32Array {
        const data = buffer.getChannelData(0);
        const peaks = new Float32Array(numBars);
        const step = Math.floor(data.length / numBars);
        let globalMax = 0;

        for (let i = 0; i < numBars; i++) {
            let max = 0;
            for (let j = 0; j < step; j++) {
                const v = Math.abs(data[i * step + j] || 0);
                if (v > max) max = v;
            }
            peaks[i] = max;
            if (max > globalMax) globalMax = max;
        }

        if (globalMax > 0) {
            for (let i = 0; i < numBars; i++) peaks[i] /= globalMax;
        }

        return peaks;
    }

    play(fps: number, startFrame: number) {
        if (!this.ctx || !this.buffer) return;
        this.stop();

        const startTimeInSecs = startFrame / fps;
        if (startTimeInSecs >= this.buffer.duration) return;

        this.source = this.ctx.createBufferSource();
        this.source.buffer = this.buffer;
        this.source.connect(this.ctx.destination);
        this.source.start(0, startTimeInSecs);
        this.isPlaying = true;
    }

    stop() {
        if (this.source && this.isPlaying) {
            try { this.source.stop(); } catch { }
            this.source.disconnect();
            this.source = null;
        }
        this.isPlaying = false;
    }

    scrubToFrame(frameIndex: number, fps: number) {
        if (!this.ctx || !this.buffer) return;
        this.stop();

        const time = frameIndex / fps;
        if (time >= this.buffer.duration) return;

        this.source = this.ctx.createBufferSource();
        this.source.buffer = this.buffer;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        this.source.connect(gain);
        gain.connect(this.ctx.destination);
        this.source.start(0, time, 0.1);
    }
}