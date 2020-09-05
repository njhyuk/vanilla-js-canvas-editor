import {Editor} from "./modules/Editor.js";

window.addEventListener('DOMContentLoaded', () => {
    const $editor = document.querySelector("#editor");
    const $workSpace = document.querySelector("#workspace");
    const $addImage = document.querySelector("#add-image");
    const $select = document.querySelector("#select");
    const $crop = document.querySelector("#crop");

    const editor = new Editor($editor, $workSpace, "select");

    $addImage.addEventListener("click", () => {
        editor.addImage();
    })

    $select.addEventListener("click", () => {
        editor.setMode("select")
    })

    $crop.addEventListener("click", () => {
        editor.setMode("crop")
    })
});
