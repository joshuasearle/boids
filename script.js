// Constants
const MILLISECONDS_IN_SECOND = 1000;
const TICK_RATE = 60;
let vision = document.getElementById('vision').value;
const defaultNoise = 5;
let noise = (document.getElementById('noise').value / 100) * defaultNoise;
let maxSpeed = document.getElementById('speed').value;
const maxSeparation = 15000;
let separationFactor = document.getElementById('separation').value;
const MAX_ACC = 3;
const maxAlignment = 0.2;
let alignmentFactor = document.getElementById('alignment').value;
const maxCohesion = 0.05;
let cohesionFactor = document.getElementById('cohesion').value;

// HTML Elements
const arena = document.querySelector('.arena');
const header = document.querySelector('header');
const boidAdder = document.getElementById('boid-adder');
const barrierAdder = document.getElementById('barrier-adder');
const droidAdder = document.getElementById('droid-adder');
const boid10Adder = document.getElementById('boid-adder10');

// Event listeners
boidAdder.addEventListener('click', () => {
  boidAddingMode = !boidAddingMode;
  if (boidAddingMode) boidAdder.classList.add('selected');
  else boidAdder.classList.remove('selected');
  barrierAddingMode = false;
  driodAddingMode = false;
  boidAdding10Mode = false;
  barrierAdder.classList.remove('selected');
  droidAdder.classList.remove('selected');
  boid10Adder.classList.remove('selected');
});

barrierAdder.addEventListener('click', () => {
  barrierAddingMode = !barrierAddingMode;
  if (barrierAddingMode) barrierAdder.classList.add('selected');
  else barrierAdder.classList.remove('selected');
  boidAddingMode = false;
  driodAddingMode = false;
  boidAdding10Mode = false;
  boidAdder.classList.remove('selected');
  droidAdder.classList.remove('selected');
  boid10Adder.classList.remove('selected');
});

droidAdder.addEventListener('click', () => {
  driodAddingMode = !driodAddingMode;
  if (driodAddingMode) droidAdder.classList.add('selected');
  else droidAdder.classList.remove('selected');
  boidAddingMode = false;
  barrierAddingMode = false;
  boidAdding10Mode = false;
  boidAdder.classList.remove('selected');
  barrierAdder.classList.remove('selected');
  boid10Adder.classList.remove('selected');
});

boid10Adder.addEventListener('click', () => {
  boidAdding10Mode = !boidAdding10Mode;
  if (boidAdding10Mode) boid10Adder.classList.add('selected');
  else boid10Adder.classList.remove('selected');
  boidAddingMode = false;
  barrierAddingMode = false;
  driodAddingMode = false;
  boidAdder.classList.remove('selected');
  barrierAdder.classList.remove('selected');
  droidAdder.classList.remove('selected');
});

arena.addEventListener('click', (e) => {
  if (!boidAddingMode) return;
  boids.push(
    new Boid(
      new Vector(+e.clientX, +e.clientY - header.offsetHeight),
      Vector.fromAngleMag(randomAngle(), maxSpeed)
    )
  );
});

arena.addEventListener('click', (e) => {
  if (!boidAdding10Mode) return;
  for (let i = 0; i < 10; i++) {
    boids.push(
      new Boid(
        new Vector(+e.clientX, +e.clientY - header.offsetHeight),
        Vector.fromAngleMag(randomAngle(), maxSpeed)
      )
    );
  }
});

arena.addEventListener('click', (e) => {
  if (!driodAddingMode) return;
  droids.push(
    new Droid(
      new Vector(+e.clientX, +e.clientY - header.offsetHeight),
      Vector.fromAngleMag(randomAngle(), maxSpeed)
    )
  );
});

arena.addEventListener('click', (e) => {
  if (!barrierAddingMode) return;
  const x = +e.clientX;
  const y = +e.clientY - header.offsetHeight;
  barriers.push(new Vector(x, y));
  const barrierDiv = document.createElement('div');
  arena.appendChild(barrierDiv);
  barrierDiv.classList.add('barrier');
  barrierDiv.style.left = `${x}px`;
  barrierDiv.style.top = `${y}px`;
});

