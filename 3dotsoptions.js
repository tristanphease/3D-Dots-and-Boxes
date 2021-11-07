var optionVars = {x: 3, y: 3, z: 3, numPlayers: 2, rotateButton: 2, clickButton: 0};
var playerVars = {firstPlayer: 0,  playerColours: ["#ff4444", "#4444ff", "#44ff44"]};
var triObjs = [];
var allObjs = [];
var sizeObjs = [];
var buttonObjs = [];
var hoveredTri;
var hoveredButton;
var optionsFirst = true;
var po;
function setupOptions() {
    options = true;
    if (optionsFirst) {
        optionsFirst = false;
    } else {
        resetOptions();
        return 0;
    }
    new SizeChanger(0.1, 0.2, 0.02, "x", "x dots");
    new SizeChanger(0.1, 0.3, 0.02, "y", "y dots");
    new SizeChanger(0.1, 0.4, 0.02, "z", "z dots");
    new SizeChanger(0.4, 0.2, 0.02, "numPlayers", "Number of Players", function(increased) {
        po.makePlayers();
    });
    
    new OptionButton(0.7, 0.1, 0.2, "Menu", function() {
        closeOptions();
        resetMenu();
    });
    new OptionButton(0.7, 0.35, 0.2, "Play", function() {
        closeOptions();
        setupGame();
    });
    
    po = new PlayerOption(0.0, 0.6, 1.0, 0.4);
    
    addOptionsEvents();
    updateOptions();
}

function resetOptions() {
    po.makePlayers();
    addOptionsEvents();
    updateOptions();
}

function updateOptions() {
    if (options) {
        clearCanvas();
        for (var i=0;i<allObjs.length;i++) {
            allObjs[i].draw();
        }
    
        requestAnimationFrame(updateOptions);
    }
}

function optionsMouseDown(e) {
    e.preventDefault();
    if (hoveredTri) {
        hoveredTri.change();
    }
    if (hoveredButton) {
        hoveredButton.onclick();
    }
}

function optionsMouseMove(e) {
    if (hoveredTri) {
        hoveredTri.hovered = false;
        hoveredTri = null;
    }
    for (var i=0;i<triObjs.length;i++) {
        if (triObjs[i].checkInside(e.clientX, e.clientY)) {
            hoveredTri = triObjs[i];
            triObjs[i].hovered = true;
            break;
        }
    }
    if (hoveredButton) {
        hoveredButton.hovered = false;
        hoveredButton = null;
    }
    for (var i=0;i<buttonObjs.length;i++) {
        if (buttonObjs[i].checkInside(e.clientX, e.clientY)) {
            hoveredButton = buttonObjs[i];
            buttonObjs[i].hovered = true;
            break;
        }
    }
}

function optionsResize() {
    canvas2d.width = window.innerWidth;
    canvas2d.height = window.innerHeight;
        
    for (var i=0;i<sizeObjs.length;i++) {
        sizeObjs[i].calculatePos();
        sizeObjs[i].calculateTris();
    }
    for (var i=0;i<buttonObjs.length;i++) {
        buttonObjs[i].calculatePos();
    }
    po.calculatePos();
    po.makePlayers();
    for (var i=0;i<po.players.length;i++) {
        po.players[i].placeInputs();
    }
}

function addOptionsEvents() {
    document.addEventListener('mousemove', optionsMouseMove);
    document.addEventListener('mousedown', optionsMouseDown);
    window.addEventListener('resize', optionsResize);
}

function removeOptionsEvents() {
    document.removeEventListener('mousemove', optionsMouseMove);
    document.removeEventListener('mousedown', optionsMouseDown);
    window.removeEventListener('resize', optionsResize);
}

function closeOptions() {
    options = false;
    removeOptionsEvents();
    clearCanvas();
    for (var i=0;i<po.players.length;i++) {
        if (po.players[i].visible) {
            po.players[i].changeVisibility();
        }
    }
    hoveredButton.hovered = false;
    hoveredButton = null;
}

