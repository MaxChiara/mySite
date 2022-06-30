import { infoDescription, appendedElementsDelay, competenze } from "./config";
import * as d3 from "d3";
import { pathDrawing, pathCanceling } from "./strokeAnimation";
import { updateHistory, setCurrentPage } from "./historyPush";
import { texts, type, clearTitles } from "./typing";

//https://bl.ocks.org/mbostock/1044242

let clusterRadius = 180;
let transitionDuration = 1000;
const exitRemoveDelay = 2000;
const title = document.getElementById("title");
const subtitle = document.getElementById("subtitle");
const headingHeight = 70;

var cluster;
var line;
var root;
var svg;
var node;
var link;
let height =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight;
let width =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
let responsiveSettingsTable = {};
let responsiveSettings;

function setResponsiveSettings(width) {
    if (width < 511) {
        return responsiveSettingsTable.xs;
    } else if (width < 640) {
        return responsiveSettingsTable.sm;
    } else {
        return responsiveSettingsTable.md;
    }
}

const globalSvgSettings = {
    rootGTranslate: [
        Math.round(Math.round(width) / 2),
        Math.round(Math.round(height) / 2 - 70),
    ],
    svgHeight: Math.round(height),
    svgWidth: Math.round(width),
};

//TODO: transform relativo a dimensione svg
window.onload = function() {
    responsiveSettingsTable = {
        xs: {
            width: Math.round(width * 0.5),
            height: Math.round(height * 0.5) - headingHeight,
            scale: 0.6,
            descriptionBoxTranslate: "translate(0%, 0%)",
        },
        //max-width 639px
        sm: {
            width: Math.round(width * 0.5),
            height: Math.round(height * 0.5) - headingHeight,
            scale: 0.9,
            descriptionBoxTranslate: "translate(-48%, 56%)",
        },
        //min-width 640px
        md: {
            width: Math.round(width * 0.8),
            height: Math.round(height * 0.8) - headingHeight,
            scale: 1,
            descriptionBoxTranslate: "translate(-30%, -110%)",
        },
    };

    responsiveSettings = setResponsiveSettings(width);

    cluster = d3.cluster().size([360, responsiveSettings.width]);

    line = d3
        .lineRadial()
        .curve(d3.curveBundle.beta(0.85))
        .radius(function(d) {
            return d.y;
        })
        .angle(function(d) {
            return (d.x / 180) * Math.PI;
        });

    svg = d3
        .select("#radialMenu")
        .append("svg")
        .attr("width", globalSvgSettings.svgWidth)
        .attr("height", globalSvgSettings.svgHeight - headingHeight)
        .style("margin", "auto auto auto 0")
        .append("g")
        .attr("class", "rootG")
        .style(
            "transform",
            "translate(" +
            globalSvgSettings.rootGTranslate[0] +
            "px, " +
            globalSvgSettings.rootGTranslate[1] +
            "px) rotate(" +
            0 +
            "deg) scale(" +
            responsiveSettings.scale +
            ")"
        );
    node = svg.append("g");
    link = svg.append("g");

    showHome();
};

