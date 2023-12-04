const ctx = {
    w: 800,
    h: 800,
    mapMode: false,
    MIN_COUNT: 3000,
    ANIM_DURATION: 600, // ms
    NODE_SIZE_NL: 5,
    NODE_SIZE_MAP: 3,
    LINK_ALPHA: 0.2,
    nodes: [],
    links: [],
};

const ALBERS_PROJ = d3.geoAlbersUsa().translate([ctx.w/2, ctx.h/2]).scale([1000]);

// https://github.com/d3/d3-force
const simulation = d3.forceSimulation()
                   .force("link", d3.forceLink()
                                    .id(function(d) {
                                        // console.log("->" + d.id);
                                         return d.id; })
                                    .distance(5).strength(0.08))
                   .force("charge", d3.forceManyBody())
                   .force("center", d3.forceCenter(ctx.w / 2, ctx.h / 2));

// https://github.com/d3/d3-scale-chromatic
const color = d3.scaleOrdinal(d3.schemeAccent);

function getQuadBezierCP(x1, y1, x2, y2){
    dx = x1-x2; dy = y1-y2;
    nrm = Math.sqrt(dx**2 + dy**2);
    rho = nrm/2*Math.cos(Math.PI/6);
    alpha = Math.atan2(y2-y1, x2-x1);

    xcp = x1 + rho*Math.cos(alpha+(Math.PI/6));
    ycp = y1 + rho*Math.sin(alpha+(Math.PI/6));

    return [xcp, ycp];
}

function simStep(){
    // code run at each iteration of the simulation
    // updating the position of nodes and links
    d3.selectAll("#links line").attr("x1", (d) => (d.source.x))
    .attr("y1", (d) => (d.source.y))
    .attr("x2", (d) => (d.target.x))
    .attr("y2", (d) => (d.target.y));

    d3.selectAll("#links path")
      .attr("d", function(d){
        x1 = d.source.x; y1 = d.source.y;
        x2 = d.target.x; y2 = d.target.y;
        cp = getQuadBezierCP(x1, y1, x2, y2);
        return `M${x1},${y1} Q${cp[0]},${cp[1]} ${x2},${y2}`;
      })

    d3.selectAll("#nodes circle").attr("cx", (d) => (d.x))
    .attr("cy", (d) => (d.y));
}


function callsim(){
    simulation.nodes(ctx.nodes)
    .on("tick", simStep);

    simulation.force("link")
        .links(ctx.links); 
}

function createGraphLayout(){
    var lines = d3.select("#links")
                  .selectAll("path")
                  .data(ctx.links)
                  .enter()
                  .append("path")
                  .attr("opacity", ctx.LINK_ALPHA);

    var circles = d3.select("#nodes")
                    .selectAll("path")
                    .data(ctx.nodes)
                    .enter()
                    .append("circle")
                    .attr("r", 5)
                    .attr("fill",function(d){
                        return color(d.group);
                    })
                    .append("svg:title")
                        .text(function(d) {return `${d.city} (${d.id})`});

    let geoPathGen = d3.geoPath()
                       .projection(ALBERS_PROJ);

    d3.select("#map")
      .selectAll("path")
      .data(ctx.us_states.features)
      .enter()
      .append("path")
      .attr("d", geoPathGen)
 
    d3.selectAll("circle").call(d3.drag().on("start", (event, d) => startDragging(event, d))
                          .on("drag", (event, d) => dragging(event, d))
                          .on("end", (event, d) => endDragging(event, d)));

    
    callsim();
};


