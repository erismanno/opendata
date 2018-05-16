// Daten laden
d3.csv(api+'get.php?year=2017', display);
/* Here we create a force layout and configure it to use the charge function from above.
This also sets some contants to specify how the force layout should behave. */
var force = d3.layout.force()
    .size([width, height])
    .charge(charge)
    .gravity(-0.0001)
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
        rawData.sort(function(x, y){
            return d3.ascending(x.id, y.id);
        });
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
            year: d.jahr,
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
        var alleFrachtWerte = rawData.map(function(d,i){
            return d.konz;
        }).filter(function(val){
            return val > 0;
        }).sort(compareNumbers);
        $(".visualisierung__range").slider({
              range: true,
              step: 1,
              min: 0,
              max: alleFrachtWerte.length-1,
              values: [ 0, alleFrachtWerte.length-1 ],
              slide: function( event, ui ) {
                  werteBereich(alleFrachtWerte[ui.values[0]],alleFrachtWerte[ui.values[1]]);
              }
        });
          $(".visualisierung__kugelgroesse").slider({
              range: true,
              min: 5,
              max: 70,
              values: [5, 70],
              slide: function( event, ui ) {
                  console.log(ui.values[0]+","+ui.values[1]);
                  radiusScale.range([ui.values[0], ui.values[1]]);
                  redrawCurrentChart();
              }
          });

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
          .attr('fill', function (d) { return fillColor(d.gruppe); })
          .attr('stroke', function (d) { return d3.rgb(fillColor(d.gruppe)).darker(); })
          .attr('stroke-width', 2)
          .on('mouseover', showDetail)
          .on('mouseout', hideDetail)
          .on('click', showModal);

        // Fancy transition to make bubbles appear, ending with the
        // correct radius
        bubbles.transition()
          .duration(2000)
          .attr('r', function (d) { return d.radius; });

        // initiales layout = single group.
        groupBubbles();
        resize();
      };


    //* ------------------------------------------------------------------
    //
    // Teil 11 - Wechseln zwischen den Ansichten
    //
    // -----------------------------------------------------------------*/

      /* Externally accessible function (this is attached to the returned chart function).
      Allows the visualization to toggle between "single group" and "split by ..." modes. */

      chart.toggleDisplay = function (displayName) {
        if (displayName === 'type') {
          splitBubblesintoType();
        } else {
          groupBubbles();
        }
      };

      return chart;
}

$(".visualisierung__nachtypgruppieren").on("change", function(){
    if($(this).is(':checked')){
        splitBubblesintoType();
    }else{
        groupBubbles();
    }
});


//* ------------------------------------------------------------------
//
// Year Slider
//
// -----------------------------------------------------------------*/

var slider = document.getElementsByClassName("visualisierung__jahr")[0];

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
    d3.csv(api+'get.php?year='+this.value, update); // Daten laden
}

function redrawCurrentChart(){
    svg.selectAll('.bubble').data(nodes, function (d) { return d.id; })
        .transition()
        .duration(2000)
        .attr('r', function (d) {
            if(+d.konzentration>0&&+d.radius>0){
                d.radius = radiusScale(+d.konzentration);
            }
            console.log(d.radius);
            return d.radius;
        })
        .attr('fill', function (d) { return fillColor(d.gruppe); })
        .attr('stroke', function (d) { return d3.rgb(fillColor(d.gruppe)).darker(); });
    force.start();
}

function update(error, data) {
    console.log(data);
    var maxAmount = d3.max(data, function (d) { return +d.konz; });
    radiusScale.domain([0, maxAmount]);
    data.sort(function(x, y){
        return d3.ascending(x.id, y.id);
    });
    nodes.map(function(d,i){
        if(d['id']!=data[i]['id']){
            console.log(d['id']+":"+data[i]['id']);
        }
        d['id'] = data[i]['id'];
        d['parameter'] = data[i]['parameter'];
        d['jahr'] = data[i]['jahr'];
        d['konzentration'] = data[i]['konz'];
        d['gruppe'] = data[i]['gruppe'];
        if(+data[i]['konz']>0){
            d['radius'] = radiusScale(+data[i]['konz']);
        }else{
            d['radius'] = 0;
        }
        return d;
    });
    force.start();
    svg.selectAll('.bubble').data(nodes, function (d) { return d.id; })
        .transition()
        .duration(2000)
        .attr('r', function (d) { return d.radius; })
        .attr('fill', function (d) { return fillColor(d.gruppe); })
        .attr('stroke', function (d) { return d3.rgb(fillColor(d.gruppe)).darker(); });
    var alleFrachtWerte = data.map(function(d,i){
        return d.konz;
    }).filter(function(val){
        return val > 0;
    }).sort(compareNumbers);
    $(".visualisierung__range").slider({
        range: true,
        step: 1,
        min: 0,
        max: alleFrachtWerte.length-1,
        values: [ 0, alleFrachtWerte.length-1 ],
        slide: function( event, ui ) {
            werteBereich(alleFrachtWerte[ui.values[0]],alleFrachtWerte[ui.values[1]]);
        }
    });
}

// Wertebereich
function werteBereich(min, max){
    radiusScale.domain([min, max]);
    console.log("min"+min+"max"+max);
    nodes = nodes.map(function(d){
        if(+d.konzentration < min || +d.konzentration > max){
            var neu = d;
            neu.radius = 0;
            return neu;
        }else{
            d.radius = radiusScale(+d.konzentration);
            return d;
        }
    });
    bubbles.transition()
        .duration(2000)
        .attr('r', function (d) { return d.radius; });
    force.start();
}