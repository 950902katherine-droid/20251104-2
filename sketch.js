let minSide;
let objs = [];
let colors = ['#ed3441', '#ffd630', '#329fe3', '#08AC7E', '#DED9DF', '#FE4D03'];
let menuWidth; // 選單寬度
let mainCanvas; // 主畫布區域
let tkuText; // 淡江大學文字物件
let centerBox; // 中心方格物件

// 在全域變數區域添加選單狀態變數
let menuVisible = false;
let menuX = -250; // 選單起始位置在畫面外

function setup() {
    // 建立全螢幕畫布
    createCanvas(windowWidth, windowHeight);
    menuWidth = windowHeight / 4; // 設定選單寬度為螢幕高度的1/4
    minSide = min(width-menuWidth, height); // 更新minSide計算
    rectMode(CENTER);
    
    // 初始化淡江大學文字動畫
    tkuText = new TKUText();
    // 初始化中心方格
    centerBox = new CenterBox();
}

function draw() {
    // 移除原本的選單繪製程式碼
    background(0);
    
    // 主要動畫
    for (let i of objs) {
        i.run();
    }

    for (let i = 0; i < objs.length; i++) {
        if (objs[i].isDead) {
            objs.splice(i, 1);
        }
    }

    if (frameCount % (random([10, 60, 120])) == 0) {
        addObjs();
    }

    // 先繪製方格
    centerBox.display();
    // 再繪製文字，確保在方格上方
    tkuText.display();
    
    // 繪製動態選單
    drawMenu();
}

// 新增選單繪製函數
function drawMenu() {
    // 檢查滑鼠是否在左側區域
    if (mouseX < 100) {
        menuX = lerp(menuX, 0, 0.1); // 滑動顯示選單
    } else {
        menuX = lerp(menuX, -250, 0.1); // 滑動隱藏選單
    }

    push();
    translate(menuX, 0);
    // 繪製選單背景
    fill(30, 200); // 半透明深色背景
    noStroke();
    rect(0, 0, 250, height);

    // 選單內容
    fill(255);
    textSize(16);
    textAlign(LEFT, TOP);
    text("選單區域", 20, 20);
    
    // 這裡可以添加更多選單項目
    text("選項 1", 20, 60);
    text("選項 2", 20, 90);
    text("選項 3", 20, 120);
    pop();
}

// 修改addObjs函數，確保物件在正確的位置生成
function addObjs() {
    // 調整x座標範圍，考慮選單寬度
    let x = random(-0.1, 1.1) * (width-menuWidth) + menuWidth;
    let y = random(-0.1, 1.1) * height;
    
    for (let i = 0; i < 20; i++) {
        objs.push(new Orb(x, y));
    }

    for (let i = 0; i < 50; i++) {
        objs.push(new Sparkle(x, y));
    }
    
    for (let i = 0; i < 2; i++) {
        objs.push(new Ripple(x, y));
    }

    for (let i = 0; i < 10; i++) {
        objs.push(new Shapes(x, y));
    }
}

function easeOutCirc(x) {
	return Math.sqrt(1 - Math.pow(x - 1, 2));
}

class Orb {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.radius = 0;
		this.maxRadius = minSide * 0.03;
		this.rStep = random(1);
		this.maxCircleD = minSide * 0.005;
		this.circleD = minSide * 0.005;
		this.isDead = false;
		this.ang = random(10);
		this.angStep = random([-1, 1]) * random(0.3, 0.1);
		this.xStep = random([-1, 1]) * minSide * random(0.01) * random(random());
		this.yStep = random([-1, 1]) * minSide * random(0.01) * random(random());
		this.life = 0;
		this.lifeSpan = int(random(50, 180));
		this.col = random(colors);
		this.pos = [];
		this.pos.push(createVector(this.x, this.y));
		this.followers = 10;
	}

	show() {
		this.xx = this.x + this.radius * cos(this.ang);
		this.yy = this.y + this.radius * sin(this.ang);
		push();
		noStroke();
		noFill();
		stroke(this.col);
		strokeWeight(this.circleD);
		beginShape();
		for (let i = 0; i < this.pos.length; i++) {
			vertex(this.pos[i].x, this.pos[i].y);
		}
		endShape();
		pop();
	}

	move() {
		this.ang += this.angStep;
		this.x += this.xStep;
		this.y += this.yStep;
		this.radius += this.rStep;
		this.radius = constrain(this.radius, 0, this.maxRadius);
		this.life++
		if (this.life > this.lifeSpan) {
			this.isDead = true;
		}
		this.circleD = map(this.life, 0, this.lifeSpan, this.maxCircleD, 1);
		this.pos.push(createVector(this.xx, this.yy));
		if (this.pos.length > this.followers) {
			this.pos.splice(0, 1);
		}
	}
	run() {
		this.show();
		this.move();
	}
}

