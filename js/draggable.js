ctx = {
    data:null,
    w:300,
    h:300,
    sensitivity:75,
    svg: null,
};

let projection = d3.geoOrthographic()
                   .scale(ctx.w/2)
                   .center([0, 0])
                   .rotate([0,-30])
                   .translate([ctx.w / 2, ctx.h / 2])


const initialScale = projection.scale()
let path = d3.geoPath().projection(projection)


function updateDropdown(data) {
    console.log("updating")
    const select = document.getElementById("countryDropdown");
  
    data.features.forEach((feature) => {
      const option = document.createElement("option");
      option.value = feature.properties.name.replace(" ", "_");
      option.text = feature.properties.name;
      select.add(option);
    });
}
  
function rotateToCountry() {
    let zoom = d3.zoom();
    

    console.log("rotating")
    const selectedCountry = document.getElementById("countryDropdown").value;
    const selectedPath = d3.selectAll(".country_" + selectedCountry);
    console.log(selectedPath)
    const bounds = path.bounds(selectedPath.datum());
    const dx = bounds[1][0] - bounds[0][0];
    const dy = bounds[1][1] - bounds[0][1];
    const x = (bounds[0][0] + bounds[1][0]) / 2;
    const y = (bounds[0][1] + bounds[1][1]) / 2;
    const scale = Math.max(1, Math.min(ctx.sensitivity / Math.max(dx / ctx.w, dy / ctx.h), 8));
    const translate = [ctx.w / 2 - scale * x, ctx.h / 2 - scale * y];

    console.log("translate", translate);
  
    // ctx.svg.transition()
    //   .duration(1000)
    //   .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));

    projection.rotate(translate)
    path = d3.geoPath().projection(projection)
    ctx.svg.selectAll("path")
           .transition()
           .duration(1000)
           .attr("d", path)

    console.log("Kuchh hua?")
  }
  

function drawGlobe(svg){
    
    data = ctx.data;

    console.log(data)

    let globe = svg.append("circle")
                   .attr("fill", "#EEE")
                   .attr("stroke", "#000")
                   .attr("stroke-width", "0.2")
                   .attr("cx", ctx.w/2)
                   .attr("cy", ctx.h/2)
                   .attr("r", initialScale)

    svg.call(d3.drag().on('drag', (event) => {
        const rotate = projection.rotate()
        const k = ctx.sensitivity / projection.scale()
        // console.log(event)
        projection.rotate([
            rotate[0] + event.dx * k,
            rotate[1] - event.dy * k
            // 0
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
       .attr("class", d => "country_" + d.properties.name.replace(" ","_"))
       .attr("d", path)
       .attr("fill", "white")
       .style('stroke', 'black')
       .style('stroke-width', 0.3)
       .style("opacity",0.8)
       .append("title")
       .text((d) => (d.properties.name));

    updateDropdown(ctx.data);


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
    svgEl.attr("width", ctx.w);
    svgEl.attr("height", ctx.h);
    ctx.svg=svgEl;
    loadData(svgEl);
}

  
  //Optional rotate
  