document.getElementById('vision').addEventListener('input', (e) => {
  vision = e.target.value;
});

document.getElementById('noise').addEventListener('input', (e) => {
  noise = (e.target.value / 100) * defaultNoise;
});

document.getElementById('speed').addEventListener('input', (e) => {
  maxSpeed = e.target.value;
});

document.getElementById('separation').addEventListener('input', (e) => {
  separationFactor = e.target.value;
});

document.getElementById('alignment').addEventListener('input', (e) => {
  alignmentFactor = e.target.value;
});

document.getElementById('cohesion').addEventListener('input', (e) => {
  cohesionFactor = e.target.value;
});

// Globals
let nextBoidId = 0;
const boids = [];
const barriers = [];
const droids = [];
let boidAddingMode = true;
let barrierAddingMode = false;
let driodAddingMode = false;
let boidAdding10Mode = false;

// Random Angle
const randomAngle = () => {
  return Math.floor(Math.random() * 360);
};

// Arena Query
const getArenaWidth = () => {
  return arena.offsetWidth;
};

const getArenaHeight = () => {
  return arena.offsetHeight;
};

// Rules
const avoidWalls = (boid) => {
  const vector = new Vector(0, 0);
  const avoidanceFactor = 50;

  // We travel the direction opposite to the wall
  // The magnitude of the vector gets greater the closer you are to the wall, maxing out at 1
  if (boid.pos.x < vision) {
    const dist = boid.pos.x;
    const denom = dist <= 10 ? 0.1 : dist;
    vector.add(new Vector(avoidanceFactor / denom, 0));
  }
  if (boid.pos.y < vision) {
    const dist = boid.pos.y;
    const denom = dist <= 10 ? 0.1 : dist;
    vector.add(new Vector(0, avoidanceFactor / denom));
  }
  if (getArenaWidth() - boid.pos.x < vision) {
    const dist = getArenaWidth() - boid.pos.x;
    const denom = dist <= 30 ? 0.1 : dist;
    vector.add(new Vector(-avoidanceFactor / denom, 0));
  }
  if (getArenaHeight() - boid.pos.y < vision) {
    const dist = getArenaHeight() - boid.pos.y;
    const denom = dist <= 30 ? 0.1 : dist;
    vector.add(new Vector(0, -avoidanceFactor / denom));
  }

  return vector;
};

const avoidBarriers = (boid, barriers) => {
  const avoidanceFactor = 20;
  const vector = new Vector(0, 0);
  if (barriers.length === 0) return new Vector(0, 0);
  for (barrier of barriers) {
    const diff = Vector.sub(boid.pos, barrier);
    const dist = Vector.dist(boid.pos, barrier);
    const denom = dist <= 15 ? 0.1 : dist;
    diff.scale(avoidanceFactor / denom);
    vector.add(diff);
  }
  if (vector.magnitude > MAX_ACC) {
    vector.scale(MAX_ACC);
  }
  return vector;
};

const avoidDroids = (boid, droids) => {
  const vector = new Vector(0, 0);
  if (droids.length === 0) return vector;
  for (droid of droids) {
    vector.add(Vector.sub(boid.pos, droid.pos));
  }
  vector.div(50);
  return vector;
};

const separation = (boid, neighbours) => {
  if (neighbours.length === 0) return new Vector(0, 0);
  const vector = new Vector(0, 0);
  for (neighbour of neighbours) {
    const dist = Vector.dist(boid.pos, neighbour.pos);
    if (dist > vision) continue;
    const diff = Vector.sub(boid.pos, neighbour.pos);
    vector.add(Vector.mult(diff, vision - dist));
  }
  vector.div(maxSeparation * ((100 - separationFactor) / 100));
  return vector;
};

