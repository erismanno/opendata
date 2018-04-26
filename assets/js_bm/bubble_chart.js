d3.csv('assets/data/bm_bubbles_back.csv', display); // Daten laden
setupButtons(); // Button Setup

//* ------------------------------------------------------------------
//
// Teil 1 - Allgemeiner Code
//
// Initialisierungs-Code und Helfer-Funktionen um eine neue Bubble-Chart-Instanz zu 
// erstellen, um die Daten zu laden und um die Daten darzustellen
//
// -----------------------------------------------------------------*/

var myBubbleChart = bubbleChart();

/* Funktion display ruft die Bubble-Chart Funktion auf und stellt sie im #vis div dar. Wird nach dem laden der Daten aus dem CSV gecallt. */
function display(error, data) {
  if (error) {
    console.log(error);
  }
  myBubbleChart('#vis', data);
}

/* Setup der Layout Buttons damit zwischen den Ansichten getogglet werden kann */
function setupButtons() {
  d3.select('#toolbar')
    .selectAll('.button')
    .on('click', function () {
      d3.selectAll('.button').classed('active', false); // Remove active class from all buttons 
      var button = d3.select(this); // Find the button just clicked
      button.classed('active', true); // Set it as the active button
      var buttonId = button.attr('id'); // Get the id of the button
      myBubbleChart.toggleDisplay(buttonId); // Toggle the bubble chart based on the currently clicked button.
    });
}

/* Helper-Funktion zum konvertieren von Zahlen in einen String mit Kommas für schönere Darstellung */
function addCommas(nStr) {
  nStr += '';
  var x = nStr.split('.');
  var x1 = x[0];
  var x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }
  return x1 + x2;
}

//* ------------------------------------------------------------------
//
// Teil 2 - Funktion für die Erstellung der Bubble Chart
//
// -----------------------------------------------------------------*/

/* Funktion für die Erstellung der Bubble Chart. Returned eine Funktion, welche eine neue Bubble Chart erstellt, gegeben ein DOM-Element zur Darstellung und gegeben ein Datenset zur Visualisierung. */

function bubbleChart() {
  
//* ------------------------------------------------------------------
//
// Teil 3 - Beschriftungen
//
// -----------------------------------------------------------------*/


    
//* ------------------------------------------------------------------
//
// Teil 4 - Datenmanipulation (csv into JS)
//
// -----------------------------------------------------------------*/
    








  

/* This data manipulation function takes the raw data from the CSV file and converts it into an array of node objects. Each node will store data and visualization values to visualize a bubble. rawData is expected to be an array of data objects, read in from one of d3's loading functions like d3.csv. This function returns the new node array, with a node in that array for each element in the rawData input. */
    
  //create Nodes

/* Main entry point to the bubble chart. This function is returned by the parent closure. It prepares the rawData for visualization and adds an svg element to the provided selector and starts the visualization creation process. selector is expected to be a DOM element or CSS selector that points to the parent element of the bubble chart. Inside this element, the code will add the SVG continer for the visualization. rawData is expected to be an array of data objects as provided by a d3 loading function like d3.csv. */
    
  var chart = function chart(selector, rawData) {
    
/* Use the max duration in the data as the max in the scale's domain. note we have to ensure the duration is a number by converting it with `+`. */

    var maxAmount = d3.max(rawData, function (d) { return +d.konz; });
    radiusScale.domain([0, maxAmount*50]);

    nodes = createNodes(rawData);
    // Set the force's nodes to our newly created nodes array.
    force.nodes(nodes);

/* Create a SVG element inside the provided selector with desired size. */
      
    svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // Bind nodes data to what will become DOM elements to represent them.
    bubbles = svg.selectAll('.bubble')
      .data(nodes, function (d) { return d.id; });

    // Create new circle elements each with class `bubble`.
    // There will be one circle.bubble for each object in the nodes array.
    // Initially, their radius (r attribute) will be 0.
    bubbles.enter().append('circle')
      .classed('bubble', true)
      .attr('r', 0)
      .attr('fill', function (d) { return fillColor(d.type); })
      .attr('stroke', function (d) { return d3.rgb(fillColor(d.type)).darker(); })
      .attr('stroke-width', 2)
      .on('mouseover', showDetail)
      .on('mouseout', hideDetail);

    // Fancy transition to make bubbles appear, ending with the
    // correct radius
    bubbles.transition()
      .duration(2000)
      .attr('r', function (d) { return d.radius; });

    // initiales layout = single group.
    groupBubbles();
  };

//* ------------------------------------------------------------------
//
// Teil 5 - Initiale Ansicht, alle Störungen: "Single group mode"
//
// -----------------------------------------------------------------*/

/* Sets visualization in "single group mode". The other labels are hidden and the force layout tick function is set to move all nodes to the center of the visualization. */
    
  function groupBubbles() {
    hideLines();
    hideYears();
    hideDuration();
    hideType();
    hideWeekday();

    force.on('tick', function (e) {
      bubbles.each(moveToCenter(e.alpha))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
    });

    force.start();
  }

/* Helfer-Funktion für den "single group mode". Returned eine Funktion, welche die Daten nimmt für einen Node und die Positionsdaten des Nodes so anpasst, dass er in die Mitte der Visualisierung geht.  

Die Positionierung basiert auf dem alpha Parameter des force layouts und wird kleiner, je länger das force layout läuft. Damit wird die bewegung der nodes verringert, je näher sie ihrem Ziel sind und erlaubt so anderen kräften wie der anziehungskraft der nodes auch die finale Positionen zu bestimmen. */
    
  function moveToCenter(alpha) {
    return function (d) {
      d.x = d.x + (center.x - d.x) * damper * alpha;
      d.y = d.y + (center.y - d.y) * damper * alpha;
    };
  }

//* ------------------------------------------------------------------
//
// Teil 6 - Störungen nach Linien
//
// -----------------------------------------------------------------*/
    
  function splitBubblesintoLines() {
    showLines();
    hideYears();
    hideDuration();
    hideType();
    hideWeekday();

    force.on('tick', function (e) {
      bubbles.each(moveToLines(e.alpha))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
    });

    force.start();
  } 
    
  function moveToLines(alpha) {
    return function (d) {
      var target = lineCenters[d.month];
      d.x = d.x + (target.x - d.x) * damper * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * damper * alpha * 1.1;
    };
  }
    
  function hideLines() {
    svg.selectAll('.line').remove();
  }

  function showLines() {
      
    var linesData = d3.keys(linesTitleX);
    var lines = svg.selectAll('.line')
      .data(linesData);

    lines.enter().append('text')
      .attr('class', 'line')
      .attr('x', function (d) { return linesTitleX[d]; })
      .attr('y', 65)
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; });
  }

