export class Complex {
	x: number;
	y: number;
	visible: boolean;
	constructor(x: number = 0, y: number = 0, visible: boolean = true) {
		this.x = x;
		this.y = y;
		this.visible = visible;
	}
	add(other: Complex): Complex {
		return new Complex(this.x + other.x, this.y + other.y);
	}
	sub(other: Complex): Complex {
		return new Complex(this.x - other.x, this.y - other.y, this.visible);
	}
	mul(other: Complex): Complex {
		return new Complex(
			this.x * other.x - this.y * other.y,
			this.x * other.y + this.y * other.x,
		);
	}
	scale(scale: number): Complex {
		return new Complex(this.x * scale, this.y * scale, this.visible);
	}
	conj(): Complex {
		return new Complex(this.x, -this.y, this.visible);
	}
	exp(): Complex {
		const e = Math.exp(this.x);
		return new Complex(e * Math.cos(this.y), e * Math.sin(this.y));
	}
	pow(other: Complex): Complex {
		return new Complex();
	}
	rotate(radians: number): Complex {
		return this.mul(new Complex(Math.cos(radians), Math.sin(radians)));
	}
	asVisible(): Complex {
		return new Complex(this.x, this.y, true);
	}
	asHidden(): Complex {
		return new Complex(this.x, this.y, false);
	}
	distance(other: Complex): number {
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
	round(): Point {
		return new Point(Math.round(this.x), Math.round(this.y), this.visible);
	}
	toString(): string {
		return `{ x: ${this.x}, y: ${this.y} }`
	}
}

export class Point extends Complex {}
