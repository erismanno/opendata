var api = "http://opendata-visual.ch.tajo.host.ch/api/";
var svg = null;
var bubbles = null;
var nodes = [];
var radiusScale = d3.scale.pow()
    .exponent(0.5)
    .range([5, 70]);
var width = $(window).width(); // Konstanten für die Grösse, initial 1030
var height = $(window).height()-$(".visualisierung__navigation").height(); // Konstanten für die Grösse, initial 1000
var center = { x: width / 2, y: height/2 };  // Locations to move bubbles towards, depending on which view mode is selected.
// Used when setting up force and moving around nodes
var damper = 0.102;
// Beschriftungen
// Messungen nach Monaten
var monthCentersLine1 = 200;
var monthWidth = 80;
var monthCenters = { // Center locations of the bubbles.
    Januar: { x: 120, y: monthCentersLine1 },
    Februar: { x: 190, y: monthCentersLine1 },
    Maerz: { x: 260, y: monthCentersLine1 },
    April: { x: 340, y: monthCentersLine1 },
    Mai: { x: 410, y: monthCentersLine1 },
    Juni: { x: 480, y: monthCentersLine1 },
    Juli: { x: 550, y: monthCentersLine1 },
    August: { x: 620, y: monthCentersLine1 },
    September: { x: 700, y: monthCentersLine1 },
    Oktober: { x: 770, y: monthCentersLine1 },
    November: { x: 850, y: monthCentersLine1 },
    Dezember: { x: 920, y: monthCentersLine1 }
};

var monthTitleX = {  // X locations of the year titles.
    'Jan.': 1*monthWidth,
    'Feb.': 2*monthWidth,
    'Mar.': 3*monthWidth,
    'Apr.': 4*monthWidth,
    'Mai.': 5*monthWidth,
    'Jun.': 6*monthWidth,
    'Jul.': 7*monthWidth,
    'Aug.': 8*monthWidth,
    'Sep.': 9*monthWidth,
    'Okt.': 10*monthWidth,
    'Nov.': 11*monthWidth,
    'Dez.': 12*monthWidth
};

// Messung nach Jahren
var yearCentersY = 200;
var yearCenters = { // Center locations of the bubbles.
    2013: { x: 200, y: yearCentersY },
    2014: { x: 360, y: yearCentersY },
    2015: { x: 520, y: yearCentersY },
    2016: { x: 670, y: yearCentersY },
    2017: { x: 830, y: yearCentersY }
};

var yearsTitleX = { // X locations of the year titles.
    2013: (width/6)*1,
    2014: (width/6)*2,
    2015: (width/6)*3,
    2016: (width/6)*4,
    2017: (width/6)*5
};

var yearsTitleLine1 = 65;
var yearsTitleY = { // X locations of the year titles.
    2013: yearsTitleLine1,
    2014: yearsTitleLine1,
    2015: yearsTitleLine1,
    2016: yearsTitleLine1,
    2017: yearsTitleLine1
};

// Messung nach Konzentration/Bubble-Grösse
var durationCentersLine1 = 200;
var durationCenters = { // Center locations of the bubbles.
    'verylow': { x: 140, y: durationCentersLine1 },
    'low': { x: 360, y: durationCentersLine1 },
    'medium': { x: 620, y: durationCentersLine1 },
    'high': { x: 850, y: durationCentersLine1 }
};

var durationTitleX = { // X locations of the year titles.
    'Sehr Tief': 100,
    'Tief': 340,
    'Mittel': 620,
    'Hoch': 870
};

// Messung nach Parameter
var totalNumberOfParameters = 19;

var parameterX = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var parameterY = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

var typeGridWidth = 300;
var typeGridHeight = 300;

var typeCenterLine1 = 150*height/1000;
var typeCenterLine2 = 300*height/1000;
var typeCenterLine3 = 425*height/1000;

var typeCenterColumn1 = width/1030*110;
var typeCenterColumn2 = width/1030*250;
var typeCenterColumn3 = width/1030*360;
var typeCenterColumn4 = width/1030*480;
var typeCenterColumn5 = width/1030*590;
var typeCenterColumn6 = width/1030*730;
var typeCenterColumn7 = width/1030*900;

