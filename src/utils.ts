export class Point {
  y: number;
  x: number;
  constructor(point: { x: number; y: number });
  constructor(x: number, y: number);
  constructor(p1: { x: number; y: number } | number, p2?: number) {
    if (typeof p1 === "object") {
      this.x = p1.x;
      this.y = p1.y;
    } else {
      this.x = p1;
      this.y = p2!;
    }
  }

  set(point: { x: number; y: number }): void;
  set(x: number, y: number): void;
  set(p1: { x: number; y: number } | number, p2?: number): void {
    if (typeof p1 === "object") {
      this.x = p1.x;
      this.y = p1.y;
    } else {
      this.x = p1;
      this.y = p2!;
    }
  }

  array(): [number, number] {
    return [this.x, this.y];
  }

  equals(point: Point) {
    return point.x === this.x && point.y === this.y;
  }
}