function switchVis(showMap){
    if (showMap){
        // show network on map
        //...
        simulation.stop();

        // fade links, update line coords
        d3.selectAll("#links path")
          .transition()
          .duration(ctx.ANIM_DURATION)
          .ease(d3.easeQuad)
          .attr("opacity", 0)
          .attr("d", function(d){
            [x1, y1] = ALBERS_PROJ([d.source.long, d.source.lat]);
            [x2, y2] = ALBERS_PROJ([d.target.long, d.target.lat]);
            cp = getQuadBezierCP(x1, y1, x2, y2);
            return `M${x1},${y1} Q${cp[0]},${cp[1]} ${x2},${y2}`;
          })
          .transition()
          .duration(ctx.ANIM_DURATION)
          .attr("opacity", ctx.LINK_ALPHA)

        d3.select("#map")
          .transition()
          .duration(ctx.ANIM_DURATION*2)
          .ease(d3.easeQuad)
          .attr("opacity", 1)

        d3.selectAll("#nodes circle")
          .transition()
          .duration(2*ctx.ANIM_DURATION)
          .ease(d3.easeQuad)
          .attr("cx", (d) => ALBERS_PROJ([d.long, d.lat])[0])
          .attr("cy", (d) => ALBERS_PROJ([d.long, d.lat])[1])


    }
    else {
        // show NL diagram
        //...

        d3.selectAll("#nodes circle")
          .transition()
          .duration(ctx.ANIM_DURATION*2)
          .ease(d3.easeQuad)
          .attr("cx", (d) => (d.x))
          .attr("cy", (d) => (d.y));


        d3.select("#map")
        .transition()
        .duration(ctx.ANIM_DURATION*2)
        .ease(d3.easeQuad)
        .attr("opacity", 0)
        

        d3.selectAll("#links path")
          .transition()
          .duration(ctx.ANIM_DURATION)
          .ease(d3.easeQuad)
          .attr("opacity", 0)
          .attr("d", function(d){
            x1 = d.source.x; y1 = d.source.y;
            x2 = d.target.x; y2 = d.target.y;
            cp = getQuadBezierCP(x1, y1, x2, y2);
            return `M${x1},${y1} Q${cp[0]},${cp[1]} ${x2},${y2}`;
          })
          .transition()
          .duration(ctx.ANIM_DURATION)
          .attr("opacity", ctx.LINK_ALPHA)
          

        simulation.restart();
    }
};

function createViz(){
    console.log("Using D3 v"+d3.version);
    d3.select("body")
      .on("keydown", function(event, d){handleKeyEvent(event);});
    let svgEl = d3.select("#main").append("svg");
    svgEl.attr("width", ctx.w);
    svgEl.attr("height", ctx.h);

    svgEl.append("g").attr("id", "map").attr("opacity", 0).attr("class", "state");

    svgEl.append("g").attr("id", "links")
    svgEl.append("g").attr("id", "nodes")

    loadData(svgEl);
};

function loadData(svgEl){
    Promise.all([
        d3.json("data/airports.json"),
        d3.json("data/flights.json"),
        d3.csv("data/states_tz.csv"),
        d3.json("data/us-states.geojson")
    ]).then(function(data){
        airports = data[0];
        flights = data[1];
        states_tz = data[2];
        ctx.us_states = data[3];
        
        state2tz = {};
        states_tz.forEach(function(d){
            state2tz[d.State] = d.TimeZone;
        })

        valid_airs = [];

        flights.forEach(function(d){
            if (d.origin=="SJU" || d.destination=="SJU") return;
            if (d.count>=3000){
                ctx.links.push({
                    "source": d.origin,
                    "target": d.destination,
                    "value": d.count
                })
                valid_airs.push(d.origin);
                valid_airs.push(d.destination);
            }
        })

        valid_airs = new Set(valid_airs);

        airports.forEach(function(d){
            if(valid_airs.has(d.iata)){
                ctx.nodes.push({
                        "id":d.iata,
                        "group":state2tz[d.state],
                        "state":d.state,
                        "city":d.city,
                        "lat":d.latitude,
                        "long":d.longitude
                })
            }
        })

        console.log(ctx.nodes)
        
        createGraphLayout(svgEl);


    });
};

function startDragging(event, node){
    if (ctx.mapMode){return;}
    if (!event.active){
        simulation.alphaTarget(0.3).restart();
    }
    node.fx = node.x;
    node.fy = node.y;
}

function dragging(event, node){
    if (ctx.mapMode){return;}
    node.fx = event.x;
    node.fy = event.y;
}

function endDragging(event, node){
    if (ctx.mapMode){return;}
    if (!event.active){
        simulation.alphaTarget(0);
    }
    // commenting the following lines out will keep the
    // dragged node at its current location, permanently
    // unless moved again manually
    node.fx = null;
    node.fy = null;
}

function handleKeyEvent(e){
    if (e.keyCode === 84){
        // hit T
        console.log("T");
        toggleMap();
    }
};

function toggleMap(){
    ctx.mapMode = !ctx.mapMode;
    switchVis(ctx.mapMode);
};