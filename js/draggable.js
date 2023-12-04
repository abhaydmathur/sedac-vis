ctx = {
    data:null,
    globew:500,
    globeh:500,
    width:screen.width,
    height:screen.height,
    sensitivity:75,
    svg: null,
};

let projection = d3.geoOrthographic()
                   .scale(ctx.globew/2)
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

    console.log(numRows,numCols)
  
    // Initialize sums for each column
    const columnSums = Array.from({ length: numCols }, () => 0);
  
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
    console.log("updating search list")
    const searchList = document.getElementById("countryList");
    searchList.innerHTML = "";
  
    data.features.forEach((feature) => {
      const option = document.createElement("option");
      option.value = feature.properties.name;
      searchList.appendChild(option);
    });

    console.log(searchList);
}
  
function filterCountries() {
    console.log("searching")
    updateSearchList(ctx.data)
    const searchTerm = document.getElementById("countrySearch").value.toLowerCase();
    const options = document.getElementById("countryList").options;
  
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      const countryName = option.value.toLowerCase();
  
      // Show or hide options based on the search term
      option.style.display = countryName.includes(searchTerm) ? "block" : "none";
    }
}
  
function rotateToCountry() {
    const selectedCountry = document.getElementById("countrySearch").value;
    const selectedPath = d3.selectAll(".country_" + selectedCountry.replaceAll(" ", "_"));
    svg = ctx.svg;
  
    if (prev_path != null) {
      prev_path.attr("fill", "white").attr("opacity", 0.6);
    }
    selectedPath.attr("fill", "yellow").attr("opacity", 1.0);
    prev_path = selectedPath;
  
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
      projection.rotate(newRotation);
  
      svg.selectAll("path")
        .transition()
        .ease(d3.easeLinear)
        .duration(1000)
        .attr("d", path);
  
      const scale = 1;
      var translate = [ctx.globew / 2, ctx.globeh / 2];
      svg.transition()
        .duration(1000)
        .call(d3.zoom().transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
    }
  }

function drawGlobe(svg){
    
    data = ctx.data;

    let globe = svg.append("circle")
                   .attr("fill", "blue")
                   .attr("opacity", 0.3)
                   .attr("stroke", "#000")
                   .attr("stroke-width", "0.2")
                   .attr("cx", ctx.globew/2)
                   .attr("cy", ctx.globeh/2)
                   .attr("r", initialScale)

    svg.call(d3.drag().on('drag', (event) => {
        const rotate = projection.rotate()
        const k = ctx.sensitivity / projection.scale()
        projection.rotate([
            rotate[0] + event.dx * k,
            rotate[1] - event.dy * k
        ])
        path = d3.geoPath().projection(projection)
        svg.selectAll("path").attr("d", path)
    }))
    .call(d3.zoom().on('zoom', () => {
        if(d3.event.transform.k > 0.3) {
        projection.scale(initialScale * d3.event.transform.k)
        path = d3.geoPath().projection(projection)
        svg.selectAll("path").attr("d", path)
        globe.attr("r", projection.scale())
        }
        else {
        d3.event.transform.k = 0.3
        }
    }))

    let map = svg.append("g")

    map.append("g")
       .attr("class", "countries" )
       .selectAll("path")
       .data(data.features)
       .enter().append("path")
       .attr("class", d => "country_" + d.properties.name.replaceAll(" ","_"))
       .attr("d", path)
       .attr("fill", "white")
       .style('stroke', 'black')
       .style('stroke-width', 0.3)
       .style("opacity",0.6)
       .append("title")
       .text((d) => (d.properties.name));

    updateSearchList(ctx.data);
    rotateToCountry();
    // updateDropdown(ctx.data);


    // d3.timer(function(elapsed) {
    //     const rotate = projection.rotate()
    //     const k = ctx.sensitivity / projection.scale()
    //     projection.rotate([
    //       rotate[0] - 1 * k,
    //       0
    //     ])
    //     path = d3.geoPath().projection(projection)
    //     svg.selectAll("path").attr("d", path)
    //   },200)
}

function loadData(svg){
    d3.json("data/world.json").then(
        function(d){
            ctx.data = d;
            drawGlobe(svg);
        }   
      )
}

function createViz(){
    console.log("Using D3 v" + d3.version);
    let svgEl = d3.select("#main").append("svg");
    svgEl.attr("width", ctx.width);
    svgEl.attr("height", ctx.height);
    ctx.svg=svgEl;
    loadData(svgEl);
}

  
  //Optional rotate
  