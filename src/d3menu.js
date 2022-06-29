import {
    infoDescription,
    appendedElementsDelay,
    strokeColor,
    competenze,
} from "./config";
import * as d3 from "d3";
import { pathDrawing, pathCanceling } from "./strokeAnimation";
import { updateHistory, currentPage, setCurrentPage } from "./historyPush";
import { texts, type, cancelText, clearTitles } from "./typing";

//https://bl.ocks.org/mbostock/1044242
// var clusterSize = 800;
let clusterRadius = 180;
let transitionDuration = 1000;
const exitRemoveDelay = 2000;
const title = document.getElementById("title");
const subtitle = document.getElementById("subtitle");
const headingHeight = 70;
var clusterSize;
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

function setClusterWidth(width) {
    if (width < 641) {
        return Math.round((width * 0.5) / 2);
    } else {
        return Math.round((width * 0.9) / 2);
    }
}

function setResponsiveSettings(width) {
    if (width < 511) {
        return responsiveSettingsTable.xs;
    } else if (width < 640) {
        return responsiveSettingsTable.sm;
    } else {
        return responsiveSettingsTable.md;
    }
}

let elementsData = {
    lavori: {
        uao: {
            x: null,
            y: null,
        },
    },
    info: {
        descriptionBox: {
            x: null,
            y: null,
        },
    },
};

//TODO: transform relativo a dimensione svg
window.onload = function() {
    responsiveSettingsTable = {
        //max-width: 510
        xs: {
            width: Math.round(width * 0.5),
            height: Math.round(height * 0.5),
            // rotateAngle: 90,
            rotateAngle: 0,
            lavoriAngle: 52,
            scale: 0.6,
            absoluteInfoPositioning: false,
            descriptionBoxTranslate: "translate(0%, 0%)",
            rootGTranslate: [
                Math.round(Math.round(width) / 2),
                Math.round(Math.round(height) / 2 - 70),
            ],
            svgHeight: Math.round(height),
            svgWidth: Math.round(width),
            mainGTranslate: ["0", "0"],
            info: {
                // mainGTranslate: ["-28px", "50px"],
                mainGTranslate: ["0px", "0px"],
            },
            lavori: {
                // mainGTranslate: ["36px", "51px"],
                mainGTranslate: ["0px", "0px"],
            },
            projects: {
                // mainGTranslate: ["50px", "15px"],
                mainGTranslate: ["0px", "0px"],
            },
            home: {
                mainGTranslate: ["0", "0"],
            },
        },
        //max-width 639px
        sm: {
            width: Math.round(width * 0.5),
            height: Math.round(height * 0.5),
            rotateAngle: 90,
            lavoriAngle: -38,
            scale: 0.9,
            absoluteInfoPositioning: false,
            descriptionBoxTranslate: "translate(-48%, 56%)",
            rootGTranslate: [
                Math.round(Math.round(width) / 2),
                Math.round(Math.round(height) / 2 - 70),
            ],
            svgHeight: Math.round(height),
            svgWidth: Math.round(width),
            mainGTranslate: ["0px", "0px"],
            info: {
                mainGTranslate: ["0", "0"],
            },
            lavori: {
                mainGTranslate: ["0", "0"],
            },
            projects: {
                mainGTranslate: ["0", "0"],
            },
            home: {
                mainGTranslate: ["0", "0"],
            },
        },
        //min-width 640px
        md: {
            width: Math.round(width * 0.8),
            height: Math.round(height * 0.8),
            rotateAngle: 0,
            lavoriAngle: -38,
            scale: 1,
            absoluteInfoPositioning: false,
            descriptionBoxTranslate: "translate(-30%, -110%)",
            rootGTranslate: [
                Math.round(Math.round(width) / 2),
                Math.round(Math.round(height) / 2 - 70),
            ],
            svgHeight: Math.round(height),
            svgWidth: Math.round(width),
            mainGTranslate: ["0px", "0px"],
            info: {
                mainGTranslate: ["0", "0"],
            },
            lavori: {
                mainGTranslate: ["0", "0"],
            },
            projects: {
                mainGTranslate: ["0", "0"],
            },
            home: {
                mainGTranslate: ["0", "0"],
            },
        },
    };

    responsiveSettings = setResponsiveSettings(width);
    console.log(responsiveSettings.rootGTranslate[0]);
    console.log(responsiveSettings);
    //clusterSize = setClusterWidth(width);
    console.log(height);
    console.log(width);
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
        .attr("width", responsiveSettings.svgWidth)
        .attr("height", responsiveSettings.svgHeight - headingHeight)
        // .attr("viewbox", "0 0 " + svgWidth * 2 + " " + svgHeight * 2)
        // .attr("preserveAspectRatio", "xMinYMin meet")
        .style("margin", "auto auto auto 0")
        .append("g")
        // .style("transform-origin", "top left")
        // .style("transform-box", "fill-box")
        .attr("class", "rootG")
        .style(
            "transform",
            "translate(" +
            responsiveSettings.rootGTranslate[0] +
            "px, " +
            responsiveSettings.rootGTranslate[1] +
            "px) rotate(" +
            0 +
            "deg) scale(" +
            responsiveSettings.scale +
            ")"
        )
        .append("g")
        .style("transform-origin", "center")
        .style("transform-box", "fill-box")
        .attr("class", "mainG");
    // .attr(
    //     "transform",
    //     "translate(" +
    //     Math.round(svgWidth / 2) +
    //     "," +
    //     Math.round(svgHeight / 2) +
    //     ") rotate(" +
    //     0 +
    //     ")"
    // );
    //.attr("transform", "translate(" + radius + "," + radius + ") rotate(90deg)");
    node = svg.append("g");
    link = svg.append("g");

    showHome();
};

