//basic AI for playing 3dots

//random
function getRandomMove() {
	let lineVal = lines[getRandomInt(0, lines.length)];
	if (lineVal.status == -1) {
		setLine(lineVal);
	} else {
		getRandomMove();
	}
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

//simple
function getSimpleMove() {
	//if can make a cube, do so otherwise random
	for (let i=0;i<cubes.length;i++) {
		
	}
}