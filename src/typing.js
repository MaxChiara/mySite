export const texts = {
    homeTitle: "MASSIMILIANO CHIARA",
    homeDescription: "Front End - Web Developer",
    projects: "Alcuni dei miei progetti personali",
    lavori: "Alcuni siti fatti da me",
};

var speedSlow = 30; /* The speed/duration of the effect in milliseconds */
var speedFast = 5;

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

//element = elemento DOM, ottenuto con vanilla JS | text = testo da scrivere
export async function type(element, text, speed = speedSlow) {
    let i = 0;
    while (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        await sleep(speed);
    }
}

export async function cancelText(element) {
    let text = element.innerHTML;
    let i = text.length;
    while (i >= 0) {
        element.innerHTML = element.innerHTML.slice(0, i);
        i--;
        await sleep(speedFast);
    }
}

export async function clearTitles() {
    await cancelText(document.getElementById("title"));
    await cancelText(document.getElementById("subtitle"));
}