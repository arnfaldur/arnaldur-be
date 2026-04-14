import { createMemo, createSignal, For, onCleanup } from "solid-js";

import { Slider } from "../fourier-transforms/components";
import { vertexSource, buildFragmentSource } from "./shaders";

function compileShader(
	gl: WebGL2RenderingContext,
	type: number,
	source: string,
): WebGLShader | null {
	const shader = gl.createShader(type);
	if (!shader) return null;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const log = gl.getShaderInfoLog(shader);
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

function linkProgram(
	gl: WebGL2RenderingContext,
	vertexShader: WebGLShader,
	fragmentShader: WebGLShader,
): WebGLProgram | null {
	const program = gl.createProgram();
	if (!program) return null;
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		gl.deleteProgram(program);
		return null;
	}
	return program;
}

interface Preset {
	name: string;
	expr: string;
}

const presets: Preset[] = [
	{ name: "z\u00B2 + c", expr: "cmul(z, z) + c" },
	{ name: "z\u00B3 + c", expr: "cmul(cmul(z, z), z) + c" },
	{ name: "z\u2074 + c", expr: "cmul(cmul(z, z), cmul(z, z)) + c" },
	{
		name: "Burning Ship",
		expr: "vec2(abs(z.x)*abs(z.x)-abs(z.y)*abs(z.y), 2.0*abs(z.x)*abs(z.y)) + c",
	},
	{ name: "e\u1dbb", expr: "cexp(z)" },
	{ name: "sin(z)", expr: "csin(z)" },
	{ name: "sinh(z)", expr: "csinh(z)" },
	{ name: "cos(z)", expr: "ccos(z)" },
	{ name: "z\u1d9c", expr: "cpow(z, c)" },
	{ name: "c\u1dbb", expr: "cpow(c, z)" },
	{ name: "z\u00B3 - z + c", expr: "cmul(cmul(z, z), z) - z + c" },
	{ name: "sin(z\u00B2)", expr: "csin(cmul(z, z))" },
	{ name: "z\u00B7e\u1dbb", expr: "cmul(z, cexp(z))" },
	{ name: "z\u00B2 + c/z", expr: "cmul(z, z) + cdiv(c, z)" },
	{ name: "c\u00B7z\u00B7(1-z)", expr: "cmul(c, cmul(z, vec2(1.0, 0.0) - z))" },
	{ name: "z\u00B2 + c\u00B7sin(z)", expr: "cmul(z, z) + cmul(c, csin(z))" },
];