function OptionButton(x, y, size, text, onclick) {
    this.xRatio = x;
    this.yRatio = y;
    this.sizeRatio = size;
    this.text = text;
    this.hovered = false;
    this.onclick = onclick;
    this.calculatePos = function() {
        this.x = this.xRatio*window.innerWidth;
        this.y = this.yRatio*window.innerHeight;
        this.size = this.sizeRatio*window.innerWidth;
    }
    this.calculatePos();
    this.draw = function() {
        ctx2d.fillStyle = "#000000";
        ctx2d.beginPath();
        ctx2d.rect(this.x, this.y, this.size, this.size/2);
        if (this.hovered) {
            ctx2d.fill();
            ctx2d.fillStyle = "#FFFFFF";
        }
        ctx2d.stroke();
        ctx2d.closePath();
        ctx2d.font = this.size/4 + "px Arial";
        var width = ctx2d.measureText(this.text).width;
        ctx2d.fillText(this.text, this.x+this.size/2-width/2, this.y+this.size/4+this.size/12);
        ctx2d.fillStyle = "#000000";
    }
    this.checkInside = function(mouseX, mouseY) {
        if (mouseX >= this.x && mouseX <= this.x + this.size &&
            mouseY >= this.y && mouseY <= this.y + this.size/2) {
            
            return true;
        }
        return false;
    } 
    buttonObjs.push(this);
    allObjs.push(this);
}

//handles colours, who goes first
function PlayerOption(x, y, sizeX, sizeY) {
    this.xRatio = x;
    this.yRatio = y;
    this.sizeXRatio = sizeX;
    this.sizeYRatio = sizeY;
    this.calculatePos = function() {
        this.x = this.xRatio*window.innerWidth;
        this.y = this.yRatio*window.innerHeight;
        this.sizeX = this.sizeXRatio*window.innerWidth;
        this.sizeY = this.sizeYRatio*window.innerHeight;
    }
    this.calculatePos();
    this.draw = function() {
        ctx2d.beginPath();
        //ctx2d.rect(this.x, this.y, this.size, this.size/2);
        ctx2d.stroke();
        ctx2d.closePath();
    }
    this.players = [];
    this.makePlayers = function() {
        for (var i=0;i<optionVars.numPlayers;i++) {
            var sizeX = this.sizeX/optionVars.numPlayers;
            var sizeY = this.sizeY;
            if (this.players[i]) {
                this.players[i].x = this.x+i*sizeX;
                this.players[i].y = this.y;
                this.players[i].sizeX = sizeX;
                this.players[i].sizeY = sizeY;
                this.players[i].index = i;
                this.players[i].placeInputs();
                if (this.players[i].visible == false) {
                    this.players[i].changeVisibility();
                }
            } else {
                this.players.push(new Player(this.x+i*sizeX, this.y, sizeX, sizeY, this, i));
            }
        }
        for (;i<this.players.length;i++) {
            if (this.players[i].visible == true) {
                if (this.players[i].firstInput.checked) {
                    playerVars.firstPlayer = 0;
                    this.players[0].firstInput.checked = true;
                }
                this.players[i].changeVisibility();
            }
        }
    }
    this.makePlayers();
    allObjs.push(this);
}

function Player(x, y, sizeX, sizeY, obj, index) {
    this.x = x;
    this.y = y;
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.obj = obj;
    this.index = index;
    this.visible = true;
    this.colorInput = document.createElement("INPUT");
    this.colorInput.type = "color";
    var self = this;
    this.colorInput.oninput = function(e) {
        //self is player, this is colorinput
        playerVars.playerColours[self.index] = this.value;
    }
    if (playerVars.playerColours[this.index]) {
        this.colorInput.value = playerVars.playerColours[this.index];
    } else {
        this.colorInput.value = "#FFFFFF";
        playerVars.playerColours.push("#FFFFFF");
    }
    
    this.firstInput = document.createElement("INPUT");
    this.firstInput.type = "radio";
    this.firstInput.value = index;
    this.firstInput.name = "first";
    this.firstInput.className = "radioInput";
    if (index == 0) {
        this.firstInput.checked = true;
    }
    this.firstInput.onchange = function() {
        playerVars.firstPlayer = self.index;
    }
    document.body.appendChild(this.colorInput);
    document.body.appendChild(this.firstInput);
    this.placeInputs = function() {
        this.colorInput.style.left = (this.x+this.sizeX*2/5) + "px";
        this.colorInput.style.top = (this.y+this.sizeY*9/20-this.sizeY/9) + "px";
        this.firstInput.style.left = (this.x+this.sizeX*2/5) + "px";
        this.firstInput.style.top = (this.y+this.sizeY*4/5-this.sizeY/8) + "px";
        this.firstInput.style.width = this.sizeX/8 + "px";
        this.firstInput.style.height = this.sizeY/8 + "px";
    }
    this.close = function() {
        document.body.removeChild(this.colorInput);
    }
    this.placeInputs();
    this.draw = function() {
        if (this.visible) {
            ctx2d.font = (this.sizeX/10) + "px Arial";
            var width = ctx2d.measureText("Player " + (index+1)).width;
            ctx2d.fillText("Player " + (index+1), this.x+this.sizeX/2-width/2, this.y+this.sizeX/10);
            ctx2d.fillText("Colour: ", this.x, this.y+this.sizeY*9/20);
            ctx2d.fillText("First: ", this.x, this.y+this.sizeY*4/5);
            ctx2d.beginPath();
            ctx2d.rect(this.x, this.y, this.sizeX, this.sizeY);
            ctx2d.stroke();
            ctx2d.closePath();
        }
    }
    this.changeVisibility = function() {
        this.visible = !this.visible;
        if (!this.visible) {
            this.colorInput.style.display = "none";
            this.firstInput.style.display = "none";
        } else {
            this.colorInput.style.display = "block";
            this.firstInput.style.display = "block";
        }
    }
    allObjs.push(this);
}

