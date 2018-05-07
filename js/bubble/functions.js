/* Charge function that is called for each node. Charge is proportional to the diameter of the circle (which is stored in the radius attribute of the circle's associated data. This is done to allow for accurate collision detection with nodes of different sizes. Charge is negative because we want nodes to repel. Dividing by 8 scales down the charge to be appropriate for the visualization dimensions. */
function charge(d) {
    return -Math.pow(d.radius, 2.0) / 6;
}
/* Funktion display ruft die Bubble-Chart Funktion auf und stellt sie im .visualisierung__svgcontainer dar. Wird nach dem laden der Daten aus dem CSV gecallt. */
function display(error, data) {
    if (error) {
        console.log(error);
    }
    myBubbleChart('.visualisierung__svgcontainer', data);
}
/* Setup der Layout Buttons damit zwischen den Ansichten getogglet werden kann */
function setupButtons() {
    d3.select('.visualisierung__darstellungstyp')
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

/* Initiale Ansicht: "Single group mode".
        Sets visualization in "single group mode".
        The other labels are hidden and the force layout tick
        function is set to move all nodes to the center of the visualization. */

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

/* Helfer-Funktion für den "single group mode".
 Returned eine Funktion, welche die Daten nimmt für einen Node und die Positionsdaten des Nodes so anpasst,
 dass er in die Mitte der Visualisierung geht.
Die Positionierung basiert auf dem alpha Parameter des force layouts und wird kleiner,
je länger das force layout läuft. Damit wird die bewegung der nodes verringert,
je näher sie ihrem Ziel sind und erlaubt so anderen kräften wie der anziehungskraft
der nodes auch die finale Positionen zu bestimmen. */

function moveToCenter(alpha) {
    return function (d) {
        d.x = d.x + (center.x - d.x) * damper * alpha;
        d.y = d.y + (center.y - d.y) * damper * alpha;
    };
}

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
        var target = monthCenters[d.month];
        d.x = d.x + (target.x - d.x) * damper * alpha * 1.1;
        d.y = d.y + (target.y - d.y) * damper * alpha * 1.1;
    };
}

function hideLines() {
    svg.selectAll('.line').remove();
}

function showLines() {

    var linesData = d3.keys(monthTitleX);
    var lines = svg.selectAll('.line')
        .data(linesData);

    lines.enter().append('text')
        .attr('class', 'line')
        .attr('x', function (d) { return monthTitleX[d]; })
        .attr('y', 65)
        .attr('text-anchor', 'middle')
        .text(function (d) { return d; });
}

//* ------------------------------------------------------------------
//
// Teil 7 - Messung nach Jahren
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
// Teil 8 - Messung nach Konzentration
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
// Teil 9 - Messung nach Monat
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
        if(d.gruppe != "NULL"){
            var target = typeCenters[d.gruppe];
            console.log(d.gruppe);
            d.x = d.x + (target.x - d.x) * damper * alpha * 1.1;
            d.y = d.y + (target.y - d.y) * damper * alpha * 1.1;
        }
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
// Teil 10 - Messung nach Wochentag
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