export function MandelbrotCanvas() {
	const [expression, setExpression] = createSignal(presets[0].expr);
	const [shaderError, setShaderError] = createSignal("");
	const [centerX, setCenterX] = createSignal(-0.5);
	const [centerY, setCenterY] = createSignal(0.0);
	const [rawZoom, setRawZoom] = createSignal(0.35);
	const zoom = createMemo(() => Math.pow(2, rawZoom() * 24 - 8));
	const [iterations, setIterations] = createSignal(10);
	const [invert, setInvert] = createSignal(false);

	const [sidebarWidth, setSidebarWidth] = createSignal(300);

	// These get set inside setupCanvas and called from outside
	let recompile: ((expr: string) => void) | undefined;

	const applyExpression = (expr: string) => {
		if (expr.includes(";")) return;
		setExpression(expr);
		recompile?.(expr);
	};

	const onGripPointerDown = (e: PointerEvent) => {
		const grip = e.currentTarget as HTMLElement;
		grip.setPointerCapture(e.pointerId);
		const offset = e.clientX - sidebarWidth();
		const onMove = (e: PointerEvent) => setSidebarWidth(Math.max(0, e.clientX - offset));
		const onUp = () => {
			grip.removeEventListener("pointermove", onMove);
			grip.removeEventListener("pointerup", onUp);
		};
		grip.addEventListener("pointermove", onMove);
		grip.addEventListener("pointerup", onUp);
	};

	const setupCanvas = (canvas: HTMLCanvasElement) => {
		const gl = canvas.getContext("webgl2");
		if (!gl) return;

		const vertShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
		if (!vertShader) return;

		// Fullscreen quad VAO (shared across all programs)
		const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
		const vao = gl.createVertexArray();
		gl.bindVertexArray(vao);
		const buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

		interface ProgramBundle {
			program: WebGLProgram;
			uResolution: WebGLUniformLocation | null;
			uCenter: WebGLUniformLocation | null;
			uZoom: WebGLUniformLocation | null;
			uIterations: WebGLUniformLocation | null;
			uInvert: WebGLUniformLocation | null;
		}

		function buildProgram(expr: string): ProgramBundle | null {
			const fragSource = buildFragmentSource(expr);
			const fragShader = compileShader(gl!, gl!.FRAGMENT_SHADER, fragSource);
			if (!fragShader) return null;
			const program = linkProgram(gl!, vertShader!, fragShader);
			gl!.deleteShader(fragShader);
			if (!program) return null;
			return {
				program,
				uResolution: gl!.getUniformLocation(program, "u_resolution"),
				uCenter: gl!.getUniformLocation(program, "u_center"),
				uZoom: gl!.getUniformLocation(program, "u_zoom"),
				uIterations: gl!.getUniformLocation(program, "u_iterations"),
				uInvert: gl!.getUniformLocation(program, "u_invert"),
			};
		}

		let current = buildProgram(expression())!;

		recompile = (expr: string) => {
			const next = buildProgram(expr);
			if (next) {
				gl.deleteProgram(current.program);
				current = next;
				setShaderError("");
			} else {
				setShaderError("Compile error");
			}
		};

		const resizeCanvas = () => {
			const width = canvas.clientWidth;
			const height = canvas.clientHeight;
			if (canvas.width !== width || canvas.height !== height) {
				canvas.width = width;
				canvas.height = height;
				gl.viewport(0, 0, width, height);
			}
		};
		const observer = new ResizeObserver(resizeCanvas);
		observer.observe(canvas);
		resizeCanvas();

		let frameId: number;
		const render = () => {
			resizeCanvas();
			const p = current;
			gl.useProgram(p.program);
			gl.uniform2f(p.uResolution, canvas.width, canvas.height);
			gl.uniform2f(p.uCenter, centerX(), centerY());
			gl.uniform1f(p.uZoom, zoom());
			gl.uniform1i(p.uIterations, iterations());
			gl.uniform1i(p.uInvert, invert() ? 1 : 0);
			gl.bindVertexArray(vao);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
			frameId = requestAnimationFrame(render);
		};

		const onBlur = () => cancelAnimationFrame(frameId);
		const onFocus = () => {
			frameId = requestAnimationFrame(render);
		};
		window.addEventListener("blur", onBlur);
		window.addEventListener("focus", onFocus);
		frameId = requestAnimationFrame(render);

		onCleanup(() => {
			cancelAnimationFrame(frameId);
			observer.disconnect();
			window.removeEventListener("blur", onBlur);
			window.removeEventListener("focus", onFocus);
			recompile = undefined;
		});

		let isPanning = false;
		let lastX = 0;
		let lastY = 0;

		canvas.addEventListener("pointerdown", (e) => {
			isPanning = true;
			lastX = e.clientX;
			lastY = e.clientY;
			canvas.setPointerCapture(e.pointerId);
		});
		canvas.addEventListener("pointermove", (e) => {
			if (!isPanning) return;
			const dx = e.clientX - lastX;
			const dy = e.clientY - lastY;
			lastX = e.clientX;
			lastY = e.clientY;
			const s = Math.min(canvas.clientWidth, canvas.clientHeight);
			const z = zoom();
			setCenterX((cx) => cx - dx / (s * z));
			setCenterY((cy) => cy + dy / (s * z));
		});
		canvas.addEventListener("pointerup", () => {
			isPanning = false;
		});
		canvas.addEventListener("pointercancel", () => {
			isPanning = false;
		});

		canvas.addEventListener(
			"wheel",
			(e) => {
				e.preventDefault();
				const rect = canvas.getBoundingClientRect();
				const s = Math.min(rect.width, rect.height);
				const mx = (e.clientX - rect.left - rect.width / 2) / s;
				const my = -(e.clientY - rect.top - rect.height / 2) / s;
				const oldZoom = zoom();
				const worldX = mx / oldZoom + centerX();
				const worldY = my / oldZoom + centerY();

				const delta = -e.deltaY * 0.0001;
				const newRaw = Math.max(0, Math.min(1, rawZoom() + delta));
				setRawZoom(newRaw);
				const newZoom = zoom();

				setCenterX(worldX - mx / newZoom);
				setCenterY(worldY - my / newZoom);
			},
			{ passive: false },
		);
	};

	return (
		<div id="fractal-viewer">
			<aside class="left" style={{ width: `${sidebarWidth()}px` }}>
				<fieldset class="flex">
					<legend>z =</legend>
					<input
						type="text"
						value={expression()}
						style={{ width: "100%", "font-family": "monospace" }}
						onKeyDown={(e) => {
							if (e.key === "Enter") applyExpression(e.currentTarget.value);
						}}
						onBlur={(e) => applyExpression(e.currentTarget.value)}
					/>
					{shaderError() && (
						<span style={{ color: "#f66" }}>{shaderError()}</span>
					)}
				</fieldset>
				<fieldset class="flex">
					<legend>Presets</legend>
					<For each={presets}>
						{(p) => (
							<button
								onClick={() => {
									applyExpression(p.expr);
									// Also update the text input
									const input = document.querySelector(
										"#fractal-viewer input[type=text]",
									) as HTMLInputElement | null;
									if (input) input.value = p.expr;
								}}
							>
								{p.name}
							</button>
						)}
					</For>
				</fieldset>
				<fieldset class="slider-grid">
					<legend>View</legend>
					Zoom
					<Slider value={0.35} setValue={setRawZoom} />
					Iterations
					<input
						type="range"
						min={0}
						max={256}
						step={1}
						value={10}
						onInput={(e) => setIterations(Number(e.target.value))}
					/>
				</fieldset>
				<fieldset class="flex">
					<legend>Display</legend>
					<label>
						<input
							type="checkbox"
							onInput={(e) => setInvert(e.target.checked)}
						/>
						Invert luminance
					</label>
				</fieldset>
				<fieldset class="flex">
					<legend>Info</legend>
					<span>
						Center: ({centerX().toFixed(6)}, {centerY().toFixed(6)})
					</span>
					<span>Zoom: {zoom().toFixed(2)}x</span>
					<span>Iterations: {iterations()}</span>
				</fieldset>
			</aside>
			<div onPointerDown={onGripPointerDown} />
			<canvas ref={setupCanvas} width="400" height="400" />
		</div>
	);
}
