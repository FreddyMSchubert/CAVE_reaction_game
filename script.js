document.addEventListener('DOMContentLoaded', () => {
	console.log('Document is ready! js is working!');
});

const fireworksOverlay = document.querySelector("#fireworks");
const burstOptions = {
  autoresize: true,
  opacity: 0.5,
  acceleration: 1,
  friction: 0.97,
  gravity: 1.5,
  particles: 50,
  traceLength: 3,
  traceSpeed: 10,
  explosion: 5,
  intensity: 30,
  flickering: 50,
  lineStyle: "round",
  hue: { min: 0, max: 360 },
  delay: { min: 30, max: 60 },
  rocketsPoint: { min: 50, max: 50 },
  lineWidth: {
    explosion: { min: 1, max: 3 },
    trace: { min: 1, max: 2 },
  },
  brightness: { min: 50, max: 80 },
  decay: { min: 0.015, max: 0.03 },
  mouse: { click: false, move: false, max: 1 },
};

function fireworkAt(x, y) {
  const size = 320;

  const burst = document.createElement("div");
  burst.style.position = "fixed";
  burst.style.left = `${x - size / 2}px`;
  burst.style.top = `${y - size / 2}px`;
  burst.style.width = `${size}px`;
  burst.style.height = `${size}px`;
  burst.style.pointerEvents = "none";

  fireworksOverlay.appendChild(burst);

  const FW = window.Fireworks?.default ?? window.Fireworks;
  const fx = new FW(burst, burstOptions);

  fx.start();
  fx.launch(1);

  setTimeout(() => {
    fx.stop(true);
    burst.remove();
  }, 2500);
}

const canvas = document.getElementById('gameCanvas');

const Colors = Object.freeze({
	RED:   Symbol("red"),
	BLUE:  Symbol("blue"),
	GREEN: Symbol("green"),
	YELLOW: Symbol("yellow"),
	PURPLE: Symbol("purple"),
});
const Shapes = Object.freeze({
	CIRCLE:    Symbol("circle"),
	SQUARE:    Symbol("square"),
	TRIANGLE:  Symbol("triangle"),
	DIAMOND:  Symbol("diamond"),
	HEART:   Symbol("heart"),
	STAR:	Symbol("star"),
	BANANA:	Symbol("banana"),
	CROSS:	Symbol("cross"),
});

function getRandomColor() {
	const colorValues = Object.values(Colors);
	const randomIndex = Math.floor(Math.random() * colorValues.length);
	return colorValues[randomIndex];
}
function getRandomShape() {
	const shapeValues = Object.values(Shapes);
	const randomIndex = Math.floor(Math.random() * shapeValues.length);
	return shapeValues[randomIndex];
}

let shapesArray = [];
for (let i = 0; i < 40; i++) {
	let newShape = {
		color: getRandomColor(),
		shape: getRandomShape()
	};
	if (shapesArray.some(s => s.color === newShape.color && s.shape === newShape.shape)) {
		i--;
		continue;
	}
	shapesArray.push(newShape);
}

let team1Shape = null;
let team2Shape = null;
let team1Score = 0;
let team2Score = 0;
function pickShapeForTeam(team) {
	let chosenShape;
	do {
		const randomIndex = Math.floor(Math.random() * shapesArray.length);
		chosenShape = shapesArray[randomIndex];
	} while ((team === 1 && team2Shape && chosenShape.color === team2Shape.color && chosenShape.shape === team2Shape.shape) ||
	         (team === 2 && team1Shape && chosenShape.color === team1Shape.color && chosenShape.shape === team1Shape.shape));
	if (team === 1) {
		team1Shape = chosenShape;
		document.getElementById('team1targetshape').innerText = `${chosenShape.color.description} ${chosenShape.shape.description}`;
	} else {
		team2Shape = chosenShape;
		document.getElementById('team2targetshape').innerText = `${chosenShape.color.description} ${chosenShape.shape.description}`;
	}
}
pickShapeForTeam(1);
pickShapeForTeam(2);

