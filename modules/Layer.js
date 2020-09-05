export class Layer {
    editor;
    canvas;
    isSelected;
    dragState;
    location = {
        start: {},
        end: {},
    };

    constructor(editor) {
        this.editor = editor;

        this.makeCanvas();
        this.attachEvents();
    }

    makeCanvas() {
        const canvas = document.createElement("canvas");
        canvas.style.position = "absolute";
        canvas.style.left = 0;
        canvas.style.top = 0;
        canvas.style.zIndex = 1;
        this.canvas = canvas;
    }

    setSelected(state) {
        if (state) {
            this.editor.deselect();
        }

        this.isSelected = state;

        let color = state ? "rgba(240, 52, 52, 1)" : "rgba(240, 52, 52, 0)";
        this.canvas.style.boxShadow = " 0px 0px 0px 2px " + color;
    }

    async addImage(image) {
        const canvas = this.canvas;

        canvas.width = image.width;
        canvas.height = image.height;

        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0);
    }

    attachEvents() {
        this.canvas.addEventListener("mousedown", (event) => {
            this.dragState = true;
            this.location.start = {
                x: event.offsetX,
                y: event.offsetY,
            }

            this.setSelected(true)
        })

        this.canvas.addEventListener("mousemove", (event) => {
            if (this.dragState) {
                this.location.end = {
                    x: event.offsetX,
                    y: event.offsetY,
                }

                this.canvas.style.left = parseInt(this.canvas.style.left) + (this.location.end.x - this.location.start.x) + "px";
                this.canvas.style.top = parseInt(this.canvas.style.top) + (this.location.end.y - this.location.start.y) + "px";
            }
        })

        this.canvas.addEventListener("mouseup", (event) => {
            this.dragState = false;
        });
    }

    clearRect(startX, startY, width, height) {
        const context = this.canvas.getContext("2d");
        context.clearRect(startX, startY, width, height);
    }
}