const alignment = (boid, neighbours) => {
  if (neighbours.length === 0) return new Vector(0, 0);
  const vector = new Vector(0, 0);
  for (neighbour of neighbours) {
    vector.add(neighbour.vel);
  }
  vector.div(neighbours.length);
  vector.sub(boid.vel);
  vector.mult((alignmentFactor / 100) * maxAlignment);
  return vector;
};

const cohesion = (boid, neighbours) => {
  if (neighbours.length === 0) return new Vector(0, 0);
  const vector = new Vector(0, 0);
  for (neighbour of neighbours) {
    vector.add(neighbour.pos);
  }
  vector.div(neighbours.length);
  vector.sub(boid.pos);
  vector.mult((cohesionFactor / 100) * maxCohesion);
  return vector;
};

const noiseAcc = () => {
  return new Vector(
    Math.random() * noise - noise / 2,
    Math.random() * noise - noise / 2
  );
};

// Types
class Vector {
  x = null;
  y = null;

  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  get angle() {
    // Avoid point case
    if (this.magnitude === 0) return 0;
    // Inverse tangent
    const radians = Math.atan2(this.x, this.y);
    // Radians to degrees formula
    const degrees = radians * (180 / Math.PI);
    return degrees;
  }

  get magnitude() {
    // Pythag theorem
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }

  add(otherVector) {
    this.x += otherVector.x;
    this.y += otherVector.y;
  }

  sub(otherVector) {
    this.x -= otherVector.x;
    this.y -= otherVector.y;
  }

  mult(scalar) {
    this.x *= scalar;
    this.y *= scalar;
  }

  div(scalar) {
    if (scalar === 0) return;
    this.x /= scalar;
    this.y /= scalar;
  }

  scale(newMagnitude) {
    this.x *= newMagnitude / this.magnitude;
    this.y *= newMagnitude / this.magnitude;
  }

  static add(vector, otherVector) {
    return new Vector(vector.x + otherVector.x, vector.y + otherVector.y);
  }

  static sub(vector, otherVector) {
    return new Vector(vector.x - otherVector.x, vector.y - otherVector.y);
  }

  static dist(vector, otherVector) {
    const diff = Vector.sub(vector, otherVector);
    return diff.magnitude;
  }

  static div(vector, scalar) {
    if (scalar === 0) return new Vector(0, 0);
    return new Vector(vector.x / scalar, vector.y / scalar);
  }

  static mult(vector, scalar) {
    return new Vector(vector.x * scalar, vector.y * scalar);
  }

  static fromAngleMag(angle, magnitude) {
    const x = magnitude * Math.sin(angle * (Math.PI / 180));
    const y = magnitude * Math.cos(angle * (Math.PI / 180));
    return new Vector(x, y);
  }
}

class Mover {
  visionMultiplier = null;
  pos = null;
  vel = null;
  id = null;

  constructor(pos, vel) {
    this.pos = pos;
    this.vel = vel;
    this.id = String(nextBoidId++);
  }

  nearBoids(boids) {
    return boids.filter((otherBoid) => {
      if (otherBoid.id === this.id) return false;
      const dist = Vector.dist(this.pos, otherBoid.pos);
      return dist <= vision * this.visionMultiplier;
    });
  }

  nearDroids(droids) {
    return droids.filter((droid) => {
      if (droid.id === this.id) return false;
      const dist = Vector.dist(this.pos, droid.pos);
      return dist <= vision * this.visionMultiplier;
    });
  }

  nearBarriers(barriers) {
    return barriers.filter((barrier) => {
      const dist = Vector.dist(this.pos, barrier);
      return dist <= vision * this.visionMultiplier;
    });
  }

  move() {}

  render() {}
}

class Boid extends Mover {
  speedMutiplier = 1;
  visionMultiplier = 1;

  constructor(pos, vel) {
    super(pos, vel);
  }

