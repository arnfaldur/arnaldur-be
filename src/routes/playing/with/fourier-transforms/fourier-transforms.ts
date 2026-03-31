import { Point } from "./Point";

function fftCore(points: Point[], sign: 1 | -1): Point[] {
	const longer = Math.pow(2, Math.ceil(Math.log2(points.length)));
	const result = points.slice();
	while (result.length < longer) {
		result.push(new Point(0, 0));
	}
	function recurse(points: Point[]): Point[] {
		if (points.length <= 1) {
			return points;
		} else if (points.length == 2) {
			// this is just for slightly better performance by saving one recursive call
			const [a, b] = points;
			return [a.add(b), a.sub(b)];
		}
		const a: Point[][] = [[], []];
		for (let i = 0; i < points.length; ++i) {
			a[i % 2].push(points[i]);
		}
		const even = recurse(a[0]);
		const odd = recurse(a[1]);

		const boi = even.map((_e, i) =>
			new Point(
				Math.cos((2 * Math.PI * i) / points.length),
				sign * Math.sin((2 * Math.PI * i) / points.length),
			).mul(odd[i])
		);

		const left = even.map((e, i) => e.add(boi[i]));
		const right = even.map((e, i) => e.sub(boi[i]));
		return [...left, ...right];
	}
	return recurse(result);
}

export function fft(points: Point[]): Point[] {
	return fftCore(points, -1);
}

export function ifft(points: Point[]): Point[] {
	const result = fftCore(points, 1);
	const n = Math.pow(2, Math.ceil(Math.log2(points.length)));
	return result.map((point) => point.scale(1 / n));
}

export function shuffleArray<T>(array: T[]) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

// The LLMs fought to produce this. GPT-4o delivered where o1, sonnet 3.7, and mistral failed.
// It is possible that my initial prompting was bad.
export function gifft(x: Point[]): Point[] {
	const N = x.length;
	const M = 1 << (32 - Math.clz32(2 * N - 1));

	const j = new Point(0, 1);
	const W = Array.from({ length: N }, (_, n) => j.scale((-Math.PI * (n * n)) / N).exp());

	const a = x.map((xi, n) => xi.conj().mul(W[n]));
	const b = Array.from({ length: M }, (_, k) => {
		if (k < N) return W[k].conj();
		if (k >= M - N + 1) return W[M - k].conj();
		return new Point(0, 0);
	});

	const A = fft(a.concat(Array(M - N).fill(new Point(0, 0))));
	const B = fft(b);
	const C = A.map((Ai, i) => Ai.mul(B[i]));
	const c = ifft(C);

	return Array.from({ length: N }, (_, n) =>
		c[n]
			.mul(W[n])
			.conj()
			.scale(1 / N));
}