var typeCenters = { // Center locations of the bubbles.
    Anionen: { x: parameterX[0], y: parameterY[0] },
    Arzneimittel: { x: parameterX[1], y: parameterY[1] },
    BTEX: { x: parameterX[2], y: parameterY[2] },
    Einzelstoffe: { x: parameterX[3], y: parameterY[3] },
    Haerte: { x: parameterX[4], y: parameterY[4] },
    Kationen: { x: parameterX[5], y: parameterY[5] },
    Komplexbildner: { x: parameterX[6], y: parameterY[6] },
    LHKW: { x: parameterX[7], y: parameterY[7] },
    Metabolite: { x: parameterX[8], y: parameterY[8] },
    Metalle: { x: parameterX[9], y: parameterY[9] },
    Organochlorverbindungen: { x: parameterX[10], y: parameterY[10] },
    Organozinnverbindungen: { x: parameterX[11], y: parameterY[11] },
    PAK: { x: parameterX[12], y: parameterY[12] },
    PCB: { x: parameterX[13], y: parameterY[13] },
    Pestizide: { x: parameterX[14], y: parameterY[14] },
    Phthalate: { x: parameterX[15], y: parameterY[15] },
    Roentgenkontrastmittel: { x: parameterX[16], y: parameterY[16] },
    Suessstoffe: { x: parameterX[17], y: parameterY[17] },
    Summenparameter: { x: parameterX[18], y: parameterY[18] }
};

var typeTitleX = {  // X locations of the year titles.
    'Anionen': parameterX[0],
    'Arzneimittel': parameterX[1],
    'BTEX':  parameterX[2],
    'Einzelstoffe': parameterX[3],
    'Haerte': parameterX[4],
    'Kationen': parameterX[5],
    'Komplexbildner': parameterX[6],
    'LHKW': parameterX[7],
    'Metabolite': parameterX[8],
    'Metalle': parameterX[9],
    'Organochlorverbindungen': parameterX[10],
    'Organozinnverbindungen': parameterX[11],
    'PAK': parameterX[12],
    'PCB': parameterX[13],
    'Pestizide': parameterX[14],
    'Phthalate': parameterX[15],
    'Roentgenkontrastmittel': parameterX[16],
    'Suessstoffe': parameterX[17],
    'Summenparameter': parameterX[18]
};

var typeTitleYLine1 = 50*height/1000;
var typeTitleYLine2 = 200*height/1000;
var typeTitleYLine3 = 350*height/1000;
var typeTitleY = {  // Y locations of the year titles.
    'Anionen': parameterY[0],
    'Arzneimittel': parameterY[1],
    'BTEX':  parameterY[2],
    'Einzelstoffe': parameterY[3],
    'Haerte': parameterY[4],
    'Kationen': parameterY[5],
    'Komplexbildner': parameterY[6],
    'LHKW': parameterY[7],
    'Metabolite': parameterY[8],
    'Metalle': parameterY[9],
    'Organochlorverbindungen':  parameterY[10],
    'Organozinnverbindungen': parameterY[11],
    'PAK': parameterY[12],
    'PCB': parameterY[13],
    'Pestizide': parameterY[14],
    'Phthalate': parameterY[15],
    'Roentgenkontrastmittel': parameterY[16],
    'Suessstoffe': parameterY[17],
    'Summenparameter': parameterY[18]
};

// Messungen nach Wochentag
var weekdayCentersY = 200;
var weekdayCenters = { // Center locations of the bubbles.
    'Montag': { x: 110, y: weekdayCentersY },
    'Dienstag': { x: 250, y: weekdayCentersY },
    'Mittwoch': { x: 360, y: weekdayCentersY },
    'Donnerstag': { x: 470, y: weekdayCentersY },
    'Freitag': { x: 600, y: weekdayCentersY },
    'Samstag': { x: 730, y: weekdayCentersY },
    'Sonntag': { x: 900, y: weekdayCentersY },
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