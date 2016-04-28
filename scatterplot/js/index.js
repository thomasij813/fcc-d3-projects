"use strict";

// Establish constants for chart formating
var margin = { top: 20, right: 30, bottom: 30, left: 40 },
    width = 750 - margin.right - margin.left,
    height = 500 - margin.top - margin.bottom;

// Scales, axes, and the time formatter for parsing dates
var xScale = d3.scale.linear().range([0, width]);
var yScale = d3.scale.linear().range([0, height]);

var timeFormat = d3.time.format("%H:%M");
var formatMinutes = function formatMinutes(d) {
  var t = new Date(2016, 0, 1, 0, d);
  t.setSeconds(t.getSeconds() + d);
  return timeFormat(t);
};

var xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickFormat(formatMinutes);

var yAxis = d3.svg.axis().scale(yScale).orient('left');

var chart = d3.select('.chart');

var graph = chart.append('svg').attr('height', height + margin.top + margin.bottom).attr('width', width + margin.left + margin.right).attr('class', 'graph').append('g').attr('transform', "translate(" + margin.left + ", " + margin.top + ")");

var tip = d3.tip().attr('class', 'd3-tip').direction(function (d) {
  var direction = 'n';
  if (d.Place < 4) {
    direction = 'e';
  }
  if (d.Place > 25) {
    direction = 's';
  }
  return direction;
}).offset(function (d) {
  var offset = [-5, 0];
  if (d.Place < 4) {
    offset = [0, 5];
  }
  if (d.Place > 25) {
    offset = [5, 0];
  }
  return offset;
}).html(function (d) {
  var name = d.Name;
  var nationality = d.Nationality;
  var year = d.Year;
  var time = d.Time;
  var doping = d.Doping;
  return "\n      <div>\n        <p>" + name + ": " + nationality + "</p>\n        <p>Year: " + year + ", Time: " + time + "</p>\n        <br/>\n        <p>" + doping + "</p>\n      </div>\n    ";
});

graph.call(tip);

d3.json('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json', function (err, data) {
  if (err) console.warn(err);

  var times = data.map(function (d) {
    return d.Seconds;
  });
  var fastestTime = d3.min(times);
  var slowestTime = d3.max(times);
  var minSeparation = slowestTime - fastestTime;

  data = data.map(function (obj) {
    obj.behind = obj.Seconds - fastestTime;
    return obj;
  });

  xScale.domain([0, minSeparation + 50]);
  yScale.domain([data.length, 0]);

  var dot = graph.selectAll('.dot').data(data).enter().append('circle').attr('class', function (d) {
    return d.Doping ? 'dot doping' : 'dot';
  }).attr('cy', function (d) {
    return yScale(d.Place);
  }).attr('cx', function (d) {
    return xScale(d.behind);
  }).attr('r', 4).on('mouseover', tip.show).on('mouseleave', tip.hide);

  var label = graph.selectAll('.label').data(data).enter().append('text').attr('class', 'label').attr('x', function (d) {
    return xScale(d.behind) + 10;
  }).attr('y', function (d) {
    return yScale(d.Place) + 5;
  }).text(function (d) {
    return d.Name;
  });

  var legend = graph.append('g').attr('class', 'legend');

  legend.append('circle').attr('class', 'dot doping').attr('cx', 25).attr('cy', 25).attr('r', 4);

  legend.append('text').attr('x', 35).attr('y', 31).attr('class', 'legend-text').text('With doping allegations');

  legend.append('circle').attr('class', 'dot').attr('cx', 25).attr('cy', 50).attr('r', 4);

  legend.append('text').attr('x', 35).attr('y', 56).attr('class', 'legend-text').text('Without doping allegations');

  graph.append('g').attr('class', 'x axis').attr('transform', "translate(0, " + height + ")").call(xAxis).append('text').attr('y', 30).attr('x', width / 2).style("text-anchor", "middle").text('Minutes behind fastest time');

  graph.append('g').attr('class', 'y axis').call(yAxis).append('text').attr('x', height / 2 * -1).attr('y', -30).attr("transform", "rotate(-90)").text('Rank');
});