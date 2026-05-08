struct TransformData{
    model: mat4x4<f32>, // actual pos of model
    view: mat4x4<f32>, // where shit is wrt camera
    projection: mat4x4<f32> // perspective
};

@binding(0) @group(0) var<uniform> transformUBO : TransformData;

struct Fragment {
    @builtin(position) Position : vec4<f32>,
    @location(0) Color : vec4<f32>
};

@vertex
fn vs_main(
    @location(0) vertexPosition: vec3<f32>,
    @location(1) instanceOffset: vec2<f32>,
    @location(2) instanceColor: vec3<f32>,
    @location(3) instanceRadius: f32
) -> Fragment {

    var output : Fragment;
    
    let pos = vec3<f32>(
        vertexPosition.x, 
        instanceOffset.x + vertexPosition.y * instanceRadius,
        instanceOffset.y + vertexPosition.z * instanceRadius
    );

    output.Position = transformUBO.projection * transformUBO.view * transformUBO.model * vec4<f32>(pos, 1.0);
    output.Color = vec4<f32>(instanceColor, 1.0);

    return output;
}

@fragment
fn fs_main(@location(0) Color: vec4<f32>) -> @location(0) vec4<f32> {
    return Color;
}