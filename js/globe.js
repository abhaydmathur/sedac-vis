ctx = {
    data: null,
    globew: 500,
    globeh: 500,
    width: screen.width,
    height: screen.height,
    sensitivity: 75,
    svg: null,
    dflag:0,
};

let projection = d3.geoOrthographic()
    .scale(ctx.globew / 2)
    .center([0, 0])
    .rotate([0, -30])
    .translate([ctx.globew / 2, ctx.globeh / 2])


const initialScale = projection.scale()
let path = d3.geoPath().projection(projection)

let prev_path = null;

// function updateDropdown(data) {
//     const select = document.getElementById("countryDropdown");

//     // console.log(select);

//     data.features.forEach((feature) => {
//       const option = document.createElement("option");
//       option.value = feature.properties.name.replaceAll(" ", "_");
//       option.text = feature.properties.name;
//       select.add(option);
//     });

//     console.log(select)
// }

function mean2d(coordinates) {
    console.log("coords", coordinates)
    const numRows = coordinates.length;
    const numCols = coordinates[0].length;

    console.log(numRows, numCols)

    // Initialize sums for each column
    const columnSums = Array.from({
        length: numCols
    }, () => 0);

    // Calculate sums
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            columnSums[j] += coordinates[i][j];
        }
    }

    // Calculate means
    const columnMeans = columnSums.map((sum) => sum / numRows);

    return columnMeans;
}

function updateSearchList(data) {
    const searchList = document.getElementById("countryList");
    searchList.innerHTML = "";

    data.features.forEach((feature) => {
        const option = document.createElement("option");
        option.value = feature.properties.name;
        searchList.appendChild(option);
    });
}

function filterCountries() {
    const searchTerm = document.getElementById("countrySearch").value.toLowerCase();
    console.log(searchTerm);
    const searchList = document.getElementById("countryList");

    // Clear existing options
    searchList.innerHTML = "";

    // Filter and add new options based on the search term
    ctx.data.features.forEach((feature) => {
        const countryName = feature.properties.name.toLowerCase();
        if (countryName.includes(searchTerm)) {
            const option = document.createElement("option");
            option.value = feature.properties.name;
            searchList.appendChild(option);
        }
    });

    console.log(searchList)

}


function rotateToCountry(check_list = true) {
    if(check_list){ 
        ctx.selectedCountry = document.getElementById("countrySearch").value;    
        ctx.selectedPath = d3.selectAll(".country_" + ctx.selectedCountry.replaceAll(" ", "_"));
        console.log(ctx.selectedCountry, ctx.selectedPath)
    }
    selectedCountry = ctx.selectedCountry
    selectedPath = ctx.selectedPath
    svg = ctx.svg;
    if (prev_path != null) {
        prev_path.attr("fill", "white").attr("opacity", 0.6);
    }


    if (selectedPath.size() > 0) {
        var bounds = path.bounds(selectedPath.datum());
        var centroid = [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2];

        if (isNaN(centroid[0])) {
            console.log("Nan Encountered. Choose another country");
            return;
        }

        var oldRotation = projection.rotate();
        var newRotation = projection.invert(centroid);
        newRotation = [-newRotation[0], -newRotation[1], 0];
        var distance = d3.geoDistance(oldRotation, newRotation);

        // Use a transition with a custom tween function to interpolate the rotation
        svg.transition()
          .duration(1000)
          .tween("rotate", function () {
            return function (t) {
              // Interpolate between the current and target rotations
              var currentRotation = d3.interpolate(oldRotation, newRotation)(t);
              projection.rotate(currentRotation);
    
              // Update the paths with the new projection
              svg.selectAll("path").attr("d", path);
            };
          })
          .on("end", function(){
            selectedPath.attr("fill", "yellow").attr("opacity", 0.8)
            prev_path = selectedPath;
          })
    }
}

function handleCountryDoubleClick(event, d){
    console.log(d);
    ctx.selectedCountry = d.properties.name;    
    ctx.selectedPath = d3.selectAll(".country_" + ctx.selectedCountry.replaceAll(" ", "_"));
    console.log(ctx.selectedCountry, ctx.selectedPath)
    rotateToCountry(false);
};


function drawGlobe(svg) {

    data = ctx.data;

    let globe = svg.append("circle")
        .attr("fill", "blue")
        .attr("opacity", 0.3)
        .attr("stroke", "#000")
        .attr("stroke-width", "0.2")
        .attr("cx", ctx.globew / 2)
        .attr("cy", ctx.globeh / 2)
        .attr("r", initialScale)

    svg.call(d3.drag().on('drag', (event) => {
            console.log("event", event)
            const rotate = projection.rotate();
            const k = ctx.sensitivity / projection.scale();
            
            if(!ctx.dflag){
                console.log(event.dx, event.dy)
                console.log(k);
                ctx.dflag = 1;
            }
            projection.rotate([
                rotate[0] + event.dx * k,
                rotate[1] - event.dy * k
            ])
            path = d3.geoPath().projection(projection)
            svg.selectAll("path").attr("d", path)
        }))

    let map = svg.append("g")

    map.append("g")
        .attr("class", "countries")
        .selectAll("path")
        .data(data.features)
        .enter().append("path")
        .attr("class", d => "country_" + d.properties.name.replaceAll(" ", "_"))
        .attr("d", path)
        .attr("fill", "white")
        .style('stroke', 'black')
        .style('stroke-width', 0.3)
        .style("opacity", 0.6)
        .on("dblclick", handleCountryDoubleClick)
        .append("title")
        .text((d) => (d.properties.name));

    updateSearchList(ctx.data);
    rotateToCountry();
    // updateDropdown(ctx.data);
}

function loadData(svg) {
    d3.json("data/world.json").then(
        function(d) {
            ctx.data = d;
            drawGlobe(svg);
        }
    )
}

function createViz() {
    console.log("Using D3 v" + d3.version);
    let svgEl = d3.select("#main").append("svg");
    svgEl.attr("width", ctx.width);
    svgEl.attr("height", ctx.height);
    ctx.svg = svgEl;
    loadData(svgEl);

    document.getElementById("countrySearch").value = "France";
    // Optionally, call rotateToCountry to update the visualization based on the default country
    rotateToCountry();
}


//Optional rotate

function continuousRotation(){
    d3.timer(function(elapsed) {
        const rotate = projection.rotate()
        const k = ctx.sensitivity / projection.scale()
        projection.rotate([
          rotate[0] - 1 * k,
          0
        ])
        path = d3.geoPath().projection(projection)
        svg.selectAll("path").attr("d", path)
      },200)
}
