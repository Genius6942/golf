import { maps } from "./maps";
import "./style.css";
import { Point } from "./utils";

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;
document.body.appendChild(canvas);

const resize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

resize();
window.addEventListener("resize", resize);

interface Touch {
  id: number;
  start: Point;
  current: Point;
}

const friction = 0.03;

let turn: number = 0;

interface BallOptions {
  color?: string;
}

class Ball extends Point {
  id: number;
  width = 10;
  height = 100;
  pullbackMultiplier = 0.08;
  thickness = 10;
  color = "#" + Math.floor(Math.random() * 16777215).toString(16);
  state: "pull" | "fly" = "pull";
  radius = 10;
  v: Point = new Point(0, 0);

  touch: Touch | null = null;
  constructor(id: number, { x, y }: { x: number; y: number }, options: BallOptions = {}) {
    super(x, y);

    this.id = id;

    if (options.color) this.color = options.color;

    this.bindTouchControls();
  }

  static transformPoint(number: number) {
    return -number + window.innerHeight;
  }

  bindTouchControls() {
    canvas.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.touch) return;
        if (turn !== this.id) return;
        if (e.touches.length < 1) return;

        const touch = e.touches[0];

        this.touch = {
          id: touch.identifier,
          start: new Point(touch.clientX, Ball.transformPoint(touch.clientY)),
          current: new Point(touch.clientX, Ball.transformPoint(touch.clientY)),
        };
      },
      { passive: false }
    );

    document.addEventListener("touchmove", (e) => {
      if (!this.touch) return;
      if (this.id !== turn) {
        this.touch = null;
        return;
      }
      const touch = [...e.touches].find((t) => t.identifier === this.touch?.id);
      if (touch) {
        this.touch.current.set({
          x: touch.clientX,
          y: Ball.transformPoint(touch.clientY),
        });
      }
    });

    const endListener = (e: TouchEvent) => {
      if (!this.touch) return;
      const touchFound = !![...e.touches].find(
        (touch) => touch.identifier === this.touch?.id
      );

      if (this.touch && !touchFound) {
        const angle = this.pullAngle;
        if (angle === undefined) return;
        this.state = "fly";

        this.v.set({
          x: -Math.cos(angle) * this.pullback!,
          y: -Math.sin(angle) * this.pullback!,
        });
        this.touch = null;
        turn = (turn + 1) % players.length;
      }
      if (!touchFound) this.touch = null;
    };

    canvas.addEventListener("touchend", endListener);
    canvas.addEventListener("touchcancel", endListener);

    // mouse listeners
    document.addEventListener('mousedown', (e) => {
      if (this.touch) return;
      if (turn !== this.id) return;

      const touch = e;

      this.touch = {
        id: -1,
        start: new Point(touch.clientX, Ball.transformPoint(touch.clientY)),
        current: new Point(touch.clientX, Ball.transformPoint(touch.clientY)),
      };
    });

    
  }

  get pullAngle() {
    if (!this.touch || this.touch.current.equals(this.touch.start)) return;
    return Math.atan2(
      this.touch.current.y - this.touch.start.y,
      this.touch.current.x - this.touch.start.x
    );
  }

  get pullback() {
    if (!this.touch || this.touch.current.equals(this.touch.start)) return;
    return this.tension * this.pullbackMultiplier;
  }

  get tension(): number {
    if (!this.touch || this.touch.current.equals(this.touch.start)) return null as any;
    return Math.sqrt(
      (this.touch.current.x - this.touch.start.x) ** 2 +
        (this.touch.current.y - this.touch.start.y) ** 2
    ) as any;
  }

  update() {
    if (this.state === "fly") {
      this.v.x *= 1 - friction;
      if (this.v.x < 0.01 && this.v.x > -0.01) this.v.x = 0;
      this.v.y *= 1 - friction;
      if (this.v.y < 0.01 && this.v.y > -0.01) this.v.y = 0;
    } else {
      this.state = "pull";
      this.v.set({ x: 0, y: 0 });
    }

    this.x += this.v.x;
    this.y += this.v.y;
  }

  intersectsLine(p1: Point, p2: Point) {
    const v1 = {
      x: p2.x - p1.x,
      y: p2.y - p1.y,
    };
    const v2 = {
      x: p1.x - this.x,
      y: p1.y - this.y,
    };
    let b = -(v1.x * v2.x + v1.y * v2.y) * 2;
    const c = 2 * (v1.x * v1.x + v1.y * v1.y);
    const d = Math.sqrt(
      b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - this.radius * this.radius)
    );
    if (isNaN(d)) {
      // no intercept
      return [];
    }
    const u1 = (b - d) / c; // these represent the unit distance of point one and two on the line
    const u2 = (b + d) / c;
    if (u1 <= 1 && u1 >= 0) {
      return true;
    }
    if (u2 <= 1 && u2 >= 0) {
      return true;
    }
    return false;
  }

  bounceOffLine(p1: Point, p2: Point) {
    const n = {
      x: p2.y - p1.y,
      y: p1.x - p2.x,
    };
    const len = Math.sqrt(n.x * n.x + n.y * n.y);
    n.x /= len;
    n.y /= len;
    const dot = this.v.x * n.x + this.v.y * n.y;
    this.v.x -= 2 * dot * n.x;
    this.v.y -= 2 * dot * n.y;
  }

  render() {
    ctx.beginPath();
    ctx.fillStyle = this.color;

    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

    ctx.fill();

    if (this.touch) {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 4;

      ctx.beginPath();

      ctx.moveTo(...this.touch.start.array());
      ctx.lineTo(...this.touch.current.array());

      ctx.stroke();
    }
  }
}

const players = [new Ball(0, { x: 100, y: 100 }), new Ball(1, { x: 200, y: 100 })];

const camera = new Point(canvas.width / 2, canvas.height / 2);

const map = maps[0];

const borders = map.borders.map((border) => {
	

const render = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // do camera trickery
  ctx.save();

  ctx.scale(1, -1);
  ctx.translate(camera.x - canvas.width / 2, camera.y - (canvas.height / 2) * 3);

  players.forEach((player) => player.update());
  players.forEach((player) => player.render());

  ctx.restore();

  requestAnimationFrame(render);
};
requestAnimationFrame(render);
