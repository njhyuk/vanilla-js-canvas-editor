export class Layer {
    editor;
    canvas;
    isSelected;

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

        let color = state ? "rgba(240, 52, 52, 1)" : "rgba(0, 0, 0, 0)";
        this.canvas.style.boxShadow = " 0px 0px 0px 2px " + color;
        this.canvas.style.zIndex = (++this.editor.zIndexTop).toString();
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
            this.setSelected(true)
        })
    }

    clearRect(startX, startY, width, height) {
        const context = this.canvas.getContext("2d");
        context.clearRect(startX, startY, width, height);
    }
}
