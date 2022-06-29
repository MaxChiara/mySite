import { strokeColor } from "./config";

function pathDrawing(element) {
    let distancePerPoint = 2;
    let drawFPS = 160;
    let length, timer;

    function startDrawingPath() {
        length = 0;
        element.style.stroke = strokeColor;
        let pathLength = element.getTotalLength();
        element.style.strokeDasharray = [length, pathLength].join(" ");
        timer = setInterval(increaseLength, 1000 / drawFPS);
    }

    function increaseLength() {
        let pathLength = element.getTotalLength();
        length += distancePerPoint;
        element.style.strokeDasharray = [length, pathLength].join(" ");
        if (length >= pathLength) clearInterval(timer);
    }

    function stopDrawingPath() {
        clearInterval(timer);
        element.style.stroke = "";
        element.style.strokeDasharray = "";
    }

    startDrawingPath();
}

function pathCanceling(element) {
    let distancePerPoint = 2;
    let drawFPS = 160;
    let length, timer;

    function startDrawingPath() {
        element.style.stroke = strokeColor;
        let pathLength = element.getTotalLength();
        length = pathLength;
        element.style.strokeDasharray = [length, pathLength].join(" ");
        timer = setInterval(increaseLength, 1000 / drawFPS);
    }

    function increaseLength() {
        let pathLength = element.getTotalLength();
        length -= distancePerPoint;
        element.style.strokeDasharray = [length, pathLength].join(" ");
        if (length <= 0) clearInterval(timer);
    }

    function stopDrawingPath() {
        clearInterval(timer);
        element.style.stroke = "";
        element.style.strokeDasharray = "";
    }
    stopDrawingPath();
    startDrawingPath();
}

export { pathDrawing, pathCanceling };