let ctx = {
    data: null,
    globew: 500,
    globeh: 500,
    width: window.innerWidth / 2,
    height: window.innerHeight / 2,
    sensitivity: 75,
    svg: null,
    dflag: 0,
};

function createViz() {
    loadData() 

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Globe
    var divGlobe = d3.select("#main")
        .append("div")
        .attr("width", width / 2)
        .attr("height", height / 2)
        .attr("id", "divGlobe")
        .style("position", "absolute")
        .style("top", 0 + "px")
        .style("left", 0 + "px");

    var svgGlobe = divGlobe.append("svg")
        .attr("width", width / 2)
        .attr("height", height / 2)
        .attr("id", "svgGlobe")
        .style("background-color", "#f00");

    // EPI
    var divEpi = d3.select("#main")
        .append("div")
        .attr("width", width / 2)
        .attr("height", height / 2)
        .attr("id", "divEpi")
        .style("position", "absolute")
        .style("top", 0 + "px")
        .style("left", width / 2 + "px");

    var svgEpi = divEpi.append("svg")
        .attr("width", width / 2)
        .attr("height", height / 2)
        .attr("id", "svgEpi")
        .style("background-color", "#0f0");

    // Emissions
    var divEmissions = d3.select("#main")
        .append("div")
        .attr("width", width / 2)
        .attr("height", height / 2)
        .attr("id", "divEmissions")
        .style("position", "absolute")
        .style("top", height / 2 + "px")
        .style("left", 0 + "px");

    var svgEmissions = divEmissions.append("svg")
        .attr("width", width / 2)
        .attr("height", height / 2)
        .attr("id", "svgEmissions")
        .style("background-color", "#00f");

    // Food
    var divFood = d3.select("#main")
        .append("div")
        .attr("width", width / 2)
        .attr("height", height / 2)
        .attr("id", "divFood")
        .style("position", "absolute")
        .style("top", height / 2 + "px")
        .style("left", width / 2 + "px");

    var svgFood = divFood.append("svg")
        .attr("width", width / 2 - width / 8)
        .attr("height", height / 2)
        .attr("id", "svgFood")
        .style("background-color", "#ff0");

    var svgScenarios = divFood.append("svg")
        .attr("width", width / 8)
        .attr("height", height / 2)
        .style("position", "absolute")
        .attr("id", "svgScenarios")
        .style("background-color", "#ff0")
        .style("opacity", 0.8)
}

function loadData() {
    let promises = [d3.csv("data/emissions.csv"),
                    d3.csv("data/epi.csv"),
                    d3.csv("data/food.csv")];
    Promise.all(promises).then(function(data){
        createGlobeViz(),
        createEmissionsViz(data[0]),
        createEpiViz(data[1]),
        createFoodViz(data[2]);
    }).catch(function(error){console.log(error)});
}