  move() {
    // Find boids within vision
    const neighbours = this.nearBoids(boids);
    const barrierNeighbours = this.nearBarriers(barriers);
    const droidNeighbours = this.nearDroids(droids);

    // Apply rules
    const barrierAvoidanceVector = avoidBarriers(this, barrierNeighbours);
    const wallAvoidanceVector = avoidWalls(this);
    const separationVector = separation(this, neighbours);
    const alignmentVector = alignment(this, neighbours);
    const cohesionVector = cohesion(this, neighbours);
    const noiseVector = noiseAcc();
    const droidAvoidanceVector = avoidDroids(this, droidNeighbours);

    // Adjust velocity, based on the rules
    this.vel.add(barrierAvoidanceVector);
    this.vel.add(wallAvoidanceVector);
    this.vel.add(separationVector);
    this.vel.add(alignmentVector);
    this.vel.add(cohesionVector);
    this.vel.add(noiseVector);
    this.vel.add(droidAvoidanceVector);

    // Limit velocity
    if (this.vel.magnitude > maxSpeed * this.speedMutiplier)
      this.vel.scale(maxSpeed * this.speedMutiplier);

    // Set min velocity
    if (this.vel.magnitude < maxSpeed / 5)
      this.vel.scale((maxSpeed * this.speedMutiplier) / 5);

    // Move the boid, according to the velocity
    this.pos.add(this.vel);
  }

  render() {
    // Either get the element, or create one if did not exist
    const div = document.getElementById(this.id) || createBoidDiv(this.id);
    // Update position and rotation
    div.style.left = `${this.pos.x}px`;
    div.style.top = `${this.pos.y}px`;
    div.style.transform = `rotate(${180 - this.vel.angle}deg)`;
  }
}

class Droid extends Mover {
  speedMutiplier = 0.3;
  visionMultiplier = 3;

  constructor(pos, vel) {
    super(pos, vel);
  }

  move() {
    // Find boids within vision
    const neighbours = this.nearBoids(boids);
    const barrierNeighbours = this.nearBarriers(barriers);

    // Apply rules
    const barrierAvoidanceVector = avoidBarriers(this, barrierNeighbours);
    const wallAvoidanceVector = avoidWalls(this);
    const noiseVector = noiseAcc();
    const cohesionVector = cohesion(this, neighbours);
    const separationVector = separation(this, droids);

    separationVector.mult(5);
    barrierAvoidanceVector.mult(2);
    noiseVector.div(5);

    // Adjust velocity, based on the rules
    this.vel.add(barrierAvoidanceVector);
    this.vel.add(wallAvoidanceVector);
    this.vel.add(noiseVector);
    this.vel.add(cohesionVector);
    this.vel.add(separationVector);

    // Limit velocity
    if (this.vel.magnitude > maxSpeed * this.speedMutiplier)
      this.vel.scale(maxSpeed * this.speedMutiplier);

    // // Set min velocity
    // if (this.vel.magnitude < maxSpeed / 5) this.vel.scale(maxSpeed / 5);

    // Move the boid, according to the velocity
    this.pos.add(this.vel);
  }

  render() {
    // Either get the element, or create one if did not exist
    const div = document.getElementById(this.id) || createDroidDiv(this.id);
    // Update position and rotation
    div.style.left = `${this.pos.x}px`;
    div.style.top = `${this.pos.y}px`;
    div.style.transform = `rotate(${180 - this.vel.angle}deg)`;
  }
}

const createBoidDiv = (id) => {
  const boidDiv = document.createElement('div');
  boidDiv.classList.add('boid');
  boidDiv.id = id;
  arena.appendChild(boidDiv);
  return boidDiv;
};

const createDroidDiv = (id) => {
  const droidDiv = document.createElement('div');
  droidDiv.classList.add('droid');
  droidDiv.id = id;
  arena.appendChild(droidDiv);
  return droidDiv;
};

const renderBoids = () => {
  boids.forEach((boid) => boid.render());
  droids.forEach((droid) => droid.render());
};

const moveBoids = () => {
  boids.forEach((boid) => boid.move());
  droids.forEach((droid) => droid.move());
};

// Main function
const main = () => {
  const msPerFrame = MILLISECONDS_IN_SECOND / TICK_RATE;
  setInterval(() => {
    renderBoids();
    moveBoids();
  }, msPerFrame);
};

// Start loop
main();