function updateLinks(root) {
    svg
        .append("g")
        .selectAll("path")
        .data(packageImports(root.leaves()))
        .join(
            function(enter) {
                return enter.append("path").each(function(d) {
                    pathDrawing(this);
                });
            },
            function(update) {
                return update.selectAll("path").style("opacity", 0);
            },
            function(exit) {
                return exit.remove();
            }
        )
        .transition()
        .delay(function(d, i) {
            return i * 75;
        })
        .duration(transitionDuration)
        //.each(function(d) { pathDrawing(this) })
        .each(function(d) {
            (d.source = d[0]), (d.target = d[d.length - 1]);
        })
        .attr("d", line);
}

function updateData(file, graphRadius) {
    if (graphRadius) {
        cluster.size([graphRadius, clusterRadius]);
    }
    d3.json(file).then(function(classes) {
        //console.log(classes);
        root = packageHierarchy(classes).sum(function(d) {
            return d.size;
        });

        cluster(root);
        //console.log(root);
        //updateLinks(root);

        link
            .selectAll("path")
            .data(packageImports(root.leaves()))
            .join(
                function(enter) {
                    return (
                        enter
                        .append("path")
                        // .style("stroke-dasharray", "0,0")
                        .style("opacity", 1)
                        .each(function(d, i) {
                            setTimeout(() => {
                                pathDrawing(this);
                            }, 100 * i);
                        })
                    );
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
                    // exit.style("stroke-opacity", 0.5);
                    // return setTimeout(() => exit.remove(), 1000)
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
            .each(function(d) {
                (d.source = d[0]), (d.target = d[d.length - 1]);
            })
            .attr("d", line)
            .on("end", function() {
                if (file.includes("info.json")) {
                    drawInfoLine();
                }
            });
        // .each(function(d) {
        //     pathDrawing(this);
        // });
        //.style('opacity', 1);

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
                    // return setTimeout(() => exit.remove(), 1000)
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
            //.delay(400)
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
        // let length = d.data.key.length;
        let length = selection.textLength.baseVal.value;
        console.log("QUA ", length);
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
    console.log("Map: ", map);
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
    //console.log(imports);
    return imports;
}

function showProjects() {
    clearSvg();
    updateData("./menuJsons/projects.json", 360);
    setCurrentPage("projects");
    updateHistory();
}

function showHome() {
    clearSvg();

    //document.getElementsByClassName("mainG")[0].style.transform = "rotate(0deg)";
    updateData("./menuJsons/home.json", 360);
    setCurrentPage("home");
    setTimeout(() => {
        type(title, texts.homeTitle);
        type(subtitle, texts.homeDescription);
    }, 60);
    updateHistory();
}

function clearPath() {
    clearSvg();
    updateData("./menuJsons/empty.json", 360);
}

function showLavori() {
    clearSvg();
    updateData("./menuJsons/lavori.json", 300);
    setCurrentPage("lavori");
    updateHistory();
}

function showInfo() {
    clearSvg();
    updateData("./menuJsons/info.json", 300);
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
    drawInfoLine();
    // setTimeout(drawInfoLine, 200);
}

function drawInfoLine() {
    let departureElement = document.getElementById("sudimePathStart");
    let departureCoord = extractPathStartingValue(departureElement);
    let svgRect = document
        .getElementsByClassName("rootG")[0]
        .getBoundingClientRect();
    let arrivalRect = document
        .getElementById("descriptionBox")
        .getBoundingClientRect();
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

function extractPathStartingValue(el) {
    let d = el.getAttribute("d");
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
    clearTitles();
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