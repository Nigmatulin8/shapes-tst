'use strict';

class Shape {
    constructor(x, y, size) {
        this.setPosition(x, y);
        this.setSize(size);
        this._setSettings = elem => {
            elem.fillStyle = this.fillColor;
            elem.fill();
            elem.lineWidth = this.strokeWidth;
            elem.strokeStyle = this.strokeColor;
            elem.stroke();
        };
    }

    setPosition(x, y) { this.x = x; this.y = y; }
    setSize(size) { this.size = size < 0 ? 0 : size; }
    setStrokeColor(color) { this.strokeColor = color; }
    setFillColor(color) { this.fillColor = color; }
    setStrokeWidth(width) { this.strokeWidth = width; }
    canRender() { return (Number.isFinite(this.size) && Number.isFinite(this.x) && Number.isFinite(this.y)); }
    render(ctx) { throw new Error('This is an abstract shape!'); }

}
class Circle extends Shape {
    render(ctx) {
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, 2 * Math.PI, false);
        this._setSettings(ctx);
    }
}
class Quad extends Shape {
    render(ctx) {
        ctx.beginPath();
        ctx.rect(-this.size / 2, -this.size / 2, this.size, this.size);
        this._setSettings(ctx);
    }
}
class Triangle extends Shape {
    render(ctx) {
        ctx.beginPath();
        ctx.moveTo(0, -this.size / 2);
        ctx.lineTo(this.size / 2, this.size / 2);
        ctx.lineTo(-this.size / 2, this.size / 2);
        ctx.closePath();
        this._setSettings(ctx);
    }
}
class App {
    constructor(canvas) {
        this.canvas = canvas;
        this.frames = 0;
        this.fps = 0;
        this.lastFPSUpdate = 0;
        this.ctx = canvas.getContext('2d');
        this.shapes = [];
        this.render();
    }

    addShape(shape) {
        if(shape && !this.shapes.includes(shape)) {
            this.shapes.push(shape);
        }
    }

    setCurrentShape(shape) { this.currentShape = shape; }

    clear() { this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); }

    renderShape(shape) {
        if(shape.canRender()) {
            this.ctx.save();
            this.ctx.translate(shape.x, shape.y);
            shape.render(this.ctx);
            this.ctx.restore();
        }
    }

    render() {
        requestAnimationFrame(() => {
           this.clear();
           this.shapes.forEach(shape => {
              this.renderShape(shape);
           });

           if(this.currentShape) { this.renderShape(this.currentShape); }

           this.render();
           this.frames++;
           const now = performance.now();
           if (now - this.lastFPSUpdate >= 1000) {
               this.lastFPSUpdate = now;
               this.fps = this.frames;
               this.frames = 0;
           }
           this.renderFPS();
        });
    }

    renderFPS() {
        this.ctx.save();
        this.ctx.font = "12px Helvetica";
        this.ctx.fillText(`${this.fps} FPS`, 10, 30);
        this.ctx.restore();
    }
}

const canvasNode = document.querySelector("#myCanvas");
const settingsPanel = document.getElementsByClassName("shapes")[0];
const settingButton = document.getElementsByClassName("settings")[0];
const updownImg = document.getElementById("updown");
let openFlag = true;

const app = new App(canvasNode);
const shapeMap = {
    circle: Circle,
    quad: Quad,
    triangle: Triangle
};

let currentFillColor = "#C6BAEE";
let currentStrokeColor = "#9D8CD7";
let currentStrokeWidth = 2;
let currentSize = 100;

canvasNode.addEventListener("mousemove", e => {
    if (app.currentShape) {
        app.currentShape.setPosition(e.clientX, e.clientY);
    }
});
canvasNode.addEventListener("click", e => {
    if (app.currentShape) {
        const shapeClass = app.currentShape.constructor;
        const shape = createShape(shapeClass, e.clientX, e.clientY);

        app.addShape(app.currentShape);
        app.setCurrentShape(shape);
    }
});

canvasNode.addEventListener("wheel", e => {
    e.preventDefault();

    if (app.currentShape) {
        currentSize = app.currentShape.size + e.deltaY;
        app.currentShape.setSize(currentSize);
    }
});
document.addEventListener("keydown", e => {
    if (e.keyCode === 27) {
        app.setCurrentShape(null);
    }
});
document.addEventListener("click", e => {
    const shape = e.target.dataset.shape;

    if (shape && shapeMap.hasOwnProperty(shape)) {
        const shapeClass = shapeMap[shape];
        const newShape = createShape(shapeClass);
        app.setCurrentShape(newShape);
    }

    if (shape === 'moreSettings') {
        if(openFlag) {
            updownImg.src = 'up.jpg';
            settingsPanel.style.paddingBottom = '80px';
            settingButton.style.backgroundColor = '#fbb971';
            openFlag = false;
        }
        else {
            updownImg.src = 'down.png';
            settingsPanel.style.paddingBottom = '0px';
            settingButton.style.backgroundColor = '#fcdfbf';
            openFlag = true;
        }
    }
});
document.addEventListener("change", e => {
    const shapeSettings = e.target.dataset.settings;
    if(shapeSettings === 'dataFillStrokeColor') { currentFillColor = e.target.value; currentRender(e); }
    if(shapeSettings === 'dataStrokeColor') { currentStrokeColor = e.target.value; currentRender(e); }
    if(shapeSettings === 'dataStrokeWidth') { currentStrokeWidth = e.target.value; currentRender(e); }
});
window.addEventListener("load", onResize);
window.addEventListener("resize", onResize);

function createShape(ShapeClass, x, y) {
    const shape = new ShapeClass(x, y, currentSize);

    shape.setFillColor(currentFillColor);
    shape.setStrokeColor(currentStrokeColor);
    shape.setStrokeWidth(currentStrokeWidth);

    return shape;
}
function onResize() {
    canvasNode.width = window.innerWidth;
    canvasNode.height = window.innerHeight;
}
function currentRender(coordinates) {
    const shapeClass = app.currentShape.constructor;
    const shape = createShape(shapeClass, coordinates.clientX, coordinates.clientY);
    app.setCurrentShape(shape);
}
