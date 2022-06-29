/*history.pushState(null, "", entry.url) lo chiamo in updateHistory() che chiamo in gotoPage() 

entry.url -> chiama il value url del Map data, dove ad ogni elemento di 'pages' viene associato un URL
            ovvero in questo caso data.get(currentPage);

*/
let currentPage = "home";

export function setCurrentPage(value) {
    currentPage = value;
}

export function updateHistory() {
    history.pushState(null, "", data.get(currentPage).url);
}

export const hashes = new Map([
    ["#info", "info"],
    ["#projects", "projects"],
    ["#lavori", "lavori"],
    ["#home", "home"],
]);
export const data = new Map([
    [
        "lavori",
        {
            url: "index.html#lavori",
        },
    ],
    [
        "projects",
        {
            url: "index.html#projects",
        },
    ],
    [
        "info",
        {
            url: "index.html#info",
        },
    ],
    [
        "home",
        {
            url: "index.html#home",
        },
    ],
]);