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

//get random int [min, max)
function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

//simple
function getSimpleMove() {
	//if can make a cube, do so otherwise random
	let almostCompletedCubes = [];
	for (let i=0;i<cubes.length;i++) {
		let unmarked = 0;
		for (let j=0;j<cubes[i].length;j++) {
			if (lines[cubes[i][j]].status === -1) {
				unmarked += 1;
				if (unmarked > 1) {
					break;
				}
			}
		}
		if (unmarked === 1) {
			almostCompletedCubes.push(cubes[i]);
		}
	}

	if (almostCompletedCubes.length === 0) {
		getRandomMove();
	} else {
		let cube = almostCompletedCubes[getRandomInt(0, almostCompletedCubes.length)];
		for (let lineIndex of cube) {
			let line = lines[lineIndex];
			if (line.status === -1) {
				setLine(line);
				break;
			}
		}
	}
}