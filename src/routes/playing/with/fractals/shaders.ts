export const vertexSource = `#version 300 es
in vec2 a_position;
void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Split into parts so we can splice a user expression into the iteration body
export const fragmentPreamble = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform vec2 u_center;
uniform float u_zoom;
uniform int u_iterations;
uniform bool u_invert;

out vec4 fragColor;

const float PI = 3.141592653589793;
const float TAU = 6.283185307179586;

// Complex arithmetic — all operate on vec2 as (real, imag)
vec2 cmul(vec2 a, vec2 b) {
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + a.y * b.x);
}

vec2 cexp(vec2 z) {
    return exp(z.x) * vec2(cos(z.y), sin(z.y));
}

vec2 cln(vec2 z) {
    return vec2(log(length(z)), atan(z.y, z.x));
}

vec2 csin(vec2 z) {
    return vec2(sin(z.x) * cosh(z.y), cos(z.x) * sinh(z.y));
}

vec2 csinh(vec2 z) {
    return vec2(sinh(z.x) * cos(z.y), cosh(z.x) * sin(z.y));
}

vec2 ccos(vec2 z) {
    return vec2(cos(z.x) * cosh(z.y), -sin(z.x) * sinh(z.y));
}

vec2 cdiv(vec2 a, vec2 b) {
    float d = dot(b, b);
    return vec2(a.x * b.x + a.y * b.y, a.y * b.x - a.x * b.y) / d;
}

vec2 cpow(vec2 base, vec2 exponent) {
    if (dot(base, base) < 1e-12) return vec2(0.0);
    return cexp(cmul(exponent, cln(base)));
}

vec2 cconj(vec2 z) {
    return vec2(z.x, -z.y);
}

// Oklab/Oklch color space (Björn Ottosson)
const mat3 oklab2lmsMat = mat3(
    +1.0000000000, +1.0000000000, +1.0000000000,
    +0.3963377774, -0.1055613458, -0.0894841775,
    +0.2158037573, -0.0638541728, -1.2914855480
);
const mat3 lms2rgbMat = mat3(
    +4.0767416621, -1.2684380046, -0.0041960863,
    -3.3077115913, +2.6097574011, -0.7034186147,
    +0.2309699292, -0.3413193965, +1.7076147010
);

vec3 oklab2rgb(vec3 oklab) {
    vec3 lms = oklab2lmsMat * oklab;
    lms = lms * lms * lms;
    return lms2rgbMat * lms;
}

vec3 oklch2rgb(vec3 oklch) {
    float a = oklch.y * cos(oklch.z);
    float b = oklch.y * sin(oklch.z);
    return oklab2rgb(vec3(oklch.x, a, b));
}

vec3 domainColor(vec2 z) {
    float mag = length(z);
    float h = atan(z.y, z.x);

    float L = 1.0 - (2.0 / PI) * atan(mag);
    if (u_invert) L = 1.0 - L;

    float C = 0.15 * sqrt(4.0 * L * (1.0 - L));

    vec3 rgb = oklch2rgb(vec3(L, C, h));
    return pow(clamp(rgb, 0.0, 1.0), vec3(1.0 / 2.2));
}

void main() {
    vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / min(u_resolution.x, u_resolution.y);
    vec2 c = uv / u_zoom + u_center;

    vec2 z = c;

    for (int i = 0; i < u_iterations; i++) {
        if (z.x != z.x || z.y != z.y || isinf(z.x) || isinf(z.y)) break;

        z = `;

export const fragmentPostamble = `;
    }

    if (z.x != z.x || z.y != z.y || isinf(z.x) || isinf(z.y)) {
        float v = u_invert ? 1.0 : 0.0;
        fragColor = vec4(v, v, v, 1.0);
    } else {
        fragColor = vec4(domainColor(z), 1.0);
    }
}
`;

export function buildFragmentSource(expression: string): string {
	return fragmentPreamble + expression + fragmentPostamble;
}