function SizeChanger(x, y, size, option, label, onchange) {
    this.xRatio = x;
    this.yRatio = y;
    this.min = 2;
    this.max = 9;
    this.sizeRatio = size;
    this.hovered = false;
    this.option = option;
    this.label = label;
    this.onchange = onchange;
    this.calculateTris = function() {
        this.leftTri.x = this.x-this.size;
        this.leftTri.y = this.y;
        this.leftTri.size = this.size;
        this.rightTri.x = this.x+this.size;
        this.rightTri.y = this.y;
        this.rightTri.size = this.size;
    }
    this.calculatePos = function() {
        this.x = this.xRatio*window.innerWidth;
        this.y = this.yRatio*window.innerHeight;
        this.size = this.sizeRatio*window.innerWidth;
    }
    this.calculatePos();
    this.draw = function() {
        ctx2d.fillStyle = "#000000";
        ctx2d.font = this.size + "px Arial";
        ctx2d.fillText(optionVars[this.option], this.x-this.size/4, this.y+this.size/4);
        ctx2d.fillText(this.label + ":", this.x-2.5*this.size, this.y - this.size);
    }
    this.leftTri = new Triangle(this.x-this.size, this.y, this.size, "left", this);
    this.rightTri = new Triangle(this.x+this.size, this.y, this.size, "right", this);
    allObjs.push(this);
    sizeObjs.push(this);
}

function Triangle(x, y, size, dir, obj) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.dir = dir;
    this.obj = obj;
    this.hovered = false;
    this.draw = function() {
        var side = 1;
        if (this.dir == "left") {
            side = 1;
        } else if (this.dir == "right") {
            side = -1;
        }
        ctx2d.fillStyle = "#000000";
        if (this.hovered == true) {
            ctx2d.fillStyle = "#A85FF9";
        }
        ctx2d.beginPath();
        ctx2d.moveTo(this.x + side * this.size/2, this.y - this.size/2);
        ctx2d.lineTo(this.x + side * this.size/2, this.y + this.size/2);
        ctx2d.lineTo(this.x - side * this.size/2, this.y);
        ctx2d.lineTo(this.x + side * this.size/2, this.y - this.size/2);
        ctx2d.fill();
        ctx2d.stroke();
        ctx2d.closePath();
    }
    this.change = function() {
        if (this.dir == "left") {
            if (optionVars[this.obj.option] > this.obj.min) {
                optionVars[this.obj.option] -= 1;
                if (this.obj.onchange) {
                    this.obj.onchange(false);
                }
            }
        }
        if (this.dir == "right") {
            if (optionVars[this.obj.option] < this.obj.max) {
                optionVars[this.obj.option] += 1;
                if (this.obj.onchange) {
                    this.obj.onchange(true);
                }
            }
        }
    }
    this.checkInside = function(mouseX, mouseY) {
        if (this.dir == "right") {
            if (mouseX >= this.x - this.size/2 &&
                mouseY >= this.y + (mouseX - this.x - this.size/2)/2 &&
                mouseY <= this.y + (mouseX - this.x - this.size/2)/-2) {
                
                return true;
            }
        }
        if (this.dir == "left") {
            if (mouseX <= this.x + this.size/2 &&
                mouseY >= this.y - (mouseX - this.x + this.size/2)/2 &&
                mouseY <= this.y - (mouseX - this.x + this.size/2)/-2) {
                
                return true;
            }
        }
        return false;
    }
    triObjs.push(this);
    allObjs.push(this);
}