//* ------------------------------------------------------------------
//
// Teil 7 - Störungen nach Jahren
//
// -----------------------------------------------------------------*/
 
  function splitBubblesintoYears() {
    showYears();
    hideLines();
    hideDuration();
    hideType();
    hideWeekday();

    force.on('tick', function (e) {
      bubbles.each(moveToYears(e.alpha))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
    });

    force.start();
  }
    
  function moveToYears(alpha) {
    return function (d) {
      var target = yearCenters[d.year];
      d.x = d.x + (target.x - d.x) * damper * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * damper * alpha * 1.1;
    };
  }

  function hideYears() {
    svg.selectAll('.year').remove();
  }

  function showYears() {

    var yearsData = d3.keys(yearsTitleX);
    var years = svg.selectAll('.year')
      .data(yearsData);

    years.enter().append('text')
      .attr('class', 'year')
      .attr('x', function (d) { return yearsTitleX[d]; })
       .attr('y', function (d) { return yearsTitleY[d]; })
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; });
  }

//* ------------------------------------------------------------------
//
// Teil 8 - Störungen nach Störungsdauer
//
// -----------------------------------------------------------------*/
 
  function splitBubblesintoDuration() {
    showDuration();
    hideYears();
    hideLines();
    hideType();
    hideWeekday();

    force.on('tick', function (e) {
      bubbles.each(moveToDuration(e.alpha))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
    });

    force.start();
  }
    
  function moveToDuration(alpha) {
    return function (d) {
      var target = durationCenters[d.duration];
      d.x = d.x + (target.x - d.x) * damper * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * damper * alpha * 1.1;
    };
  }

  function hideDuration() {
    svg.selectAll('.duration').remove();
  }

  function showDuration() {

    var durationData = d3.keys(durationTitleX);
    var duration = svg.selectAll('.duration')
      .data(durationData);

    duration.enter().append('text')
      .attr('class', 'duration')
      .attr('x', function (d) { return durationTitleX[d]; })
      .attr('y', 65)
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; });
    }
  
