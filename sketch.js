var song;
var fft;
var particles;
var circleColor, backColor;
var minRadius, maxRadius, waveformRadius;
var angle;


function preload() {
  // song = loadSound('assets/rush.mp3');
  // song = loadSound('assets/gates.mp3');
  song = loadSound('assets/chaconne.mp3');
  // song = loadSound('assets/Everglow.mp3');
}

function setup() {
  // Canvas
  createCanvas(windowWidth, windowHeight);

  // Start with no loop
  noLoop();

  // Angle mode
  angleMode(DEGREES);

  // Init vars
  circleColor = color(255, 232, 147, 255);
  backColor = color(20, 22, 21, 255);
  fft = new p5.FFT();
  minRadius = 150;
  maxRadius = 350;
  waveformRadius = (minRadius + maxRadius) / 2;
  particles = [];
  angle = 0;

  // Glowing effect
  drawingContext.shadowBlur = 32;
  drawingContext.shadowColor = color(255, 231, 170);
}

function draw() {
  // Draw background
  background(backColor);

  // Draw center circle
  fill(circleColor);
  circle(width / 2, height / 2, 10, 10);

  // Draw wave
  noFill();
  stroke(circleColor);

  fft.analyze();
  var amp = fft.getEnergy("lowMid");
  var centroid = fft.getCentroid();
  console.log(centroid);
  var wave = fft.waveform();

  translate(width / 2, height / 2);
  rotate(angle);
  angle += 0.05;

  for (var t = -1; t <= 1; t += 2) {
    beginShape();
    for (var i = 0; i <= 180; i += 0.5) {
      var index = floor(map(i, 0, 180, 0, wave.length - 1));

      var r = map(wave[index], -1, 1, minRadius, maxRadius);

      var x = r * sin(i) * t;
      var y = r * cos(i);

      vertex(x, y);
    }
    endShape();
  }

  // Add new particle
  var p = new Particle();
  particles.push(p);

  // Show particles
  for (var i = particles.length - 1; i >= 0; i--) {
    particles[i].update(amp > 190);

    if (!particles[i].show()) {
      particles.splice(i, 1);
    }
  }
}

function mouseClicked() {
  if (song.isPlaying()) {
    song.pause();
    noLoop();
  } else {
    song.play();
    loop();
  }
}

class Particle {
  constructor() {
    this.pos = p5.Vector.random2D().mult(1);
    this.vel = createVector(0, 0);
    this.acc = this.pos.copy().mult(random(0.001, 0.0001));
    this.width = random(3, 5);
    this.color = color(random(211, 256), random(225, 254), random(118, 190))
  }

  show() {
    noStroke();
    this.color.setAlpha(map(this.pos.dist(createVector()), 0, height / 2, 255, 100));
    fill(this.color);
    ellipse(this.pos.x, this.pos.y, this.width);
    return this.insideScreen();
  }

  insideScreen() {
    return this.pos.x > -height / 2 && this.pos.x < height / 2 &&
      this.pos.y > -height / 2 && this.pos.y < height / 2;
  }

  update(cond) {
    this.vel.add(this.acc);
    this.pos.add(p5.Vector.mult(this.vel, (cond) ? 4 : 1));
  }
}