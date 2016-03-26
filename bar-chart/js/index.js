'use strict';

// Establish constants for chart formating
var margin = { top: 20, right: 30, bottom: 30, left: 40 },
    width = 1000 - margin.right - margin.left,
    height = 500 - margin.top - margin.bottom;

// Scales, axes, and the time formatter for parsing dates
var xScale = d3.time.scale().rangeRound([0, width]);
var yScale = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis().scale(xScale).orient('bottom');

var yAxis = d3.svg.axis().scale(yScale).orient('left');

var timeFormat = d3.time.format('%Y-%m-%d');

// Setting up the chart title and SVG that will hold the graph 
var chart = d3.select('.chart');

var tile = chart.append('h1').attr('class', 'title').text('Quarterly United States GDP (1947 - 2015)');

var graph = chart.append('svg').attr('height', height + margin.top + margin.bottom).attr('width', width + margin.left + margin.right).append('g').attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');

// Tooltips
var tip = d3.tip().offset([-20, 0]).attr('class', 'd3-tip').html(function (d) {
  var currencyOptions = { style: 'currency', currency: 'USD' };
  var currency = d[1].toLocaleString('en-us', currencyOptions);

  var date = timeFormat.parse(d[0]);
  var dateOptions = { year: 'numeric', month: 'long' };
  var dateDisplay = date.toLocaleString('en-US', dateOptions);

  return '<span>' + currency + ' Billion</span>\n      <br />\n      <small>' + dateDisplay + '</small>';
});

graph.call(tip);

// The data is a JSON file served remotely
d3.json('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json', function (err, res) {
  if (err) return console.warn(err);

  var data = res.data;

  // Domains for the scales previously defined
  var dates = data.map(function (record) {
    return timeFormat.parse(record[0]);
  });
  xScale.domain([d3.min(dates), d3.max(dates)]);
  yScale.domain([0, d3.max(data, function (d) {
    return d[1];
  })]);

  var bar = graph.selectAll('.bar').data(data).enter().append('rect').attr('class', 'bar').attr('x', function (d) {
    return xScale(timeFormat.parse(d[0]));
  }).attr('y', function (d) {
    return yScale(d[1]);
  }).attr('height', function (d) {
    return height - yScale(d[1]);
  }).attr('width', 4).on('mouseover', tip.show).on('mouseleave', tip.hide);

  // Ensures that the xAxis will have ticks that are five years apart
  xAxis.ticks(dates.length / 4 / 5);

  // Add the axes
  graph.append('g').attr('class', 'x axis').attr('transform', 'translate(0, ' + height + ')').call(xAxis);

  graph.append('g').attr('class', 'y axis').call(yAxis).append('text').attr('transform', 'rotate(-90)').attr('y', 6).attr('dy', '.71em').style('text-anchor', 'end').text('GDP, in billions');

  //Adds description below the graph
  var description = chart.append('div').attr('class', 'description').style('max-width', '1000px').append('small').text(res.description);
});