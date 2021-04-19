import * as d3 from "d3";
import * as topojson from "topojson-client";
const spainjson = require("./spain.json");
const d3Composite = require("d3-composite-projections");
import { latLongCommunities } from "./communities";
import { covidMarch2020, covidApril2021, ResultEntry } from "./stats";

const color = d3
  .scaleThreshold<number, string>()
  .domain([0, 50, 100, 250, 500, 1000])
  .range([
    "#FFFFF",
    "#FFE8E5",
    "#F88F70",
    "#CD6A4E",
    "#A4472D",
    "#7B240E",
    "#540000",
  ]);


  const maxApril = covidApril2021.reduce(
    (max, item) => (item.value > max ? item.value : max),
    0
  );
  

  const maxMarch = covidMarch2020.reduce(
    (max, item) => (item.value > max ? item.value : max),
    0
  );
  
  const maxcases = Math.max(maxApril, maxMarch);
  
  const affectedRadiusScale = d3
  .scaleThreshold<number, number>()
  .domain([0, 30, 100, 200, 100000, 300000, 800000])
  .range([0, 5, 10, 15, 20, 35, 45, 50]);

  let datos = covidMarch2020;

  const calculateRadiusBasedOnAffectedCases = (comunidad: string) => {
    const entry = datos.find((item) => item.name === comunidad);
  
    return entry ? affectedRadiusScale(entry.value) : 0;
  };
  
  const aProjection = d3Composite
  .geoConicConformalSpain()
  .scale(3300)
  .translate([500, 400]);
const geoPath = d3.geoPath().projection(aProjection);

const geojson = topojson.feature(spainjson, spainjson.objects.ESP_adm1);

const svg = d3
  .select("body")
  .append("svg")
  .attr("width", 1024)
  .attr("height", 800)
  .attr("style", "background-color: #FBFAF0");

const div = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

svg
  .selectAll("path")
  .data(geojson["features"])
  .enter()
  .append("path")
  .attr("class", "country")
  .attr("d", geoPath as any);

svg
  .selectAll("circle")
  .data(latLongCommunities)
  .enter()
  .append("circle")
  .attr("class", "affected-marker")
  .attr("r", (d) => {
    return calculateRadiusBasedOnAffectedCases(d.name);
  })
  .attr("cx", (d) => aProjection([d.long, d.lat])[0])
  .attr("cy", (d) => aProjection([d.long, d.lat])[1]);

const updateChart = (covid: ResultEntry[]) => {
  datos = covid;
  svg
    .selectAll("circle")
    .data(latLongCommunities)
    .transition()
    .duration(800)
    .attr("r", (d) => {
      return calculateRadiusBasedOnAffectedCases(d.name);
    });
};

updateChart(covidMarch2020);

document.getElementById("covidMarch2020").addEventListener("click", function () {
  updateChart(covidMarch2020);
});

document.getElementById("covidApril2021").addEventListener("click", function () {
  updateChart(covidApril2021);
});