//* ------------------------------------------------------------------
//
// Teil 9 - Störungen nach Störungsart
//
// -----------------------------------------------------------------*/
    
  function splitBubblesintoType() {
    showType();
    hideYears();
    hideLines();
    hideDuration();
    hideWeekday();

    force.on('tick', function (e) {
      bubbles.each(moveToType(e.alpha))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
    });

    force.start();
  }
    
  function moveToType(alpha) {
    return function (d) {
      var target = typeCenters[d.type];
      d.x = d.x + (target.x - d.x) * damper * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * damper * alpha * 1.1;
    };
  }

  function hideType() {
    svg.selectAll('.type').remove();
  }

  function showType() {
 
    var typeData = d3.keys(typeTitleX);
    var type = svg.selectAll('.type')
      .data(typeData);

    type.enter().append('text')
      .attr('class', 'type')
      .attr('x', function (d) { return typeTitleX[d]; })
      .attr('y', function (d) { return typeTitleY[d]; })
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; });
    }

//* ------------------------------------------------------------------
//
// Teil 10 - Störungen nach Wochentag
//
// -----------------------------------------------------------------*/
    
  function splitBubblesintoWeekday() {
    showWeekday();
    hideType();
    hideYears();
    hideLines();
    hideDuration();

    force.on('tick', function (e) {
      bubbles.each(moveToWeekday(e.alpha))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
    });

    force.start();
  }

  function moveToWeekday(alpha) {
    return function (d) {
      var target = weekdayCenters[d.weekday];
      d.x = d.x + (target.x - d.x) * damper * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * damper * alpha * 1.1;
    };
  }

  function hideWeekday() {
    svg.selectAll('.weekday').remove();
  }

  function showWeekday() {

    var weekdayData = d3.keys(weekdayTitleX);
    var type = svg.selectAll('.weekday')
      .data(weekdayData);

    type.enter().append('text')
      .attr('class', 'weekday')
      .attr('x', function (d) { return weekdayTitleX[d]; })
      .attr('y', 65)
      .attr('text-anchor', 'middle')
      .text(function (d) { return d; });
    }

//* ------------------------------------------------------------------
//
// Teil 11 - Wechseln zwischen den Ansichten
//
// -----------------------------------------------------------------*/
    
  /* Externally accessible function (this is attached to the returned chart function). Allows the visualization to toggle between "single group" and "split by ..." modes. */

  chart.toggleDisplay = function (displayName) {
    if (displayName === 'line') {
      splitBubblesintoLines();
    } else if (displayName === 'year') {
      splitBubblesintoYears();
    } else if (displayName === 'duration') {
      splitBubblesintoDuration();
    } else if (displayName === 'type') {
      splitBubblesintoType();
    } else if (displayName === 'weekday') {
      splitBubblesintoWeekday();
    } else {
      groupBubbles();
    }
  };

  chart.toggleDisplay2 = function (displayName2) {
    if (displayName === 'line') {
      splitBubblesintoLines();
    } else {
      groupBubbles();
    }
  };
    
  return chart;
}

// Ende der Funktion

