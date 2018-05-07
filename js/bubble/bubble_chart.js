// Daten laden
d3.csv('http://localhost:8000/get.php?year=2017', display); 
setupButtons(); // Button Setup
/* Here we create a force layout and configure it to use the charge function from above.
This also sets some contants to specify how the force layout should behave. */
var force = d3.layout.force()
    .size([width, height])
    .charge(charge)
    .gravity(-0.01)
    .friction(0.9);
var myBubbleChart = bubbleChart();



/* Funktion für die Erstellung der Bubble Chart.
Returned eine Funktion, welche eine neue Bubble Chart erstellt, gegeben ein DOM-Element
zur Darstellung und gegeben ein Datenset zur Visualisierung. */

function bubbleChart() {
    /* This data manipulation function takes the raw data from the CSV file and converts
    it into an array of node objects. Each node will store data and visualization values
    to visualize a bubble. rawData is expected to be an array of data objects, read in
    from one of d3's loading functions like d3.csv. This function returns the new node array,
    with a node in that array for each element in the rawData input. */

    var createNodes = function (rawData) {

    /* Use map() to convert raw data into node data. Checkout http://learnjsdata.com/ for more on working with data. */

        var myNodes = rawData.map(function (d) {
            var rad;
            if(+d.konz>0){
                rad = radiusScale(+d.konz);
            }else{
                rad = 0;
            }
          return {
            id: d.id,
            radius: rad, // Berechnung Radius für bubbles
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

    /* Main entry point to the bubble chart. This function is returned by the parent closure. It prepares the rawData for visualization and adds an svg element to the provided selector and starts the visualization creation process. selector is expected to be a DOM element or CSS selector that points to the parent element of the bubble chart. Inside this element, the code will add the SVG continer for the visualization. rawData is expected to be an array of data objects as provided by a d3 loading function like d3.csv. */

      var chart = function chart(selector, rawData) {

    /* Use the max duration in the data as the max in the scale's domain. note we have to ensure the duration is a number by converting it with `+`. */

        var maxAmount = d3.max(rawData, function (d) { return +d.konz; });
        radiusScale.domain([0, maxAmount]);
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
    // Teil 11 - Wechseln zwischen den Ansichten
    //
    // -----------------------------------------------------------------*/

      /* Externally accessible function (this is attached to the returned chart function). Allows the visualization to toggle between "single group" and "split by ..." modes. */

      chart.toggleDisplay = function (displayName) {
          console.log("asdf");
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


//* ------------------------------------------------------------------
//
// Year Slider
//
// -----------------------------------------------------------------*/

var slider = document.getElementsByClassName("visualisierung__darstellungsjahr")[0];
var output = document.getElementsByClassName("visualisierung__darstellungsjahrlabel")[0];
output.innerHTML = slider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
    output.innerHTML = this.value;
    d3.csv('http://localhost:8000/get.php?year='+this.value, update); // Daten laden
}

function update(error, data) {
    console.log(data.length);
    var maxAmount = d3.max(data, function (d) { return +d.konz; });
    radiusScale.domain([0, maxAmount]);
    console.log(maxAmount);
    nodes.map(function(d,i){
        d['konzentration'] = data[i]['konz'];
        if(+data[i]['konz']>0){
            d['radius'] = radiusScale(+data[i]['konz']);
        }else{
            d['radius'] = 0;
        }
    });
    force.start();
    svg.selectAll('.bubble').data(nodes, function (d) { return d.id; })
        .transition()
        .duration(2000)
        .attr('r', function (d) { return d.radius; });   
}
