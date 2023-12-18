ctx_em = {
	gas: "CO",
	sce: "A1AIM",
	year: "2010",
	rad_scale: 4,
	scale_factor: 1,
};

let margin = { top: 50, right: 20, bottom: 20, left: 20 };
ctx_em.width = ctx_em.width - margin.left - margin.right;
ctx_em.height = ctx_em.height - margin.top - margin.bottom;

function updateColourScale() {
	gdp_year = Math.min(ctx_em.year, 2022);

	let minGDP = d3.min(ctx_em.gdp_pc, (d) => parseFloat(d[`${gdp_year}`]));
	let maxGDP = d3.max(ctx_em.gdp_pc, (d) => parseFloat(d[`${gdp_year}`]));

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

	gdp_year = Math.min(ctx_em.year, 2023);

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
				c = parseFloat(country[`${gdp_year}`]);
				if (!isNaN(c)) return gdpToColour(c);
				else {
					return "lightgrey";
				}
			} catch {
				// console.log("unable", d.properties.name);
				return "lightgrey	";
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
		.attr("fill", "red")
		.attr("class", "blobs")
		.on("mouseover", handleMouseOver)
		.append("title")
		.text(function (d) {
			try {
				loc =
					ctx_em.coords_to_loc[
						[parseFloat(d.long), parseFloat(d.lat)]
					];
				return `${
					loc.city
				}, ${loc.country_code}\ndeg:${parseFloat(d.deg).toFixed(3)}`;
			} catch {
				return `${parseFloat(d.deg).toFixed(3)}@[${d.long}, ${d.lat}]`;
			}
		});

	let yearScale = d3
		.scaleLinear()
		.domain([1990, 2100])
		.range([margin.left, ctx_em.width])
		.clamp(true);

	svgEl
		.append("rect")
		.attr("class", "track")
		.attr("x", margin.left)
		.attr("y", margin.top - 20)
		.attr("width", ctx_em.width)
		.attr("height", 10)
		.attr("opacity", 0.5);

	let handle = svgEl
		.append("circle")
		.attr("class", "handle")
		.attr("cx", yearScale(ctx_em.year))
		.attr("cy", margin.top - 15)
		.attr("r", 10);

	let drag = d3.drag().on("drag", function (event) {
		let newX = Math.max(margin.left, Math.min(ctx_em.width, event.x));

		ctx_em.year = Math.round(yearScale.invert(newX));
		ctx_em.year -= ctx_em.year % 10;
		newX = yearScale(ctx_em.year);
		handle.attr("cx", newX);

		gdp_year = Math.min(ctx_em.year, 2022);

		// Update the map
		updateColourScale();
		updateEmissionsData();
		svgEl
			.selectAll(".blobs")
			.data(ctx_em.emissions) // Bind the updated data
			.attr("r", (d) => (ctx_em.rad_scale * d.deg) / ctx_em.scale_factor);

		svgEl
			.select(".emissionsTitle")
			.text(`Gridwise Emissions of ${ctx_em.gas} in ${ctx_em.year}`);

		svgEl.selectAll("path").attr("fill", function (d) {
			country = ctx_em.gdp_pc.find(
				(x) => x.CountryName === d.properties.name
			);

			try {
				c = parseFloat(country[`${gdp_year}`]);
				if (!isNaN(c)) return gdpToColour(c);
				else {
					return "lightgrey";
				}
			} catch {
				// console.log("unable", d.properties.name);
				return "lightgrey	";
			}
		});
	});

	svgEl
		.append("text")
		.attr("x", ctx_em.width / 2)
		.attr("y", margin.top - 30)
		.attr("class", "emissionsTitle")
		.attr("text-anchor", "middle")
		.text(`Gridwise Emissions of ${ctx_em.gas} in ${ctx_em.year}`);

	let colorScale = d3
		.scaleSequential(d3.interpolateBlues)
		.domain([0, d3.max(ctx_em.mapdata.features, (d) => d.properties.gdp)]);
	let colorBar = svgEl
		.append("g")
		.attr("class", "color-bar")
		.attr(
			"transform",
			`translate(${ctx_em.width + margin.right / 2}, ${margin.top})`
		);
	colorBar
		.append("rect")
		.attr("width", 20)
		.attr("height", ctx_em.height)
		.attr("fill", "url(#gradient)");
	let gradient = colorBar
		.append("defs")
		.append("linearGradient")
		.attr("id", "gradient")
		.attr("x1", "0%")
		.attr("y1", "100%")
		.attr("x2", "0%")
		.attr("y2", "0%");
	gradient
		.selectAll("stop")
		.data(
			colorScale.ticks().map((t, i, n) => ({
				offset: `${(100 * i) / n.length}%`,
				color: colorScale(t),
			}))
		)
		.enter()
		.append("stop")
		.attr("offset", (d) => d.offset)
		.attr("stop-color", (d) => d.color);

	// Apply the drag behavior to the handle
	handle.call(drag);

	moveToCountry();
}

