ctx_globe = {
	data: null,
	globew: 450,
	globeh: 450,
	width: screen.width / 2,
	height: screen.height / 2,
	sensitivity: 75,
	svg: null,
	dflag: 0,
};

let globe_projection = d3
	.geoOrthographic()
	.scale(ctx_globe.globew / 2)
	.center([0, 0])
	.rotate([-79, -22])
	.translate([ctx_globe.globew / 2, ctx_globe.globeh / 2]);

const initialScale = globe_projection.scale();
let globe_path = d3.geoPath().projection(globe_projection);

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
	const numRows = coordinates.length;
	const numCols = coordinates[0].length;

	// Initialize sums for each column
	const columnSums = Array.from(
		{
			length: numCols,
		},
		() => 0
	);

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

	ctx_globe.searchList = searchList;
	console.log("search list", ctx_globe.searchList);
}

function filterCountries() {
	const searchTerm = document
		.getElementById("countrySearch")
		.value.toLowerCase();
	const searchList = document.getElementById("countryList");

	// Clear existing options
	searchList.innerHTML = "";

	// Filter and add new options based on the search term
	ctx_globe.data.features.forEach((feature) => {
		const countryName = feature.properties.name.toLowerCase();
		if (countryName.includes(searchTerm)) {
			const option = document.createElement("option");
			option.value = feature.properties.name;
			searchList.appendChild(option);
		}
	});
}

function getCountryCentroid(countryName) {
	const countryFeature = ctx_globe.data.features.find(
		(feature) => feature.properties.name === countryName
	);

	return d3.geoCentroid(countryFeature);
}

function rotateToCountry(check_list = true) {
	if (check_list) {
		ctx_globe.selectedCountry =
			document.getElementById("countrySearch").value;
		ctx_globe.selectedPath = d3.selectAll(
			".country_" + ctx_globe.selectedCountry.replaceAll(" ", "_")
		);
		// moveToCountry();
	}

	selectedCountry = ctx_globe.selectedCountry;
	selectedPath = ctx_globe.selectedPath;
	svg = ctx_globe.svg;
	if (prev_path != null) {
		prev_path.attr("fill", "white").attr("opacity", 0.6);
	}

	if (selectedPath.size() > 0) {
		centroid = getCountryCentroid(selectedCountry);

		if (isNaN(centroid[0])) {
			console.log("Nan Encountered. Choose another country");
			return;
		}

		var oldRotation = globe_projection.rotate();
		var newRotation = centroid;
		newRotation = [-newRotation[0], -newRotation[1], 0];
		var distance = d3.geoDistance(oldRotation, newRotation);

		svg.transition()
			.duration(ctx.TRANSITION_DURATION)
			.tween("rotate", function () {
				return function (t) {
					var currentRotation = d3.interpolate(
						oldRotation,
						newRotation
					)(t);
					globe_projection.rotate(currentRotation);
					svg.selectAll("path").attr("d", globe_path);
				};
			})
			.on("end", function () {
				selectedPath.attr("fill", "yellow").attr("opacity", 0.8);
				prev_path = selectedPath;
			});
	}
}

function handleCountryDoubleClick(event, d) {
	ctx_globe.selectedCountry = d.properties.name;
	document.getElementById("countrySearch").value = ctx_globe.selectedCountry;
	ctx_globe.selectedPath = d3.selectAll(
		".country_" + ctx_globe.selectedCountry.replaceAll(" ", "_")
	);
	try {
		moveToCountry();
	} catch (e) {
		console.log(e);
	}

	rotateToCountry(false);
}

function drawGlobe(svg) {
	data = ctx_globe.data;

	let globe = svg
		.append("circle")
		.attr("fill", "blue")
		.attr("opacity", 0.3)
		.attr("stroke", "#000")
		.attr("stroke-width", "0.2")
		.attr("cx", ctx_globe.globew / 2)
		.attr("cy", ctx_globe.globeh / 2)
		.attr("r", initialScale);

	svg.call(
		d3.drag().on("drag", (event) => {
			const rotate = globe_projection.rotate();
			const k = ctx_globe.sensitivity / globe_projection.scale();

			if (!ctx_globe.dflag) {
				ctx_globe.dflag = 1;
			}
			globe_projection.rotate([
				rotate[0] + event.dx * k,
				rotate[1] - event.dy * k,
			]);
			globe_path = d3.geoPath().projection(globe_projection);
			svg.selectAll("path").attr("d", globe_path);
		})
	);

	let map = svg.append("g");

	map.append("g")
		.attr("class", "countries")
		.selectAll("path")
		.data(data.features)
		.enter()
		.append("path")
		.attr(
			"class",
			(d) => "country_" + d.properties.name.replaceAll(" ", "_")
		)
		.attr("d", globe_path)
		.attr("fill", "white")
		.style("stroke", "black")
		.style("stroke-width", 0.3)
		.style("opacity", 0.6)
		.on("dblclick", handleCountryDoubleClick)
		.append("title")
		.text((d) => d.properties.name);

	updateSearchList(ctx_globe.data);
	rotateToCountry();
	// updateDropdown(ctx_globe.data);
}

function loadGlobeData(svg) {
	// d3.json("data/globe/world.json").then(function (d) {
	// 	ctx_globe.data = d;
	// 	drawGlobe(svg);
	// });

	d3.json(
		"https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json"
	).then(function (d) {
		ctx_globe.data = d;
		ctx_globe.data = topojson.feature(d, d.objects.countries);
		drawGlobe(svg);
	});
}

function createGlobeViz() {
	let svgEl = d3.select("#svgGlobe");
	svgEl.attr("width", ctx_globe.width);
	svgEl.attr("height", ctx_globe.height);
	ctx_globe.svg = svgEl;
	loadGlobeData(svgEl);

	// updateSearchList(ctx_globe.data);

	document.getElementById("countrySearch").value = "India";
	rotateToCountry();
}

//Optional rotate

function continuousRotation() {
	d3.timer(function (elapsed) {
		const rotate = globe_projection.rotate();
		const k = ctx_globe.sensitivity / globe_projection.scale();
		globe_projection.rotate([rotate[0] - 1 * k, 0]);
		globe_path = d3.geoPath().projection(globe_projection);
		svg.selectAll("path").attr("d", globe_path);
	}, 200);
}
