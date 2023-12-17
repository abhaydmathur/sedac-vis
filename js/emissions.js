ctx_em = {
	gas: "CH4",
	sce: "A1AIM",
	year: "2020",
	rad_scale : 10,
};

function updateColourScale() {
	let minGDP = d3.min(
		ctx_em.gdp_pc,
		(d) => d[`${ctx_em.year} [YR${ctx_em.year}]`]
	);
	let maxGDP = d3.max(
		ctx_em.gdp_pc,
		(d) => d[`${ctx_em.year} [YR${ctx_em.year}]`]
	);

	minGDP = 300;
	maxGDP = 117370;
	console.log("min", minGDP, "max", maxGDP);

	ctx_em.gdpLogScale = d3.scaleLog([minGDP, maxGDP]);

	ctx_em.gdpcolour = d3
		.scaleSequential(d3.interpolateYlGn)
		.domain([ctx_em.gdpLogScale(minGDP), ctx_em.gdpLogScale(maxGDP)]);
}

function gdpToColour(gdp) {
	return ctx_em.gdpcolour(ctx_em.gdpLogScale(gdp));
}

function drawEmissions(svgEl) {
	updateColourScale();

	ctx_em.projection = d3
		.geoMercator()
		.scale(120)
		.translate([ctx_em.width / 2, ctx_em.height / 2]);

	ctx_em.path = d3.geoPath().projection(ctx_em.projection);

	svgEl
		.selectAll("path")
		.data(ctx_em.mapdata.features)
		.enter()
		.append("path")
		.attr("d", ctx_em.path)
		.attr("stroke", "black	")
		.attr("stroke-width", function () {
			return 1 / d3.zoomTransform(svg.node()).k;
		})
		.attr("fill", function (d) {
			country = ctx_em.gdp_pc.find(
				(x) => x.CountryName === d.properties.name
			);
			try {
				return gdpToColour(
					country[`${ctx_em.year} [YR${ctx_em.year}]`]
				);
			} catch {
				// console.log("unable", d.properties.name);
				return "yellow";
			}
		})
		.attr("opacity", 0.8);

	svgEl
		.selectAll("circle")
		.data(ctx_em.emissions)
		.enter()
		.append("circle")
		.attr("cx", (d) => ctx_em.projection([d.long, d.lat])[0])
		.attr("cy", (d) => ctx_em.projection([d.long, d.lat])[1])
		.attr("r", (d) => ctx_em.rad_scale * d.deg)
		.attr("fill", "grey") // Customize the color as needed
		.on("mouseover", handleMouseOver);

	moveToCountry();
}

function updateData(year) {}

function handleMouseOver() {}

function moveToCountry() {
	const svg = ctx_em.svg;
	ctx_em.zoom = d3
		.zoom()
		.scaleExtent([1, 8])
		.on("zoom", function (event) {
			svg.selectAll("path")
				.attr("transform", event.transform)
				.attr("stroke-width", function () {
					return 1 / event.transform.k; // Adjust stroke width based on the current scale
				});
			svg.selectAll("circle")
				.attr("transform", event.transform)
				.attr("r", (d) => (ctx_em.rad_scale * d.deg / event.transform.k));
		});

	const selectedCountry = ctx_em.mapdata.features.find(
		(feature) => feature.properties.name === ctx_globe.selectedCountry
	);

	console.log(selectedCountry.properties.name);

	svg.selectAll("circle")
		.transition()
		.duration(ctx.TRANSITION_DURATION)
		.attr("cx", (d) => ctx_em.projection([d.long, d.lat])[0])
		.attr("cy", (d) => ctx_em.projection([d.long, d.lat])[1])
		.attr("fill", function (d) {
			return "red";
		});

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
		.duration(ctx.TRANSITION_DURATION)
		.call(
			ctx_em.zoom.transform,
			d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
		);

	// Add zoom behavior to the SVG
	svg.call(ctx_em.zoom);

	// svg.selectAll("circle")
	// 	.attr("transform", d3.zoomTransform(svg.node()))
	// 	.attr("r", function (d) {
	// 		// let event = d3.select(this).node().__on("zoom").value;
	// 		let currentZoomTransform = d3.zoomTransform(svg.node());
	// 		console.log(currentZoomTransform)
	// 		// return d.radius / event.transform.k; // Adjust the radius based on the current scale
	// 		return 3*d.deg / currentZoomTransform.k;
	// 	});
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
