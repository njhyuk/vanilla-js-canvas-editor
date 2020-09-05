import {Layer} from "./Layer.js";

async function importImage(src) {
    return new Promise((resolve) => {
        const image = new Image();
        image.src = src;
        image.onload = () => resolve(image)
    });
}

export class Editor {
    mode = ""
    layers = [];
    container;
    canvas;
    dragState = false;
    location = {
        start: {},
        end: {},
    };

    constructor(container, canvas, mode) {
        this.container = container;
        this.canvas = canvas;

        this.setMode(mode);
        this.attachEvents();
    }

    setMode(mode) {
        this.mode = mode;
        this[this.mode + "Mode"].call(this);
    }

    selectMode() {
        this.canvas.style.zIndex = -1;
    }

    cropMode() {
        this.canvas.style.zIndex = 1000;
    }

    cropStart() {
        this.dragState = true;
    }

    cropMove() {
        if (this.dragState) {
            this.drawLocation();
        }
    }

    async cropEnd() {
        this.dragState = false;
        this.clear();

        const layer = this.layers.find((layer) => layer.isSelected);
        const image = await importImage(layer.canvas.toDataURL());
        const croppedLayer = new Layer(this);

        const canvas = croppedLayer.canvas;
        const context = canvas.getContext("2d");

        const startX = this.location.start.x - parseInt(layer.canvas.style.left);
        const startY = this.location.start.y - parseInt(layer.canvas.style.top);
        const width = this.location.end.x - this.location.start.x;
        const height = this.location.end.y - this.location.start.y;

        layer.clearRect(startX, startY, width, width);

        canvas.style.left = this.location.start.x + "px";
        canvas.style.top = this.location.start.y + "px";
        canvas.width = width;
        canvas.height = height;

        context.drawImage(image, startX, startY, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);

        croppedLayer.canvas.style.zIndex = parseInt(layer.canvas.style.zIndex) + 1;

        this.appendLayer(croppedLayer);

        croppedLayer.setSelected(true);
        this.setMode("select");
    }

    executeEvent(event, type) {
        const fn = this[this.mode + type];

        if (typeof fn === "function") {
            fn.call(this, event);
        }
    }

    attachEvents() {
        this.canvas.addEventListener("mousedown", (event) => {
            this.location.start = {
                x: event.offsetX,
                y: event.offsetY,
            }

            this.executeEvent(event, "Start")
        })

        this.canvas.addEventListener("mousemove", (event) => {
            this.location.end = {
                x: event.offsetX,
                y: event.offsetY,
            }

            this.executeEvent(event, "Move")
        })

        this.canvas.addEventListener("mouseup", (event) => {
            this.executeEvent(event, "End");
        });
    }

    appendLayer(layer) {
        this.layers.push(layer);
        this.container.append(layer.canvas);
    }

    async addImage() {
        const layer = new Layer(this);
        await layer.addImage(await importImage('sample.png'));
        this.appendLayer(layer);
    }

    clear() {
        const context = this.canvas.getContext("2d");
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawLocation() {
        const context = this.canvas.getContext("2d");
        const path = new Path2D();

        this.clear()
        path.moveTo(this.location.start.x, this.location.start.y);
        path.lineTo(this.location.end.x, this.location.end.y);

        context.stroke(path);
    }

    deselect() {
        this.layers.forEach(layer => {
            layer.setSelected(false)
        })
    }
}