function updateData(file, graphRadius) {
    if (graphRadius) {
        cluster.size([graphRadius, clusterRadius]);
    }
    d3.json(file).then(function(classes) {
        root = packageHierarchy(classes).sum(function(d) {
            return d.size;
        });
        cluster(root);
        link
            .selectAll("path")
            .data(packageImports(root.leaves()))
            .join(
                function(enter) {
                    return enter
                        .append("path")
                        .style("opacity", 1)
                        .each(function(d, i) {
                            setTimeout(() => {
                                pathDrawing(this);
                            }, 100 * i);
                        });
                },
                function(update) {
                    return update.style("opacity", function() {
                        if (file.includes("home.json")) {
                            return 1;
                        } else {
                            return 0.5;
                        }
                    });
                },
                function(exit) {
                    return exit
                        .each(function(d, i) {
                            pathCanceling(this);
                        })
                        .call(function() {
                            setTimeout(() => {
                                exit.remove();
                            }, exitRemoveDelay);
                        });
                }
            )
            .attr("class", "link")
            .attr("id", function(d) {
                if (d[0].data.name == "B.Su di me") return "sudimePathStart";
                else return null;
            })
            .transition()
            .delay(function(d, i) {
                return i * 75;
            })
            .duration(transitionDuration)
            .ease(d3.easeCubicIn)
            .each(function(d) {
                (d.source = d[0]), (d.target = d[d.length - 1]);
            })
            .attr("d", line)
            .on("end", function(d) {
                if (d.source.data.key == "Su di me") {
                    drawInfoLine();
                }
            });

        node
            .selectAll("text")
            .data(root.leaves())
            .join(
                function(enter) {
                    return enter.append("text").style("opacity", 0);
                },
                function(update) {
                    return update;
                },
                function(exit) {
                    exit.style("opacity", 0);
                    return exit.remove();
                }
            )
            .on("click", function(event, d) {
                let func;
                switch (d.data.key.toLowerCase()) {
                    case "progetti":
                        func = showProjects();
                        break;
                    case "home":
                        func = showHome();
                        break;
                    case "lavori":
                        func = showLavori();
                        break;
                    case "info":
                        func = showInfo();
                        break;
                    default:
                        func = null;
                }
                return func;
            })
            .on("mouseenter mouseleave", function(ev, d) {
                d3.select(this).style("opacity", function() {
                    return d3.select(this).style("opacity") == 0.8 ? 1 : 0.8;
                });
            })
            .attr("class", function(d) {
                if (d.data.class) {
                    return "node " + d.data.class;
                } else {
                    return "node";
                }
            })
            .attr("id", function(d) {
                return d.data.key[0] == "-" ?
                    "" :
                    d.data.key.split(" ").join("").toLowerCase();
            })
            .text(function(d) {
                if (d.data.url) {
                    d3.select(this).on("click", function(event, d) {
                        window.open(d.data.url, "_blank").focus();
                    });
                }
                return d.data.key[0] == "-" ? "" : d.data.key;
            })
            .each(function(d) {
                addSubtext(d, this);
            })
            .transition()
            .duration(200)
            .style("opacity", 0.8)
            .attr("dy", "0.31em")
            .attr("transform", function(d) {
                let angle = 0;
                return (
                    "rotate(" +
                    (d.x - 90) +
                    ")translate(" +
                    (d.y + 8) +
                    ",0)" +
                    (d.x < 180 ? "" : "rotate(" + (180 - angle) + ")")
                );
            })
            .attr("text-anchor", function(d) {
                return d.x < 180 ? "start" : "end";
            });
    });
}

function addSubtext(d, selection) {
    if (d.data.subtext) {
        let length = selection.textLength.baseVal.value;
        d3.select(selection)
            .append("tspan")
            .attr("dy", "1.31em")
            .attr("dx", -length + "px")
            .text(d.data.subtext);
    }
}
// Lazily construct the package hierarchy from class names.
function packageHierarchy(classes) {
    var map = {};

    function find(name, data) {
        var node = map[name],
            i;
        if (!node) {
            node = map[name] = data || {
                name: name,
                children: [],
            };
            if (name.length) {
                node.parent = find(name.substring(0, (i = name.lastIndexOf("."))));
                node.parent.children.push(node);
                node.key = name.substring(i + 1);
            }
        }
        return node;
    }

    classes.forEach(function(d) {
        find(d.name, d);
    });
    return d3.hierarchy(map[""]);
}

// Return a list of imports for the given array of nodes.
function packageImports(nodes) {
    var map = {},
        imports = [];

    // Compute a map from name to node.
    nodes.forEach(function(d) {
        map[d.data.name] = d;
    });

    // For each import, construct a link from the source to target node.
    nodes.forEach(function(d) {
        if (d.data.imports)
            d.data.imports.forEach(function(i) {
                imports.push(map[d.data.name].path(map[i]));
            });
    });
    return imports;
}

async function showProjects() {
    clearSvg();
    updateData("./menuJsons/projects.json", 360);
    await clearTitles();
    setCurrentPage("projects");
    updateHistory();
    type(subtitle, texts.projects);
}