function updateData(year) {}

function handleMouseOver() {}

function moveToCountry() {
	const svg = ctx_em.svg;

	const selectedCountry = ctx_em.mapdata.features.find(
		(feature) => feature.properties.name === ctx_globe.selectedCountry
	);

	ctx_em.zoom = d3
		.zoom()
		.scaleExtent([1, 8])
		.on("zoom", function (event) {
			ctx_em.scale_factor = event.transform.k;
			svg.selectAll("path")
				.attr("transform", event.transform)
				.attr("stroke-width", function () {
					return 1 / event.transform.k; // Adjust stroke width based on the current scale
				});
			svg.selectAll(".blobs")
				.attr("transform", event.transform)
				.attr(
					"r",
					(d) => (ctx_em.rad_scale * d.deg) / event.transform.k
				);
		});

	console.log(selectedCountry.properties.name);

	svg.selectAll("path").attr("opacity", function (d) {
		return d.properties.name === ctx_globe.selectedCountry ? 1 : 0.3;
	});

	svg.selectAll(".blobs")
		.transition()
		.duration(ctx.TRANSITION_DURATION)
		.attr("cx", (d) => ctx_em.projection([d.long, d.lat])[0])
		.attr("cy", (d) => ctx_em.projection([d.long, d.lat])[1])
		.attr("fill", function (d) {
			try {
				if (
					selectedCountry.properties.name ===
					ctx_em.coords_to_loc[
						[parseFloat(d.long), parseFloat(d.lat)]
					].country_name
				) {
					return "red";
				} else return "pink";
			} catch {
				return "pink";
			}
		});	

	const bounds = ctx_em.path.bounds(selectedCountry);
	const dx = bounds[1][0] - bounds[0][0];
	const dy = bounds[1][1] - bounds[0][1];
	x = (bounds[0][0] + bounds[1][0]) / 2;
	y = (bounds[0][1] + bounds[1][1]) / 2;
	den = Math.max(dx / ctx_em.width, dy / ctx_em.height);

	console.log(x);
	if(selectedCountry.properties.name === "United States of America"){
		[x, y] = [277, 100];
		den = 0.45;
	}
	else if(selectedCountry.properties.name === "Russia"){
		[x, y] = [700, 50];
		den = 0.45;
	}

	// den = Math.min(den, 0.5);
	const scale = 0.9 / den;

	const translate = [
		ctx_em.width / 2 - scale * x,
		ctx_em.height / 2 - scale * y,
	];

	svg.transition()
		.duration(ctx.TRANSITION_DURATION)
		.call(
			ctx_em.zoom.transform,
			d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
		);

	svg.call(ctx_em.zoom);
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
		d3.csv("data/emissions/coordinates_to_location.csv"),
	]).then(function ([world, emissions, gdp_pc, ctoloc]) {
		ctx_em.mapdata = topojson.feature(world, world.objects.countries);
		
		ctx_em.emissions = emissions;
		ctx_em.gdp_pc = gdp_pc;

		ctx_em.coords_to_loc = {};
		ctoloc.forEach(function (d) {
			ctx_em.coords_to_loc[[parseFloat(d.long), parseFloat(d.lat)]] = {
				city: d.city,
				country_code: d.country_code,
				country_name: d.country_name,
			};
		});
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
