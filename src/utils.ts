import { Ball } from "./main";
import { maps } from "./maps";

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

  add(p: Point) {
    return new Point(this.x + p.x, this.y + p.y);
  }

  subtract(p: Point) {
    return new Point(this.x - p.x, this.y - p.y);
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

  distance(point: Point) {
    return Math.sqrt((point.x - this.x) ** 2 + (point.y - this.y) ** 2);
  }

  clone() {
    return new Point(this.x, this.y);
  }
}

export interface GameState {
	map: typeof maps[0];
	balls: Ball[];
}