function objectClicked(event, color, shape) {
	const img = event.currentTarget;
	const rect = img.getBoundingClientRect();
	const cx = rect.left + rect.width / 2;
	const cy = rect.top + rect.height / 2;

	if (team1Shape && color === team1Shape.color.description && shape === team1Shape.shape.description) {
		team1Score++;
		fireworkAt(cx, cy); // 🎆 boom at that shape
		pickShapeForTeam(1);
		new Audio('https://minecraft.wiki/images/Firework_twinkle.ogg?fbf09&format=original').play();
	} else if (team2Shape && color === team2Shape.color.description && shape === team2Shape.shape.description) {
		team2Score++;
		fireworkAt(cx, cy); // 🎆 boom at that shape
		pickShapeForTeam(2);
		new Audio('https://minecraft.wiki/images/Firework_launch.ogg?b8551&format=original').play();
	} else {
		new Audio('./assets/sfx/classic_hurt.mp3').play();
	}
}

let prevPositions = [];
shapesArray.forEach(s => {
	// add the shapes
	let path = "";
	switch (s.shape) {
		case Shapes.CIRCLE: path = "./assets/shapes/circle.png"; break;
		case Shapes.SQUARE: path = "./assets/shapes/square.png"; break;
		case Shapes.TRIANGLE: path = "./assets/shapes/triangle.png"; break;
		case Shapes.DIAMOND: path = "./assets/shapes/diamond.png"; break;
		case Shapes.HEART: path = "./assets/shapes/heart.png"; break;
		case Shapes.STAR: path = "./assets/shapes/star.png"; break;
		case Shapes.BANANA: path = "./assets/shapes/banana.png"; break;
		case Shapes.CROSS: path = "./assets/shapes/cross.png"; break;
		default: path = "./assets/shapes/default.png"; break;
	};
	let randomSize = Math.floor(Math.random() * 50) + 30; // size between 30 and 80
	let randomPosX, randomPosY;
	do {
	randomPosX = Math.floor(Math.random() * (window.innerWidth - randomSize));
	randomPosY = Math.floor(Math.random() * (window.innerHeight / 2)) + (window.innerHeight / 2) - randomSize;
	} while (prevPositions.some(pos => Math.abs(pos.x - randomPosX) < 80 && Math.abs(pos.y - randomPosY) < 80));
	prevPositions.push({x: randomPosX, y: randomPosY});

	const randomRotation = Math.floor(Math.random() * 360); // 0..359
	canvas.insertAdjacentHTML(
		"beforeend",
		`<img src="${path}"
				class="shape-image shape-${s.color.description}"
				style="width:${randomSize}px; height:${randomSize}px; left:${randomPosX}px; top:${randomPosY}px;
					transform: rotate(${randomRotation}deg);"
				onclick="objectClicked(event, '${s.color.description}', '${s.shape.description}')"
		/>`
	);
});

// ---------------- TIMER (COUNTDOWN) ----------------
let timeLeft = 60; // seconds
let gameOver = false;

function formatTime(seconds) {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function bigExplosion() {
	// center of screen
	const cx = window.innerWidth / 2;
	const cy = window.innerHeight / 2;

	// multiple bursts around center
	for (let i = 0; i < 12; i++) {
		const angle = (Math.PI * 2 * i) / 12;
		const radius = 180;

		const x = cx + Math.cos(angle) * radius;
		const y = cy + Math.sin(angle) * radius;

		fireworkAt(x, y);
	}

	// a few extra right in the middle
	for (let i = 0; i < 6; i++) {
		setTimeout(() => fireworkAt(cx, cy), i * 120);
	}
}

function endGame() {
	gameOver = true;

	if (team1Score != team2Score)
		bigExplosion();

	let result;
	if (team1Score > team2Score) result = `Team 1 wins! 🥇 (${team1Score} : ${team2Score})`;
	else if (team2Score > team1Score) result = `Team 2 wins! 🥇 (${team2Score} : ${team1Score})`;
	else result = `It's a tie! 🤝 (${team1Score} : ${team2Score})`;

	setTimeout(() => {
		alert(`Time's up!\n\n${result}`);
		window.location.reload();
	}, 2500);
}

// update UI once immediately
document.getElementById("timer").innerText = `Time: ${formatTime(timeLeft)}`;
document.getElementById("team1score").innerText = `${team1Score}`;
document.getElementById("team2score").innerText = `${team2Score}`;

const countdownInterval = setInterval(() => {
	if (gameOver) return;

	timeLeft--;
	document.getElementById("timer").innerText = `Time: ${formatTime(timeLeft)}`;
	document.getElementById("team1score").innerText = `${team1Score}`;
	document.getElementById("team2score").innerText = `${team2Score}`;

	if (timeLeft <= 0) {
		clearInterval(countdownInterval);
		document.getElementById("timer").innerText = `Time: 00:00`;
		endGame();
	}
}, 1000);
