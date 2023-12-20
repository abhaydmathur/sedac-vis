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
        .attr("width", width / 2 - width / 15)
        .attr("height", height / 2)
        .attr("id", "svgFood")

    loadData() 
}

function loadData() {
    let promises = [d3.csv("data/emissions.csv"),
                    d3.dsv(";", "data/food.csv"),
                    d3.csv("data/CDA_ind.csv"),
                    d3.csv("data/PMD_ind.csv"),
                    d3.csv("data/REC_ind.csv"),
                    d3.csv("data/TCL_ind.csv"),
                    d3.csv("data/gdp_per_capita.csv")];
    Promise.all(promises).then(function(data){

        createGlobeViz(),
        createEmissionsViz(data[0]),
        createEpiViz(data[2], data[3] ,data[4], data[5], data[6]),
        createFoodViz(data[1]);
    }).catch(function(error){console.log(error)});
}