class Sparkle {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.r = minSide * random(0.4);
		this.a = random(10);
		this.x0 = x;
		this.y0 = y;
		this.targetX = x + this.r * cos(this.a);
		this.targetY = y + this.r * sin(this.a);
		this.life = 0;
		this.lifeSpan = int(random(50, 280));
		this.col = random(colors);
		this.sw = minSide * random(0.01)
	}

	show() {
		noFill();
		strokeWeight(this.sw);
		stroke(this.col);
		if (random() < 0.5) {
			point(this.x, this.y);
		}
	}

	move() {
		let nrm = norm(this.life, 0, this.lifeSpan);
		this.x = lerp(this.x0, this.targetX, easeOutCirc(nrm));
		this.y = lerp(this.y0, this.targetY, easeOutCirc(nrm));
		this.life++
		if (this.life > this.lifeSpan) {
			this.isDead = true;
		}
	}

	run() {
		this.show();
		this.move();
	}
}


class Ripple {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.life = 0;
		this.lifeSpan = int(random(50, 150));
		this.col = random(colors);
		this.maxSw = minSide * 0.005;
		this.sw = minSide * 0.005;
		this.d = 0;
		this.maxD = minSide * random(0.1, 0.5);
	}

	show() {
		noFill();
		stroke(this.col);
		strokeWeight(this.sw);
		circle(this.x, this.y, this.d);
	}

	move() {
		this.life++
		if (this.life > this.lifeSpan) {
			this.isDead = true;
		}
		let nrm = norm(this.life, 0, this.lifeSpan);
		this.sw = lerp(this.maxSw, 0.1, easeOutCirc(nrm));
		this.d = lerp(0, this.maxD, easeOutCirc(nrm));
	}

	run() {
		this.show();
		this.move();
	}
}

class Shapes {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.life = 0;
		this.lifeSpan = int(random(50, 222));
		this.col = random(colors);
		this.sw = minSide * 0.005;
		this.maxSw = minSide * 0.005;
		this.w = minSide * random(0.05);
		this.ang = random(10);
		this.angStep = random([-1, 1]) * random(0.05);
		this.shapeType = int(random(3));
		this.r = minSide * random(0.4);
		this.a = random(10);
		this.x0 = x;
		this.y0 = y;
		this.targetX = x + this.r * cos(this.a);
		this.targetY = y + this.r * sin(this.a);
	}

	show() {
		push();
		translate(this.x, this.y);
		rotate(this.ang);
		noFill();
		strokeWeight(this.sw);
		stroke(this.col);
		if (this.shapeType == 0) {
			square(0, 0, this.w);
		} else if (this.shapeType == 1) {
			circle(0, 0, this.w);
		} else if (this.shapeType == 2) {
			line(0, this.w / 2, 0, -this.w / 2);
			line(this.w / 2, 0, -this.w / 2, 0);
		}
		pop();

	}

	move() {
		this.life++
		if (this.life > this.lifeSpan) {
			this.isDead = true;
		}
		let nrm = norm(this.life, 0, this.lifeSpan);
		this.x = lerp(this.x0, this.targetX, easeOutCirc(nrm));
		this.y = lerp(this.y0, this.targetY, easeOutCirc(nrm));
		this.sw = lerp(this.maxSw, 0.1, easeOutCirc(nrm));
		this.ang += this.angStep;
	}

	run() {
		this.show();
		this.move();
	}
}

class CenterBox {
    constructor() {
        this.x = width/2;
        this.y = height/2;
        this.size = min(width-menuWidth, height) * 0.15; // 更小的方格
    }
    
    display() {
        push();
        fill(128, 128, 128, 127);
        noStroke();
        rectMode(CENTER);
        rect(this.x, this.y, this.size, this.size);
        pop();
    }
}

class TKUText {
    constructor() {
        this.y = height + 100;
        this.targetY = height/2;
        // 修改 x 座標計算方式，使其位於整個畫面的中心
        this.x = width/2;
        this.isAnimating = true;
    }
    
    display() {
        if(this.isAnimating) {
            this.y = lerp(this.y, this.targetY, 0.05);
            if(abs(this.y - this.targetY) < 1) {
                this.isAnimating = false;
            }
        }
        
        push();
        fill(255);
        noStroke();
        textSize(50);
        textAlign(CENTER, CENTER);
        textStyle(BOLD);
        // 添加文字陰影效果使其更突出
        fill(0, 100);
        text('淡江大學', this.x + 2, this.y + 2);
        fill(255);
        text('淡江大學', this.x, this.y);
        pop();
    }
}

// 更新視窗大小時重新調整畫布
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    menuWidth = windowHeight / 4;
    minSide = min(width-menuWidth, height);
    
    // 更新物件位置
    if(tkuText) {
        tkuText.x = width/2;
        tkuText.targetY = height/2;
    }
    if(centerBox) {
        centerBox.x = width/2;
        centerBox.y = height/2;
        centerBox.size = min(width-menuWidth, height) * 0.2;
    }
    // 重置選單位置
    menuX = -250;
}