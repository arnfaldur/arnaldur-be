export class Point {
	x: number;
	y: number;
	visible: boolean;
	/* constructor({ x, y, visible }: { x: number; y: number; visible?: boolean }) {
		this.x = x;
		this.y = y;
		this.visible = visible;
	} */
	constructor(x: number = 0, y: number = 0, visible: boolean = true) {
		this.x = x;
		this.y = y;
		this.visible = visible;
	}
	add(other: Point): Point {
		return new Point(this.x + other.x, this.y + other.y);
	}
	sub(other: Point): Point {
		return new Point(this.x - other.x, this.y - other.y);
	}
	mul(other: Point): Point {
		return new Point(
			this.x * other.x - this.y * other.y,
			this.x * other.y + this.y * other.x,
		);
	}
	scale(scale: number): Point {
		return new Point(this.x * scale, this.y * scale);
	}
	conj(): Point {
		return new Point(this.x, -this.y);
	}
	exp(): Point {
		const e = Math.exp(this.x);
		return new Point(e * Math.cos(this.y), e * Math.sin(this.y));
	}
	rotate(radians: number): Point {
		return this.mul(new Point(Math.cos(radians), Math.sin(radians)));
	}
	asVisible(): Point {
		return new Point(this.x, this.y, true);
	}
	asHidden(): Point {
		return new Point(this.x, this.y, false);
	}
	distance(other: Point): number {
		return Math.sqrt(
			Math.pow(this.x - other.x, 2) + Math.pow(this.y - other.y, 2),
		);
	}
	abs(): number {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	arg(): number {
		return Math.atan2(this.y, this.x);
	}
	inBounds(): boolean {
		return Math.abs(this.x) <= 1 && Math.abs(this.y) <= 1;
	}
}
