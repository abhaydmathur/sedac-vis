ctx_em = {
	gas: "CH4",
	sce: "A1AIM",
	year: "2020",
};

function drawEmissions(svgEl) {
	ctx_em.projection = d3
		.geoNaturalEarth1()
		.scale(100)
		.translate([ctx_em.width / 2, ctx_em.height / 2]);

	ctx_em.path = d3.geoPath().projection(ctx_em.projection);

	svgEl
		.selectAll("path")
		.data(ctx_em.mapdata.features)
		.enter()
		.append("path")
		.attr("d", ctx_em.path)
		// .on("click", function(event, d){
		// 	console.log(event, d)
		// 	svg.selectAll(".selected").classed("selected", false);
		// 	d3.select(this).classed("selected", true);
		// 	console.log("Selected Country: ", d.properties.name)
		// })
		.attr("stroke-width", function () {
			return 1 / d3.zoomTransform(svg.node()).k;
		})
		.attr("fill", "lightgrey");

	svgEl
		.selectAll("circle")
		.data(ctx_em.emissions)
		.enter()
		.append("circle")
		.attr("cx", (d) => ctx_em.projection([d.long, d.lat])[0])
		.attr("cy", (d) => ctx_em.projection([d.long, d.lat])[1])
		.attr("r", (d) => d.deg * 3)
		.attr("fill", "red") // Customize the color as needed
		.on("mouseover", handleMouseOver);

	moveToCountry();
	// panToCountry();
}

function updateData(year) {}

function handleMouseOver() {}

function moveToCountry() {
	const svg = ctx_em.svg;
	const countries = ctx_em.mapdata;
	const zoom = d3.zoom().scaleExtent([1, 8]);

	// Remove existing selected country
	svg.selectAll(".selected").remove();

	const selectedCountry = ctx_em.mapdata.features.find(
		(feature) => feature.properties.name === ctx_globe.selectedCountry
	);

	console.log(selectedCountry.properties.name);

	// Draw the selected country in red
	svg.append("path")
		.datum(selectedCountry)
		.attr("d", ctx_em.path)
		.attr("class", "selected")
		.attr("stroke-width", 1); // Fixed stroke width for the selected country

	// Pan and zoom to the selected country
	const bounds = ctx_em.path.bounds(selectedCountry);
	const dx = bounds[1][0] - bounds[0][0];
	const dy = bounds[1][1] - bounds[0][1];
	const x = (bounds[0][0] + bounds[1][0]) / 2;
	const y = (bounds[0][1] + bounds[1][1]) / 2;
	const scale = 0.9 / Math.max(dx / ctx_em.width, dy / ctx_em.height);
	const translate = [
		ctx_em.width / 2 - scale * x,
		ctx_em.height / 2 - scale * y,
	];

	// Use transition for smooth zoom
	svg.transition()
		.duration(750)
		.call(
			zoom.transform,
			d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
		);

	// Add zoom behavior to the SVG
	svg.call(zoom);
}

function panToCountry() {
	console.log(ctx_em);

	let country = ctx_em.mapdata.features.find(
		(d) => d.properties.name === ctx_globe.selectedCountry
	);

	// Get the bounding box of the country
	let bounds = ctx_em.path.bounds(country);

	// Calculate the   and translation to fit the country to the canvas
	let dx = bounds[1][0] - bounds[0][0];
	let dy = bounds[1][1] - bounds[0][1];
	let x = (bounds[0][0] + bounds[1][0]) / 2;
	let y = (bounds[0][1] + bounds[1][1]) / 2;

	// Calculate the scale to fit the country to the canvas
	let scale_ = 0.9 / Math.max(dx / ctx_em.width, dy / ctx_em.height);
	scale = 100 * scale_;

	// Update the projection to center on the country and scale to fit
	// ctx_em.projection
	// 	.scale(scale)
	// 	.translate([ctx_em.width/2-x, ctx_em.height/2-y]);

	// ctx_em.projection
	//     .scale(scale);
	ctx_em.projection.translate([x, y]);

	// Update the paths and circles
	ctx_em.path = d3.geoPath().projection(ctx_em.projection);
	ctx_em.svg.selectAll("path").attr("d", ctx_em.path);

	ctx_em.svg
		.selectAll("circle")
		.attr("cx", (d) => ctx_em.projection([d.long, d.lat])[0])
		.attr("cy", (d) => ctx_em.projection([d.long, d.lat])[1]);
	// .attr("r", 100);
}

function updateEmissionsData() {
	filename = `data/emissions/csv/${ctx_em.gas}_${ctx_em.sce}_${ctx_em.year}.csv`;
	d3.csv(filename).then((d) => (ctx_em.emissions = d));
}

function loadEmissionsData(svgEl) {
	// Load map from data/emissions/world-50m.json
	Promise.all([
		d3.json(
			"https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"
		),
		d3.csv(
			`data/emissions/csv/${ctx_em.gas}_${ctx_em.sce}_${ctx_em.year}.csv`
		),
		d3.csv("data/emissions/gdp_per_capita_1973_2023.csv"),
	]).then(function ([world, emissions, gdp_pc]) {
		ctx_em.mapdata = topojson.feature(world, world.objects.countries);
		console.log(ctx_em.mapdata);
		ctx_em.emissions = emissions;
		ctx_em.gdp_pc = gdp_pc;
		console.log(ctx_em.gdp_pc);
		drawEmissions(svgEl);
		// panToCountry();
	});
}

function createEmissionsViz() {
	svgEl = d3.select("#svgEmissions");

	ctx_em.width = svgEl.node().getBoundingClientRect().width;
	ctx_em.height = svgEl.node().getBoundingClientRect().height;

	ctx_em.svg = svgEl;

	loadEmissionsData(svgEl);
}
