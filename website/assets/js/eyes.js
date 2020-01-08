let splash = document.querySelector('.section--splash');
let canvas = document.querySelector('#eyes');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let ctx = canvas.getContext('2d');
let dpr = window.devicePixelRatio || 1;
canvas.width = window.innerWidth * dpr;
canvas.height = window.innerHeight * dpr;
var blinkFrame;
var blinkOut;

let eye_white = '#7a7a7a';
let eye_black = '#424040';

function Vector2(x, y) {
    this.x = x || 0;
    this.y = y || 0;
}

Object.assign(Vector2.prototype, {

    clampMouse: function (pos, scale) {
        this.x = Math.max(pos.x - clamps.x * scale.x, Math.min(pos.x + clamps.x * scale.x, this.x));
        this.y = Math.max(pos.y - clamps.y * scale.y, Math.min(pos.y + clamps.y * scale.y, this.y));
        return this;
    },

    multiplyScalar: function (scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    },

    /**
     *
     * @param v Vector2
     * @returns {Vector2}
     */
    getDifference: function (v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    },

    /**
     *
     * @param v Vector2
     * @returns {Vector2}
     */
    add: function (v) {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

});

function Eye(x, y, scale, parent) {
    this.parent = parent;
    this.pos = new Vector2(x, y);
    this.scale = scale;
    this.draw = function (mouse) {
        ctx.save();
        drawMask(this.pos.x - this.scale.x * .45, this.pos.y, this.scale);
        ctx.clip();
        ctx.fillStyle = eye_white;
        ctx.fillRect(0,0,canvas.width,canvas.height);

        let distance = mouse.getDifference(this.pos);
        distance.multiplyScalar(0.2);
        distance.add(this.pos);
        distance.clampMouse(this.pos, this.scale);

        drawIris(distance, this.scale);
        ctx.restore();
    };
}

function Eyes(x, y, scale) {
    this.pos = new Vector2(x, y);
    this.closing = false;
    this.scale = new Vector2(scale, scale);
    this.leftEye = new Eye(this.pos.x - .6 * this.scale.x, this.pos.y, this.scale, this);
    this.rightEye = new Eye(this.pos.x + .6 * this.scale.x, this.pos.y, this.scale, this);
    this.draw = function (mouse) {
        if (this.closing) {
            if (this.scale.y === 0) {
                let ref = this;
                setTimeout(function () {
                    ref.closing = false;
                    ref.scale.y = ref.scale.x;
                }, 100);
            } else {
                this.scale.y = Math.max(0, this.scale.y - this.scale.x / 2.5);
            }
        }
        this.leftEye.draw(mouse);
        this.rightEye.draw(mouse);
    };
}

const clamps = new Vector2(.275, .1);

let timeoutMouse;

splash.addEventListener("mousemove", function (event) {
    if (timeoutMouse) {
        window.cancelAnimationFrame(timeoutMouse)
    }

    timeoutMouse = window.requestAnimationFrame(function () {
        lastMouseLoc = new Vector2(event.clientX, event.clientY);
        lastMouseLoc.multiplyScalar(dpr);
        render();
    })

});

splash.addEventListener('click', function (event) {
    let clickPos = new Vector2( event.clientX, event.clientY);
    clickPos.multiplyScalar(dpr);
    for (let eyes of eyesArray) {
        let path = new Path2D();
        path.rect(eyes.pos.x - eyes.scale.x * .7, eyes.pos.y - eyes.scale.y * .7, eyes.scale.x * 1.4, eyes.scale.y * 1.4)
        if (ctx.isPointInPath(path, clickPos.x, clickPos.y)) {
            eyes.closing = true;
            blinkFrame = window.requestAnimationFrame(render);
        }
    }
});

function render() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    let closing = false;
    for (let eyes of eyesArray) {
        eyes.draw(lastMouseLoc);
        closing = closing || eyes.closing;
    }
    if (closing) {
        blinkFrame = window.requestAnimationFrame(render);
    }
}

window.addEventListener('resize', function (event) {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    init();
});

/**
 *
 * @type {Eyes[]}
 */
let eyesArray = [];

function init() {
    let scale = 75 * dpr;
    eyesArray[0] = new Eyes(scale + (canvas.width - scale * 2) * .1, scale / 2 + (canvas.width - scale) * .1, scale );
    eyesArray[1] = new Eyes(scale + (canvas.width - scale * 2) * .9, scale / 2 + (canvas.height - scale) * .35, scale );
    eyesArray[2] = new Eyes(scale + (canvas.width - scale * 2) * .4, scale / 2 + (canvas.height - scale) * .95, scale);
    blinkFrame = window.requestAnimationFrame(render);
}

function blink() {
    clearTimeout(blinkOut);
    blinkOut = setTimeout(function () {
        eyesArray[Math.round(Math.random() * (eyesArray.length - 1))].closing = true;
        render();
        blink();
    }, 2000 + Math.random() * 10000)
}


let lastMouseLoc = new Vector2(window.innerWidth / 2, window.innerHeight / 2);
lastMouseLoc.multiplyScalar(dpr);

init();

function drawMask(posX, posY, scale) {
    ctx.beginPath();
    ctx.moveTo(posX, posY);
    ctx.bezierCurveTo(
        posX + scale.x * .3, posY - scale.y * .3,
        posX + scale.x * .6, posY - scale.y * .3,
        posX + scale.x * .9, posY);
    ctx.bezierCurveTo(
        posX + scale.x * .6, posY + scale.y * .3,
        posX + scale.x * .3, posY + scale.y * .3,
        posX, posY);
    ctx.closePath();
}

function drawIris(pos, scale) {
    ctx.beginPath();
    ctx.arc(
        pos.x,
        pos.y,
        scale.x * .175,
        0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.fillStyle = eye_black;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
        pos.x - scale.x * .05,
        pos.y - scale.y * .05,
        scale.x * .03,
        0, 2 * Math.PI, false);
    ctx.fillStyle = eye_white;
    ctx.closePath();
    ctx.fill();
}
