import "./style.css";

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;
document.body.appendChild(canvas);

const resize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

resize();
window.addEventListener("resize", resize);

class Point {
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

interface Touch {
  id: number;
  start: Point;
  current: Point;
}

const friction = .03;

const ball = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  radius: 10,
  speedResistance: 5,
  state: "wait" as "wait" | "pull" | "fly",

  get color() {
    return "red";
  },

  update() {
    if (this.state === "wait" || this.state === "pull") {
      if (turn === "left") this.setToSling(left);
      else this.setToSling(right);
    } else if (this.state === "fly") {
      this.vy += gravity;

      this.x += this.vx;
      this.y += this.vy;

      if (this.y + this.radius < -200) {
        this.state = "wait";
        turn = turn === "right" ? "left" : "right";
      }
    }
  },
  setToSling(sling: Sling) {
    const angle = sling.pullAngle;
    if (!angle) {
      if (this.state === "pull") {
        this.state = "fly";
        this.vx = (-1 * (this.x - sling.base.x)) / this.speedResistance;
        this.vy = (-1 * (this.y - (sling.base.y + sling.height))) / this.speedResistance;
      } else {
        this.x = sling.base.x;
        this.y = sling.base.y + sling.height;
      }
    } else {
      this.x = sling.base.x + Math.cos(angle) * sling.pullback!;
      this.y = sling.base.y + sling.height + Math.sin(angle) * sling.pullback!;
      this.state = "pull";
    }
  },

  render() {
    ctx.beginPath();
    ctx.fillStyle = this.color;

    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

    ctx.fill();
  },
};

let turn: number = 0;

class Ball extends Point {
  id: number;
  width = 10;
  height = 100;
  pullbackMultiplier = 0.5;
  thickness = 10;
  color = Math.floor(Math.random() * 16777215).toString(16);
  state: "pull" | "fly" = "pull";
	radius = 10;
	v: Point = new Point(0, 0);

  touch: Touch | null = null;
  constructor(id: number, { x, y }: { x: number; y: number }) {
    super(x, y);



    this.id = id;

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

    document.addEventListener("touchend", (e) => {
      if (!this.touch) return;
      if (![...e.touches].find((touch) => touch.identifier === this.touch?.id))
        this.touch = null;
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
			this.v.x *= (1 - friction);
			if (this.v.x < 0.01 && this.v.x > -0.01) this.v.x = 0;
			this.v.y *= (1 - friction);
			if (this.v.y < 0.01 && this.v.y > -0.01) this.v.y = 0;
		} else {
			this.state = "pull";
		}

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

const boundaryGap = 30;
const boundaryWidth = 10;

const render = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // do camera trickery
  ctx.save();

  ctx.scale(1, -1);
  ctx.translate(camera.x - canvas.width / 2, camera.y - (canvas.height / 2) * 3);

  // draw middle line

  for (let i = 0; i < Math.ceil(window.innerHeight / boundaryGap); i += 2) {
    ctx.fillStyle = "#aaaaaa";
    ctx.fillRect(
      canvas.width / 2 - boundaryWidth / 2,
      i * boundaryGap,
      boundaryWidth,
      boundaryGap
    );
  }

  left.render();
  right.render();

  ball.update();
  ball.render();

  ctx.restore();

  requestAnimationFrame(render);
};
requestAnimationFrame(render);
