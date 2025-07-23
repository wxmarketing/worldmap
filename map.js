// 地图配置
const mapConfig = {
  width: 960,
  height: 500,
  scale: 150,
  minZoom: 1,
  maxZoom: 8,
  initialScale: 150,
  initialTranslate: [480, 250]
};

// 地图变量
let svg, g, path, zoom, countries;
let currentZoom = { k: 1, x: 0, y: 0 };
let selectedCountry = null;

// 初始化地图
function initMap() {
  // 设置SVG容器
  svg = d3.select("#world-map")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${mapConfig.width} ${mapConfig.height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  // 创建地图元素分组
  g = svg.append("g");

  // 定义投影（墨卡托）
  const projection = d3.geoMercator()
    .scale(mapConfig.scale)
    .translate([mapConfig.width / 2, mapConfig.height / 2]);

  // 定义路径生成器
  path = d3.geoPath().projection(projection);

  // 设置缩放行为
  zoom = d3.zoom()
    .scaleExtent([mapConfig.minZoom, mapConfig.maxZoom])
    .on("zoom", handleZoom);

  // 应用缩放到SVG
  svg.call(zoom);

  // 初始定位
  g.attr("transform", `translate(${mapConfig.initialTranslate[0]},${mapConfig.initialTranslate[1]}) scale(${mapConfig.initialScale/100})`);

  // 加载并显示世界地图
  loadWorldMap();

  // 设置重置按钮
  d3.select("#reset-zoom").on("click", resetZoom);
}

// 加载世界地图数据
function loadWorldMap() {
  d3.json("https://unpkg.com/world-atlas@2/countries-110m.json")
    .then(data => {
      const worldData = topojson.feature(data, data.objects.countries);
      countries = g.selectAll(".country")
        .data(worldData.features)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", path)
        .attr("data-id", d => d.id)
        .attr("data-name", d => d.properties.name)
        .on("click", handleCountryClick);
    })
    .catch(error => {
      console.error("Error loading map data:", error);
    });
}

// 处理缩放事件
function handleZoom(event) {
  currentZoom = event.transform;
  g.attr("transform", event.transform);
}

// 重置缩放到初始状态
function resetZoom() {
  svg.transition()
    .duration(750)
    .call(zoom.transform, d3.zoomIdentity);
  if (selectedCountry) {
    d3.select(selectedCountry).classed("selected", false);
    selectedCountry = null;
  }
  d3.select("#country-detail").classed("hidden", true);
}

// 缩放到指定国家
function zoomToCountry(d) {
  const bounds = path.bounds(d);
  const dx = bounds[1][0] - bounds[0][0];
  const dy = bounds[1][1] - bounds[0][1];
  const x = (bounds[0][0] + bounds[1][0]) / 2;
  const y = (bounds[0][1] + bounds[1][1]) / 2;
  const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / mapConfig.width, dy / mapConfig.height)));
  const translate = [mapConfig.width / 2 - scale * x, mapConfig.height / 2 - scale * y];
  svg.transition()
    .duration(750)
    .call(
      zoom.transform,
      d3.zoomIdentity
        .translate(translate[0], translate[1])
        .scale(scale)
    );
}

// 获取国家代码（支持中英文）
function getCountryCode(countryName) {
  // 这里建议保留原有映射逻辑
  const countryMapping = {
    "United States of America": "US",
    "United States": "US",
    "United Kingdom": "GB",
    "Germany": "DE",
    "France": "FR",
    "Japan": "JP",
    "China": "CN",
    "India": "IN",
    "Brazil": "BR",
    "Russia": "RU",
    "Australia": "AU",
    "Canada": "CA",
    "Spain": "ES",
    "Italy": "IT",
    "South Korea": "KR",
    "Mexico": "MX",
    "Argentina": "AR",
    "Chile": "CL",
    "Colombia": "CO",
    "Peru": "PE",
    "Venezuela": "VE",
    "Netherlands": "NL",
    "Belgium": "BE",
    "Switzerland": "CH",
    "Austria": "AT",
    "Sweden": "SE",
    "Norway": "NO",
    "Denmark": "DK",
    "Finland": "FI",
    "Poland": "PL",
    "Czech Republic": "CZ",
    "Hungary": "HU",
    "Romania": "RO",
    "Ukraine": "UA",
    "Turkey": "TR",
    "Egypt": "EG",
    "South Africa": "ZA",
    "Nigeria": "NG",
    "Kenya": "KE",
    "Morocco": "MA",
    "Algeria": "DZ",
    "Tunisia": "TN",
    "Saudi Arabia": "SA",
    "United Arab Emirates": "AE",
    "Israel": "IL",
    "Iran": "IR",
    "Iraq": "IQ",
    "Afghanistan": "AF",
    "Pakistan": "PK",
    "Bangladesh": "BD",
    "Sri Lanka": "LK",
    "Myanmar": "MM",
    "Thailand": "TH",
    "Vietnam": "VN",
    "Cambodia": "KH",
    "Laos": "LA",
    "Malaysia": "MY",
    "Singapore": "SG",
    "Indonesia": "ID",
    "Philippines": "PH",
    "Taiwan": "TW",
    "Hong Kong": "HK",
    "Mongolia": "MN",
    "Kazakhstan": "KZ",
    "Uzbekistan": "UZ",
    // ...（省略部分映射，可补充完整）...
    "美国": "US",
    "英国": "GB",
    "德国": "DE",
    "法国": "FR",
    "日本": "JP",
    "中国": "CN",
    "印度": "IN",
    "巴西": "BR",
    "俄罗斯": "RU",
    "澳大利亚": "AU",
    "加拿大": "CA",
    "西班牙": "ES",
    "意大利": "IT",
    "韩国": "KR",
    "南韩": "KR",
    "墨西哥": "MX",
    "阿根廷": "AR",
    "智利": "CL",
    "哥伦比亚": "CO",
    "秘鲁": "PE",
    "委内瑞拉": "VE",
    // ...（省略部分映射，可补充完整）...
  };
  return countryMapping[countryName] || countryName;
}

// 处理国家点击事件，集成app.js的onCountryClick
function handleCountryClick(event, d) {
  event.stopPropagation();
  if (selectedCountry) {
    d3.select(selectedCountry).classed("selected", false);
  }
  selectedCountry = this;
  d3.select(this).classed("selected", true);
  zoomToCountry(d);
  const countryName = d.properties.name;
  const countryCode = getCountryCode(countryName);
  // 调用app.js的onCountryClick（需保证app.js已加载）
  if (typeof window.onCountryClick === 'function') {
    window.onCountryClick(countryName, countryCode);
  } else if (typeof onCountryClick === 'function') {
    onCountryClick(countryName, countryCode);
  } else {
    // 兼容旧逻辑
    updateCountryDetail(countryName, countryCode);
  }
}

document.addEventListener("DOMContentLoaded", initMap); 