async function showHome() {
    clearSvg();
    updateData("./menuJsons/home.json", 360);
    await clearTitles();
    setCurrentPage("home");
    setTimeout(() => {
        type(title, texts.homeTitle);
        type(subtitle, texts.homeDescription);
    }, 60);
    updateHistory();
}

async function showLavori() {
    clearSvg();
    updateData("./menuJsons/lavori.json", 300);
    await clearTitles();
    setCurrentPage("lavori");
    updateHistory();
    type(subtitle, texts.lavori);
}

async function showInfo() {
    clearSvg();
    updateData("./menuJsons/info.json", 300);
    await clearTitles();
    setTimeout(appendInfo, appendedElementsDelay);
    setCurrentPage("info");
    updateHistory();
}

// creazione div con testo per la sezione Info
function appendInfo() {
    if (document.getElementById("descriptionBox")) {
        return true;
    }
    const div = document.createElement("div");
    div.id = "descriptionBox";
    let p = document.createElement("p");
    div.append(p);
    p.append(infoDescription);
    let c = document.createElement("p");
    c.append(competenze);
    div.append(c);
    let rootG = document.getElementsByClassName("rootG")[0];
    let rootRect = rootG.getBoundingClientRect();
    div.style.top = rootRect.top + "px";
    div.style.left = rootRect.left + "px";
    document.getElementById("radialMenu").append(div);
}

async function drawInfoLine() {
    let departureElement = await tryGetStuff(
        function() {
            return this.getElementById("sudimePathStart");
        }.bind(document)
    );
    console.log("departureElement: ", departureElement);
    if (!departureElement) {
        return true;
    }
    let departureCoord = await extractPathStartingValue(departureElement);
    console.log("departureCoord: ", departureCoord);
    let svgRect = await tryGetStuff(
        function() {
            return this.getElementsByClassName("rootG")[0].getBoundingClientRect();
        }.bind(document)
    );
    console.log("SVG RECT: ", svgRect);
    let arrivalRect = await tryGetStuff(
        function() {
            return this.getElementById("descriptionBox").getBoundingClientRect();
        }.bind(document)
    );
    let arrivalX = -(width / 2 - arrivalRect.x) + arrivalRect.width / 2 - headingHeight;
    let arrivalY = -(height / 2 - arrivalRect.y) + arrivalRect.height - headingHeight;
    const path = d3.path();
    path.moveTo(departureCoord[0], departureCoord[1]);
    path.quadraticCurveTo(0, arrivalY + svgRect.height / 2, arrivalX, arrivalY);
    link
        .append("path")
        .attr("d", path)
        .attr("stroke", "black")
        .attr("class", "manualRemove")
        .each(function() {
            pathDrawing(this);
        });
}

async function tryGetStuff(func) {
    console.log(func);
    let result,
        i = 0;
    while (true) {
        console.log("check");
        i++;
        result = func();
        if (result || i == 50) {
            break;
        }
        await new Promise((resolve, reject) => setTimeout(resolve, 50));
    }
    return result;
}

async function extractPathStartingValue(el) {
    let d = await tryGetStuff(
        function() {
            return this.getAttribute("d");
        }.bind(el)
    );
    console.log(d);
    let start = d.indexOf("M");
    let end = d.indexOf("L");
    d = d.slice(start + 1, end);
    return [+d.split(",")[0], +d.split(",")[1]];
}

function clearSvg() {
    let b = document.getElementById("descriptionBox");
    if (b) {
        b.remove();
    }
    let paths = document.getElementsByClassName("manualRemove");
    if (paths) {
        for (let path of paths) {
            pathCanceling(path);
        }
    }
}

function hashChange() {
    const previousPage = window.location.hash.slice(1);
    if (previousPage) {
        switch (previousPage) {
            case "lavori":
                showLavori();
                break;
            case "info":
                showInfo();
                break;
            case "home":
                showHome();
                break;
            case "projects":
                showProjects();
                break;
            default:
                showHome();
                break;
        }
    } else showHome();
}
window.addEventListener("hashchange", hashChange, false);