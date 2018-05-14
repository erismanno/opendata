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
var parameterAssoc = [
    'Anionen',
    'Arzneimittel',
    'BTEX',
    'Einzelstoffe',
    'Haerte',
    'Kationen',
    'Komplexbildner',
    'LHKW',
    'Metabolite',
    'Metalle',
    'Organochlorverbindungen',
    'Organozinnverbindungen',
    'PAK',
    'PCB',
    'Pestizide',
    'Phthalate',
    'Roentgenkontrastmittel',
    'Suessstoffe',
    'Summenparameter'
];

var parameterGridWidth = 300;
var parameterGridHeight = 300;

var bubblesCenterMarginLeft = 0.5*parameterGridWidth;
var bubblesCenterMarginTop = 0.5*parameterGridHeight;



var typeCenters = { // Center locations of the bubbles.
    Anionen: { x: 0, y: 0 },
    Arzneimittel: { x: 0, y: 0 },
    BTEX: { x: 0, y: 0 },
    Einzelstoffe: { x: 0, y: 0 },
    Haerte: { x: 0, y: 0 },
    Kationen: { x: 0, y: 0 },
    Komplexbildner: { x: 0, y: 0 },
    LHKW: { x: 0, y: 0 },
    Metabolite: { x: 0, y: 0 },
    Metalle: { x: 0, y: 0 },
    Organochlorverbindungen: { x: 0, y: 0 },
    Organozinnverbindungen: { x: 0, y: 0 },
    PAK: { x: 0, y: 0 },
    PCB: { x: 0, y: 0 },
    Pestizide: { x: 0, y: 0 },
    Phthalate: { x: 0, y: 0 },
    Roentgenkontrastmittel: { x: 0, y: 0 },
    Suessstoffe: { x: 0, y: 0 },
    Summenparameter: { x: 0, y: 0 }
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