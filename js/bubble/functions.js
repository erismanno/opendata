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
var colors = palette(['tol-rainbow','cbf'], 18).map(function(d){
	return "#"+d;
});
var fillColor = d3.scale.ordinal()
    .domain(['Anionen', 'Arzneimittel', 'BTEX', 'Einzelstoffe', 'Kationen', 'Komplexbildner', 'LHKW', 'Metabolite','Metalle', 'Organochlorverbindungen', 'Organozinnverbindungen', 'PAK', 'PCB', 'Pestizide', 'Phthalate', 'Roentgenkontrastmittel', 'Suessstoffe', 'Summenparameter'])
    .range(colors);

var currParameter;
/* Tooltip-Funktion*/
function showDetail(d) {
    if(d.parameter !== currParameter) {
        currParameter = d.parameter;

        d3.select(this).attr('stroke', 'black');

        if (+d.konzentration > 1000) {
            var wert = Math.round(+d.konzentration / 1000) + " Tonnen pro Tag";
        } else if (+d.konzentration < 5) {
            var wert = Math.round(+d.konzentration * 1000) + " Gramm pro Tag";
        } else {
            var wert = Math.round(+d.konzentration) + " KG pro Tag";
        }

        var content = '<span class="name">Parameter: </span><span class="value">' +
            d.parameter.replace(/ *\([^)]*\) */g, "") +
            '</span><br/>' +
            '<span class="name">Gruppe: </span><span class="value">' +
            d.gruppe +
            '</span><br/>' +
            '<span class="name">Durchschnittliche Fracht: </span><span class="value">' +
            wert +
	    '<br/>Dieser Wert wurde in '+(+d.messungen_nichtnull)+' von '+((+d.messungen_nichtnull)+(+d.messungen_null))+' erfolgten Messungen im Wasser gefunden.'
            +'</span><br><span class="tooltip__duckduckgo"></span>'
            +'<br/>Auf Kreis klicken, um nach '+d.parameter.replace(/ *\([^)]*\) */g, "")+' zu googlen.';
        tooltip2.showtooltip2(content, d3.event);

        $(".modal__parameter").text(d.parameter.replace(/ *\([^)]*\) */g, ""));
        $(".modal__gruppe").text(d.gruppe);
        $(".modal__fracht").text(wert);

        $.ajax({
            dataType: "json",
            url: "https://api.duckduckgo.com/?q=" + d.parameter.replace(/ *\([^)]*\) */g, "") + "&format=json&pretty=1&atb=v102-5&kl=ch-de"
        }).done(function (data) {
            if(data.AbstractText!==""){
                console.log(data.AbstractText);
                $(".modal__duckduckgo").text(data.AbstractText);
                $(".tooltip__duckduckgo").text(data.AbstractText);
                $(".tooltip__duckduckgo").html("<br>"+$(".tooltip__duckduckgo").html()+"<br>");
            }
        });
    }
}

function hideDetail(d) { // tooltip verstecken
    currParameter = "";
    d3.select(this)
        .attr('stroke', d3.rgb(fillColor(d.gruppe)).darker());
    tooltip2.hidetooltip2();
}

function showModal(d) {
    //$('#myModal').modal('show');
    window.open('https://www.google.com/search?q='+d.parameter.replace(/ *\([^)]*\) */g, ""), '_blank');
}

/* Initiale Ansicht: "Single group mode".
        Sets visualization in "single group mode".
        The other labels are hidden and the force layout tick
        function is set to move all nodes to the center of the visualization. */

function groupBubbles() {
    $('svg').height('auto');
    hideType();

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

// Messung nach Typ

function splitBubblesintoType() {
    $('svg').height(typeHeight);
    showType();

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
            d.x = d.x + (target.x - d.x) * damper * alpha;
            d.y = d.y + (target.y - d.y) * damper * alpha;
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
        .attr('text-anchor', 'middle')
        .text(function (d) { return d; });
    type.attr('x', function (d) { return typeTitleX[d]; })
        .attr('y', function (d) { return typeTitleY[d]; })
}

function compareNumbers(a, b)
{
    return a - b;
}

window.onresize = function(event) {
    resize();
    if($(".visualisierung__nachtypgruppieren").is(':checked')){
        splitBubblesintoType();
    }else{
        groupBubbles();
    }
};

function resize()
{
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();

    center = { x: windowWidth / 2, y: windowHeight/2 };
    var numberOfColums = Math.floor(windowWidth/parameterGridWidth);
    if (numberOfColums < 1) {numberOfColums = 1;}
    var numberOfRows = Math.ceil(totalNumberOfParameters/numberOfColums);
    var marginLeft = (windowWidth-(numberOfColums*parameterGridWidth))/2;
    if (marginLeft < 0) {marginLeft = 0;}
    $('svg').width(windowWidth);
    typeHeight = numberOfRows * parameterGridHeight;
    //console.log("Height: " + windowHeight + " Width: " +  windowWidth + " NumberOfColums: " + numberOfColums + " NumberOfRows: " + numberOfRows);
    var parameterIndex = 0;
    for (var i = 0; i < numberOfRows; i++) {
        for(var j = 0; j < numberOfColums; j++) {
            if(parameterIndex < totalNumberOfParameters){
                parameterX[parameterIndex] = marginLeft+j*parameterGridWidth;
                parameterY[parameterIndex] = i*parameterGridHeight;
                console.log(parameterAssoc[parameterIndex]);
                typeCenters[parameterAssoc[parameterIndex]]['x'] = bubblesCenterMarginLeft + parameterX[parameterIndex];
                typeCenters[parameterAssoc[parameterIndex]]['y'] = parameterY[parameterIndex] + bubblesCenterMarginTop;
                typeTitleX[parameterAssoc[parameterIndex]] = bubblesCenterMarginLeft + parameterX[parameterIndex];
                typeTitleY[parameterAssoc[parameterIndex]] = 20+parameterY[parameterIndex];
                parameterIndex++;
            }
        }
    }
}
