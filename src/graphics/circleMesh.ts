export class CircleMesh {
    buffer: GPUBuffer;
    bufferLayout: GPUVertexBufferLayout;

    constructor(device: GPUDevice) {
        const verts: number[][] = [];
        const segments = 32; 

        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * 2 * Math.PI;
            const y = Math.cos(angle);
            const z = Math.sin(angle);

            // [x, y, z] - circle is on the X=0 plane
            verts.push([0, y, z]);
            verts.push([0, 0, 0]);     
        }

        const vertices: Float32Array = new Float32Array(verts.flat());
        const usage: GPUBufferUsageFlags = GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST;

        const descriptor: GPUBufferDescriptor = {
            size: vertices.byteLength,
            usage: usage,
            mappedAtCreation: true
        };

        this.buffer = device.createBuffer(descriptor);
        new Float32Array(this.buffer.getMappedRange()).set(vertices);
        this.buffer.unmap();

        this.bufferLayout = {
            arrayStride: 12, // 3 floats * 4 bytes
            stepMode: "vertex",
            attributes: [
                {
                    shaderLocation: 0,
                    format: "float32x3",
                    offset: 0
                }
            ]
        };
    }

    destroy() {
        this.buffer.destroy();
    }
}