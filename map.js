(function () {
	"use strict";

	// ISO 3166-1 numeric codes (world-atlas feature.id).
	// Master takes precedence over office. All other countries render as "none".
	// Uses countries-50m for small territories; territories.geojson adds French Guiana
	// and Bonaire (Caribbean Netherlands), which are merged into France/Netherlands in world-atlas.

	const EXCLUDED_TERRITORIES = new Set([
		"010", // Antarctica
		"260", // Fr. S. Antarctic Lands
	]);

	// Rendered above parent countries (e.g. French Guiana over France).
	const OVERLAY_TERRITORIES = new Set(["254", "535"]);

	const masterCountries = new Set([
		"156", // China (Resale)
		"050", // Bangladesh
		"104", // Myanmar (Resale)
		"051", // Armenia (Resale)
		"031", // Azerbaijan (Resale)
		"048", // Bahrain (Resale)
		"064", // Bhutan
		"096", // Brunei
		"108", // Burundi
		"120", // Cameroon
		"288", // Ghana (Resale)
		"400", // Jordan (Resale)
		"414", // Kuwait (Resale)
		"417", // Kyrgyzstan
		"454", // Malawi
		"524", // Nepal
		"566", // Nigeria (Resale)
		"512", // Oman (Resale)
		"598", // Papua New Guinea
		"646", // Rwanda
		"626", // Timor-Leste
		"795", // Turkmenistan
		"344", // Hong Kong (Resale)
		"446", // Macau (Resale)
		"702", // Singapore (Resale)
		"016", // American Samoa
		"254", // French Guiana (supplementary geometry)
	]);

	const officeCountries = new Set([
		// Americas
		"032", // Argentina
		"084", // Belize
		"068", // Bolivia
		"076", // Brazil
		"124", // Canada
		"152", // Chile
		"170", // Colombia
		"188", // Costa Rica
		"218", // Ecuador
		"222", // El Salvador
		"328", // Guyana
		"340", // Honduras
		"484", // Mexico
		"558", // Nicaragua
		"591", // Panama
		"600", // Paraguay
		"604", // Peru
		"740", // Suriname
		"840", // United States
		"858", // Uruguay
		"862", // Venezuela
		// Caribbean
		"044", // Bahamas
		"214", // Dominican Republic
		"388", // Jamaica
		"630", // Puerto Rico
		"780", // Trinidad and Tobago
		"660", // Anguilla
		"028", // Antigua and Barbuda
		"533", // Aruba
		"052", // Barbados
		"535", // Bonaire (Caribbean Netherlands)
		"092", // British Virgin Islands
		"136", // Cayman Islands
		"531", // Curaçao
		"308", // Grenada
		"652", // St. Barthélemy
		"662", // St. Lucia
		"659", // St. Kitts and Nevis
		"534", // Sint Maarten
		"663", // St. Martin
		"670", // St. Vincent and Grenadines
		"796", // Turks and Caicos Islands
		"850", // U.S. Virgin Islands
		// Africa
		"024", // Angola
		"204", // Benin
		"072", // Botswana
		"132", // Cabo Verde
		"384", // Côte d'Ivoire
		"818", // Egypt
		"231", // Ethiopia
		"266", // Gabon
		"404", // Kenya
		"480", // Mauritius
		"504", // Morocco
		"516", // Namibia
		"690", // Seychelles
		"710", // South Africa
		"748", // eSwatini (Swaziland)
		"834", // Tanzania
		"788", // Tunisia
		"800", // Uganda
		"894", // Zambia
		"716", // Zimbabwe
		// Middle East
		"376", // Israel
		"634", // Qatar
		"682", // Saudi Arabia
		"784", // United Arab Emirates
		// Asia/Pacific
		"036", // Australia
		"356", // India
		"360", // Indonesia
		"392", // Japan
		"398", // Kazakhstan
		"458", // Malaysia
		"496", // Mongolia
		"554", // New Zealand
		"586", // Pakistan
		"608", // Philippines
		"410", // South Korea
		"144", // Sri Lanka
		"158", // Taiwan
		"764", // Thailand
		"860", // Uzbekistan
		"316", // Guam
		// Europe
		"008", // Albania
		"040", // Austria
		"070", // Bosnia and Herzegovina
		"100", // Bulgaria
		"191", // Croatia
		"196", // Cyprus
		"203", // Czech Republic
		"233", // Estonia
		"246", // Finland
		"250", // France
		"276", // Germany
		"300", // Greece
		"268", // Georgia
		"348", // Hungary
		"352", // Iceland
		"380", // Italy
		"383", // Kosovo
		"428", // Latvia
		"438", // Liechtenstein
		"440", // Lithuania
		"442", // Luxembourg
		"470", // Malta
		"498", // Moldova
		"499", // Montenegro
		"528", // Netherlands
		"616", // Poland
		"620", // Portugal
		"642", // Romania
		"372", // Republic of Ireland
		"674", // San Marino
		"703", // Slovakia
		"705", // Slovenia
		"724", // Spain
		"752", // Sweden
		"756", // Switzerland
		"792", // Turkey
		"804", // Ukraine
		"826", // United Kingdom
	]);

	const tierColors = {
		master: "#0054A6",
		office: "#000e35",
		none: "#D1D3D4",
	};

	// Display names for country lists (may differ from map geography labels).
	const countryLabels = {
		"016": "American Samoa",
		"031": "Azerbaijan (Resale)",
		"048": "Bahrain (Resale)",
		"050": "Bangladesh",
		"051": "Armenia (Resale)",
		"064": "Bhutan",
		"096": "Brunei",
		"104": "Myanmar (Resale)",
		"108": "Burundi",
		"120": "Cameroon",
		"156": "China (Resale)",
		"254": "French Guiana",
		"288": "Ghana (Resale)",
		"344": "Hong Kong (Resale)",
		"400": "Jordan (Resale)",
		"414": "Kuwait (Resale)",
		"417": "Kyrgyzstan",
		"446": "Macau (Resale)",
		"454": "Malawi",
		"512": "Oman (Resale)",
		"524": "Nepal",
		"566": "Nigeria (Resale)",
		"598": "Papua New Guinea",
		"626": "Timor-Leste",
		"646": "Rwanda",
		"702": "Singapore (Resale)",
		"795": "Turkmenistan",
		"008": "Albania",
		"028": "Antigua and Barbuda",
		"032": "Argentina",
		"036": "Australia",
		"040": "Austria",
		"044": "Bahamas",
		"052": "Barbados",
		"068": "Bolivia",
		"070": "Bosnia and Herzegovina",
		"072": "Botswana",
		"076": "Brazil",
		"084": "Belize",
		"092": "British Virgin Islands",
		"100": "Bulgaria",
		"124": "Canada",
		"132": "Cabo Verde",
		"136": "Cayman Islands",
		"144": "Sri Lanka",
		"152": "Chile",
		"158": "Taiwan",
		"170": "Colombia",
		"188": "Costa Rica",
		"191": "Croatia",
		"196": "Cyprus",
		"203": "Czech Republic",
		"204": "Benin",
		"214": "Dominican Republic",
		"218": "Ecuador",
		"222": "El Salvador",
		"024": "Angola",
		"231": "Ethiopia",
		"233": "Estonia",
		"246": "Finland",
		"250": "France",
		"266": "Gabon",
		"268": "Georgia",
		"276": "Germany",
		"300": "Greece",
		"308": "Grenada",
		"316": "Guam",
		"328": "Guyana",
		"340": "Honduras",
		"348": "Hungary",
		"352": "Iceland",
		"356": "India",
		"360": "Indonesia",
		"372": "Republic of Ireland",
		"376": "Israel",
		"380": "Italy",
		"383": "Kosovo",
		"384": "Côte d'Ivoire",
		"388": "Jamaica",
		"392": "Japan",
		"398": "Kazakhstan",
		"404": "Kenya",
		"410": "South Korea",
		"428": "Latvia",
		"438": "Liechtenstein",
		"440": "Lithuania",
		"442": "Luxembourg",
		"458": "Malaysia",
		"470": "Malta",
		"480": "Mauritius",
		"484": "Mexico",
		"496": "Mongolia",
		"498": "Moldova",
		"499": "Montenegro",
		"504": "Morocco",
		"516": "Namibia",
		"528": "Netherlands",
		"531": "Curaçao",
		"533": "Aruba",
		"534": "Sint Maarten",
		"535": "Bonaire",
		"554": "New Zealand",
		"558": "Nicaragua",
		"586": "Pakistan",
		"591": "Panama",
		"600": "Paraguay",
		"604": "Peru",
		"608": "Philippines",
		"616": "Poland",
		"620": "Portugal",
		"630": "Puerto Rico",
		"634": "Qatar",
		"642": "Romania",
		"652": "St. Barthélemy",
		"659": "St. Kitts and Nevis",
		"660": "Anguilla",
		"662": "St. Lucia",
		"663": "St. Martin",
		"670": "St. Vincent and Grenadines",
		"674": "San Marino",
		"682": "Saudi Arabia",
		"690": "Seychelles",
		"703": "Slovakia",
		"705": "Slovenia",
		"710": "South Africa",
		"724": "Spain",
		"740": "Suriname",
		"748": "eSwatini",
		"752": "Sweden",
		"756": "Switzerland",
		"764": "Thailand",
		"780": "Trinidad and Tobago",
		"784": "United Arab Emirates",
		"788": "Tunisia",
		"792": "Turkey",
		"796": "Turks and Caicos Islands",
		"800": "Uganda",
		"804": "Ukraine",
		"818": "Egypt",
		"826": "United Kingdom",
		"834": "Tanzania",
		"840": "United States",
		"850": "U.S. Virgin Islands",
		"858": "Uruguay",
		"860": "Uzbekistan",
		"862": "Venezuela",
		"894": "Zambia",
		"716": "Zimbabwe",
	};

	const wrapper = document.querySelector(".map-wrapper");
	const container = document.getElementById("world-map");
	const tooltip = document.getElementById("map-tooltip");
	const resetBtn = document.getElementById("map-reset");

	if (!wrapper || !container || !tooltip) return;

	const ASPECT = 2;
	const TOPO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";
	const TERRITORIES_URL = "territories.geojson";

	let svg, g, zoom, projection, path, countries;
	let pinnedCountryId = null;
	let hoveredCountryId = null;

	function getTier(id) {
		const key = String(id);
		if (masterCountries.has(key)) return "master";
		if (officeCountries.has(key)) return "office";
		return "none";
	}

	function getFill(id) {
		return tierColors[getTier(id)];
	}

	function showTooltip(name, x, y) {
		tooltip.textContent = name;
		tooltip.hidden = false;
		tooltip.style.left = x + "px";
		tooltip.style.top = y + "px";
	}

	function hideTooltip() {
		tooltip.hidden = true;
	}

	function tooltipPosition(event) {
		const rect = wrapper.getBoundingClientRect();
		const offsetX = 12;
		const offsetY = -28;
		let x = event.clientX - rect.left + offsetX;
		let y = event.clientY - rect.top + offsetY;

		const tipRect = tooltip.getBoundingClientRect();
		const maxX = rect.width - tipRect.width - 8;
		const maxY = rect.height - tipRect.height - 8;
		x = Math.max(8, Math.min(x, maxX));
		y = Math.max(8, Math.min(y, maxY));

		return { x, y };
	}

	function unpin() {
		pinnedCountryId = null;
		hoveredCountryId = null;
		updateSelection();
	}

	function pinCountry(id) {
		pinnedCountryId = id;
		updateSelection();
	}

	function updateSelection() {
		if (g) {
			g.selectAll("path.country").classed("is-pinned", (d) => String(d.id) === String(pinnedCountryId));
		}

		document.querySelectorAll(".map-country-list li").forEach((li) => {
			li.classList.toggle("is-selected", String(li.dataset.countryId) === String(pinnedCountryId));
			li.setAttribute("aria-pressed", String(li.dataset.countryId) === String(pinnedCountryId));
		});

		if (pinnedCountryId) updatePinnedTooltip();
		else hideTooltip();
	}

	function createListItem(id, features) {
		const li = document.createElement("li");
		const label = getCountryLabel(id, features);

		li.textContent = label;
		li.dataset.countryId = id;
		li.setAttribute("role", "button");
		li.setAttribute("aria-pressed", "false");
		li.tabIndex = 0;

		const activate = () => {
			if (String(pinnedCountryId) === String(id)) {
				unpin();
				return;
			}
			pinCountry(id);
			wrapper.scrollIntoView({ behavior: "smooth", block: "center" });
		};

		li.addEventListener("click", activate);
		li.addEventListener("keydown", (event) => {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				activate();
			}
		});

		return li;
	}

	function getCountryLabel(id, features) {
		const key = String(id);
		if (countryLabels[key]) return countryLabels[key];
		const feature = features?.find((d) => String(d.id) === key);
		return feature?.properties?.name || key;
	}

	function renderCountryLists(features) {
		const masterList = document.getElementById("master-country-list");
		const officeList = document.getElementById("office-country-list");
		if (!masterList || !officeList) return;

		const masterIds = [...masterCountries]
			.map((id) => ({ id, label: getCountryLabel(id, features) }))
			.sort((a, b) => a.label.localeCompare(b.label));

		const officeIds = [...officeCountries]
			.filter((id) => !masterCountries.has(id))
			.map((id) => ({ id, label: getCountryLabel(id, features) }))
			.sort((a, b) => a.label.localeCompare(b.label));

		masterList.replaceChildren(...masterIds.map(({ id }) => createListItem(id, features)));
		officeList.replaceChildren(...officeIds.map(({ id }) => createListItem(id, features)));
	}

	function prepareCountries(world, territories) {
		const features = topojson.feature(world, world.objects.countries).features;

		return features
			.filter((d) => !EXCLUDED_TERRITORIES.has(String(d.id)))
			.map((d) => {
				if (d.properties.name === "Kosovo" && !d.id) {
					return { ...d, id: "383" };
				}
				return d;
			})
			.concat(territories?.features || [])
			.sort((a, b) => {
				const aOverlay = OVERLAY_TERRITORIES.has(String(a.id)) ? 1 : 0;
				const bOverlay = OVERLAY_TERRITORIES.has(String(b.id)) ? 1 : 0;
				return aOverlay - bOverlay;
			});
	}

	function getDimensions() {
		const width = wrapper.clientWidth;
		const height = Math.max(400, width / ASPECT);
		return { width, height };
	}

	function renderMap() {
		const { width, height } = getDimensions();

		projection = d3.geoNaturalEarth1().fitSize([width, height], {
			type: "FeatureCollection",
			features: countries,
		});
		path = d3.geoPath().projection(projection);

		svg.attr("viewBox", [0, 0, width, height]);

		const countryPaths = g.selectAll("path.country").data(countries, (d) => d.id);

		countryPaths
			.enter()
			.append("path")
			.attr("class", "country")
			.merge(countryPaths)
			.attr("d", path)
			.attr("fill", (d) => getFill(d.id))
			.attr("data-tier", (d) => getTier(d.id))
			.attr("aria-label", (d) => d.properties.name)
			.on("mouseenter", function (event, d) {
				hoveredCountryId = d.id;
				d3.select(this).classed("is-hovered", true);
				if (!pinnedCountryId) {
					const pos = tooltipPosition(event);
					showTooltip(d.properties.name, pos.x, pos.y);
				}
			})
			.on("mousemove", function (event, d) {
				if (!pinnedCountryId) {
					const pos = tooltipPosition(event);
					showTooltip(d.properties.name, pos.x, pos.y);
				}
			})
			.on("mouseleave", function () {
				hoveredCountryId = null;
				d3.select(this).classed("is-hovered", false);
				if (!pinnedCountryId) hideTooltip();
			})
			.on("click", function (event, d) {
				event.stopPropagation();
				if (String(pinnedCountryId) === String(d.id)) {
					unpin();
					return;
				}
				pinCountry(d.id);
			});

		countryPaths.exit().remove();

		updateSelection();
	}

	function updatePinnedTooltip() {
		if (!pinnedCountryId) return;
		const pinned = countries.find((c) => String(c.id) === String(pinnedCountryId));
		if (!pinned) return;
		const centroid = path.centroid(pinned);
		const transform = d3.zoomTransform(svg.node());
		const x = transform.applyX(centroid[0]);
		const y = transform.applyY(centroid[1]);
		showTooltip(getCountryLabel(pinnedCountryId, countries), x + 8, y - 12);
	}

	function resetZoom() {
		svg.transition().duration(400).call(zoom.transform, d3.zoomIdentity);
		unpin();
	}

	function initZoom() {
		zoom = d3
			.zoom()
			.scaleExtent([1, 8])
			.on("zoom", (event) => {
				g.attr("transform", event.transform);
				updatePinnedTooltip();
			});

		svg.call(zoom);

		svg.on("click", () => {
			if (pinnedCountryId) unpin();
		});
	}

	function init() {
		svg = d3.select(container).append("svg").attr("class", "map-svg");
		g = svg.append("g");

		initZoom();

		resetBtn?.addEventListener("click", resetZoom);

		document.addEventListener("keydown", (event) => {
			if (event.key === "Escape") unpin();
		});

		const resizeObserver = new ResizeObserver(() => {
			renderMap();
		});
		resizeObserver.observe(wrapper);
	}

	Promise.all([d3.json(TOPO_URL), d3.json(TERRITORIES_URL).catch(() => null)])
		.then(([world, territories]) => {
			countries = prepareCountries(world, territories);
			renderCountryLists(countries);
			init();
			renderMap();
		})
		.catch(() => {
			container.innerHTML =
				'<p class="map-error">Unable to load map data. Please try again later.</p>';
		});
})();