//* ------------------------------------------------------------------
//
// Teil 12 - Tooltip
//
// -----------------------------------------------------------------*/

  // Tooltip für Mousover
  var tooltip2 = floatingtooltip2('gates_tooltip2', 240);

  var fillColor = d3.scale.ordinal()
    .domain(['Anionen', 'Arzneimittel', 'BTEX', 'Einzelstoffe', 'Haerte', 'Kationen', 'Komplexbildner', 'LHKW', 'Metabolite','Metalle', 'Organochlorverbindungen', 'Organozinnverbindungen', 'PAK', 'PCB', 'Pestizide', 'Phthalate', 'Roentgenkontrastmittel', 'Suessstoffe', 'Summenparameter'])
    .range(['#03A9F4', '#FF5722', '#727272', '#4CAF50', '#FFEB3B', '#303F9F', '#CD003C', '#8BC34A', '#795548', '#FFC107', '#87925d', '#42325d', '#CDDC39', '#9C27B0', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000']);

  /* Tooltip-Funktion*/
  function showDetail(d) {

    d3.select(this).attr('stroke', 'black');

    var content = '<span class="name">Parameter: </span><span class="value">' +
                  d.parameter +
                  '</span><br/>' +
                  '<span class="name">Gruppe: </span><span class="value">' +
                  d.gruppe +
                  '</span><br/>' +
                  '<span class="name">Monat: </span><span class="value">' +
                  d.month +
                  '</span><br/>' +
                  '<span class="name">Jahr: </span><span class="value">' +
                  d.year +
                  '</span><br/>' +
                  '<span class="name">Details: </span><span class="value">' +
                  d.details +
                  '</span><br/>' +
                  '<span class="name">Konzentration: </span><span class="value">' +
                  d.konzentration +
                  '</span><br/>';
    tooltip2.showtooltip2(content, d3.event);
  }

function hideDetail(d) { // tooltip verstecken
    d3.select(this)
        .attr('stroke', d3.rgb(fillColor(d.type)).darker());
    tooltip2.hidetooltip2();
}

//* ------------------------------------------------------------------
//
// The End
//
// -----------------------------------------------------------------*/


var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
output.innerHTML = slider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
    output.innerHTML = this.value;
    d3.csv('assets/data/bm_bubbles_'+this.value+'.csv', update); // Daten laden
}

// These will be set in create_nodes and create_vis
var svg = null;
var bubbles = null;
var nodes = [];
var width = 1030; // Konstanten für die Grösse
var height = 1000; // Konstanten für die Grösse
var center = { x: width / 2, y: height / 2 };  // Locations to move bubbles towards, depending on which view mode is selected.
// Used when setting up force and moving around nodes
var damper = 0.102;


// Störungen nach Linien
    
  var lineCenters = { // Center locations of the bubbles. 
    Januar: { x: 215, y: height / 2 },
    Februar: { x: 270, y: height / 2 },
    Maerz: { x: 325, y: height / 2 },
    April: { x: 380, y: height / 2 },
    Mai: { x: 435, y: height / 2 },
    Juni: { x: 490, y: height / 2 },
    Juli: { x: 545, y: height / 2 },
    August: { x: 600, y: height / 2 },
    September: { x: 660, y: height / 2 },
    Oktober: { x: 720, y: height / 2 },
    November: { x: 775, y: height / 2 },
    Dezember: { x: 830, y: height / 2 }
  };

  var linesTitleX = {  // X locations of the year titles.
    'Januar': 48,
    'Februar': 130,
    'Maerz': 227,
    'April': 313,
    'Mai': 400,
    'Juni': 500,
    'Juli': 583,
    'August': 658,
    'September': 732,
    'Oktober': 802,
    'November': 898,
    'Dezember': 988
  };
 
// Störungen nach Jahren
    
var yearCenters = { // Center locations of the bubbles.
    2013: { x: (width/6)*1, y: height / 2 },
    2014: { x: (width/6)*2, y: height / 2 },
    2015: { x: (width/6)*3, y: height / 2 },
    2016: { x: (width/6)*4, y: height / 2 },
    2017: { x: (width/6)*5, y: height / 2 }
  };

var yearsTitleX = { // X locations of the year titles.
    2013: (width/6)*1,
    2014: (width/6)*2,
    2015: (width/6)*3,
    2016: (width/6)*4,
    2017: (width/6)*5
  };

var yearsTitleY = { // X locations of the year titles.
    2013: 65,
    2014: 65,
    2015: 65,
    2016: 65,
    2017: 65
  };
    
// Störungen nach Störungsdauer/Bubble-Grösse

var durationCenters = { // Center locations of the bubbles.
    'verylow': { x: 250, y: height / 2 },
    'low': { x: 400, y: height / 2 },
    'medium': { x: 600, y: height / 2 },
    'high': { x: 750, y: height / 2 }
  };

var durationTitleX = { // X locations of the year titles.
    'Kürzer als 30 Minuten': 100,
    '30 Minuten - 2 Stunden': 340,
    '2 Stunden - 12 Stunden': 620,
    'Länger als 12 Stunden': 870
  };
    
// Störungen nach Störungsart
    
var typeCenters = { // Center locations of the bubbles. 
    Anionen: { x: 200, y: 325 },
    Arzneimittel: { x: 200, y: 275 },
    BTEX: { x: 300, y: 325 },
    Einzelstoffe: { x: 300, y: 275 },
    Haerte: { x: 400, y: 325 },
    Kationen: { x: 400, y: 275 },
    Komplexbildner: { x: 500, y: 300 },
    LHKW: { x: 600, y: 325 },
    Metabolite: { x: 600, y: 275 },
    Metalle: { x: 700, y: 325 },
    Organochlorverbindungen: { x: 700, y: 275 },
    Organozinnverbindungen: { x: 800, y: 325 },
    PAK: { x: 800, y: 275 },
    PCB: { x: 800, y: 275 },
    Pestizide: { x: 800, y: 275 },
    Phthalate: { x: 800, y: 275 },
    Roentgenkontrastmittel: { x: 800, y: 275 },
    Suessstoffe: { x: 800, y: 275 },
    Summenparameter: { x: 800, y: 275 }
  };

var typeTitleX = {  // X locations of the year titles.
    'Anionen': 75,
    'Arzneimittel': 220,
    'BTEX':  340,
    'Einzelstoffe': 470,
    'Haerte': 600,
    'Kationen': 750,
    'Komplexbildner': 930,
    'LHKW': 75,
    'Metabolite': 220,
    'Metalle': 340,
    'Organochlorverbindungen': 470,
    'Organozinnverbindungen': 600,
    'PAK': 750,
    'PCB': 930,
    'Pestizide': 75,
    'Phthalate': 220,
    'Roentgenkontrastmittel': 340,
    'Suessstoffe': 470,
    'Summenparameter': 600
  };
 
var typeTitleY = {  // Y locations of the year titles.
    'Anionen': 75,
    'Arzneimittel': 75,
    'BTEX':  75,
    'Einzelstoffe': 75,
    'Haerte': 75,
    'Kationen': 75,
    'Komplexbildner': 75,
    'LHKW': 525,
    'Metabolite': 525,
    'Metalle': 525,
    'Organochlorverbindungen': 525,
    'Organozinnverbindungen': 525,
    'PAK': 525,
    'PCB': 525,
    'Pestizide': 750,
    'Phthalate': 750,
    'Roentgenkontrastmittel': 750,
    'Suessstoffe': 750,
    'Summenparameter': 750
  };

// Störungen nach Wochentag
    
var weekdayCenters = { // Center locations of the bubbles. 
    'Montag': { x: 200, y: height / 2 },
    'Dienstag': { x: 300, y: height / 2 },
    'Mittwoch': { x: 400, y: height / 2 },
    'Donnerstag': { x: 500, y: height / 2 },
    'Freitag': { x: 600, y: height / 2 },
    'Samstag': { x: 700, y: height / 2 },
    'Sonntag': { x: 800, y: height / 2 },
  };

var weekdayTitleX = {  // X locations of the year titles.
    'Montag': 75,
    'Dienstag': 220,
    'Mittwoch': 340,
    'Donnerstag': 470,
    'Freitag': 600,
    'Samstag': 750,
    'Sonntag': 930,
  };



function update(error, data) {
    //var nodes_2 = createNodes(data);
    //force.nodes(nodes_2);
    nodes.map(function(d,i){
       d['konzentration'] = data[i]['konz'];
        
        d['radius'] = radiusScale(+data[i]['konz']);
        
    });
    console.log(nodes);
    svg.selectAll('.bubble').data(nodes, function (d) { return d.id; })
        .transition()
        .duration(2000)
        .attr('r', function (d) { return d.radius; });   
}

var createNodes = function (rawData) {
 
/* Use map() to convert raw data into node data. Checkout http://learnjsdata.com/ for more on working with data. */
      
    var myNodes = rawData.map(function (d) {
      return {
        id: d.id,
        radius: radiusScale(+d.konz), // Berechnung Radius für bubbles
        konzentration: d.konz, // Ansicht nach Konzentration
        group: d.kategorie, // Darstellung
        duration: d.kategorie, // Ansicht nach Störungsdauer
        month: d.monat,
        year: d.jahr,
        type: d.gruppe,  //vorfall
        weekday: d.wochentag,
        details: d.details,  
        parameter: d.parameter,
        gruppe: d.gruppe,
        x: 250,//Math.random() * 900,
        y: 250//Math.random() * 800
      };
    });
    
    // sort them to prevent occlusion of smaller nodes.
    myNodes.sort(function (a, b) { return b.konz - a.konz; });
    
   

    return myNodes;
  }

// Sizes bubbles based on their area instead of raw radius
  var radiusScale = d3.scale.pow()
    .exponent(0.5)
    .range([2, 75]);

/* Here we create a force layout and configure it to use the charge function from above. This also sets some contants to specify how the force layout should behave. More configuration is done below. */ 
  var force = d3.layout.force()
    .size([width, height])
    .charge(charge)
    .gravity(-0.01)
    .friction(0.9);

/* Charge function that is called for each node. Charge is proportional to the diameter of the circle (which is stored in the radius attribute of the circle's associated data. This is done to allow for accurate collision detection with nodes of different sizes. Charge is negative because we want nodes to repel. Dividing by 8 scales down the charge to be appropriate for the visualization dimensions. */
function charge(d) {
    return -Math.pow(d.radius, 2.0) / 6;
}
