import {Layer} from "./Layer.js";

async function importImage(src) {
    return new Promise((resolve) => {
        const image = new Image();
        image.src = src;
        image.onload = () => resolve(image)
    });
}

export class Editor {
    mode = "";
    zIndexTop = 1;
    layers = [];
    container;
    canvas;
    dragState = false;
    pageLocation = {
        start: {},
        end: {},
    };
    offsetLocation = {
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

    selectStart() {
        const layer = this.layers.find((layer) => layer.isSelected);
    }

    selectMode() {
        this.canvas.style.zIndex = 1;
    }

    selectMove(event) {
        if (this.dragState) {
            const layer = this.layers.find((layer) => layer.isSelected);

            layer.canvas.style.left = parseInt(layer.canvas.style.left) + event.pageX - this.pageLocation.start.x + "px";
            layer.canvas.style.top = parseInt(layer.canvas.style.top) + event.pageY - this.pageLocation.start.y + "px";

            this.pageLocation.start = {
                x: event.pageX,
                y: event.pageY,
            }
        }
    }

    cropMode() {
        this.canvas.style.zIndex = 9999;
    }

    cropMove(event) {
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

        const startX = this.offsetLocation.start.x - parseInt(layer.canvas.style.left);
        const startY = this.offsetLocation.start.y - parseInt(layer.canvas.style.top);
        const width = this.offsetLocation.end.x - this.offsetLocation.start.x;
        const height = this.offsetLocation.end.y - this.offsetLocation.start.y;

        layer.clearRect(startX, startY, width, height);

        canvas.style.left = this.offsetLocation.start.x + "px";
        canvas.style.top = this.offsetLocation.start.y + "px";
        canvas.width = width;
        canvas.height = height;

        context.drawImage(image, startX, startY, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);

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
        this.container.addEventListener("mousedown", (event) => {
            this.pageLocation.start = {
                x: event.pageX,
                y: event.pageY,
            }
            this.offsetLocation.start = {
                x: event.offsetX,
                y: event.offsetY,
            }

            this.dragState = true;

            this.executeEvent(event, "Start")
        })

        this.container.addEventListener("mousemove", (event) => {
            this.pageLocation.end = {
                x: event.offsetX,
                y: event.offsetY,
            }
            this.offsetLocation.end = {
                x: event.offsetX,
                y: event.offsetY,
            }

            this.executeEvent(event, "Move")
        })

        this.container.addEventListener("mouseup", (event) => {
            this.dragState = false;

            this.executeEvent(event, "End");
        });
    }

    appendLayer(layer) {
        const lastLayer = this.layers[this.layers.length - 1];

        if (lastLayer) {
            layer.canvas.style.zIndex = this.zIndexTop.toString();
        }

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
        path.moveTo(this.offsetLocation.start.x, this.offsetLocation.start.y);
        path.lineTo(this.offsetLocation.end.x, this.offsetLocation.end.y);

        context.stroke(path);
    }

    deselect() {
        this.layers.forEach(layer => {
            layer.setSelected(false)
        })
    }
}
