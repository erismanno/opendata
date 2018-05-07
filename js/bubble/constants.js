var svg = null;
var bubbles = null;
var nodes = [];
var radiusScale = d3.scale.pow()
    .exponent(0.5)
    .range([5, 100]);
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
var typeCenterLine1 = 150;
var typeCenterLine2 = 300;
var typeCenterLine3 = 425;

var typeCenterColumn1 = width/1030*110;
var typeCenterColumn2 = width/1030*250;
var typeCenterColumn3 = width/1030*360;
var typeCenterColumn4 = width/1030*480;
var typeCenterColumn5 = width/1030*590;
var typeCenterColumn6 = width/1030*730;
var typeCenterColumn7 = width/1030*900;

var typeCenters = { // Center locations of the bubbles.
    Anionen: { x: typeCenterColumn1, y: typeCenterLine1 },
    Arzneimittel: { x: typeCenterColumn2, y: typeCenterLine1 },
    BTEX: { x: typeCenterColumn3, y: typeCenterLine1 },
    Einzelstoffe: { x: typeCenterColumn4, y: typeCenterLine1 },
    Haerte: { x: typeCenterColumn5, y: typeCenterLine1 },
    Kationen: { x: typeCenterColumn6, y: typeCenterLine1 },
    Komplexbildner: { x: typeCenterColumn7, y: typeCenterLine1 },
    LHKW: { x: typeCenterColumn1, y: typeCenterLine2 },
    Metabolite: { x: typeCenterColumn2, y: typeCenterLine2 },
    Metalle: { x: typeCenterColumn3, y: typeCenterLine2 },
    Organochlorverbindungen: { x: typeCenterColumn4, y: typeCenterLine2 },
    Organozinnverbindungen: { x: typeCenterColumn5, y: typeCenterLine2 },
    PAK: { x: typeCenterColumn6, y: typeCenterLine2 },
    PCB: { x: typeCenterColumn7, y: typeCenterLine2 },
    Pestizide: { x: typeCenterColumn1, y: typeCenterLine3 },
    Phthalate: { x: typeCenterColumn2, y: typeCenterLine3 },
    Roentgenkontrastmittel: { x: typeCenterColumn3, y: typeCenterLine3 },
    Suessstoffe: { x: typeCenterColumn4, y: typeCenterLine3 },
    Summenparameter: { x: typeCenterColumn5, y: typeCenterLine3 }
};

var typeTitleX = {  // X locations of the year titles.
    'Anionen': width/1030*75,
    'Arzneimittel': width/1030*220,
    'BTEX':  width/1030*340,
    'Einzelstoffe': width/1030*470,
    'Haerte': width/1030*600,
    'Kationen': width/1030*750,
    'Komplexbildner': width/1030*930,
    'LHKW': width/1030*75,
    'Metabolite': width/1030*220,
    'Metalle': width/1030*340,
    'Organochlorverbindungen': width/1030*470,
    'Organozinnverbindungen': width/1030*600,
    'PAK': width/1030*750,
    'PCB': width/1030*930,
    'Pestizide': width/1030*75,
    'Phthalate': width/1030*220,
    'Roentgenkontrastmittel': width/1030*340,
    'Suessstoffe': width/1030*470,
    'Summenparameter': width/1030*600
};

var typeTitleYLine1 = 50;
var typeTitleYLine2 = 200;
var typeTitleYLine3 = 350;
var typeTitleY = {  // Y locations of the year titles.
    'Anionen': typeTitleYLine1,
    'Arzneimittel': typeTitleYLine1,
    'BTEX':  typeTitleYLine1,
    'Einzelstoffe': typeTitleYLine1,
    'Haerte': typeTitleYLine1,
    'Kationen': typeTitleYLine1,
    'Komplexbildner': typeTitleYLine1,
    'LHKW': typeTitleYLine2,
    'Metabolite': typeTitleYLine2,
    'Metalle': typeTitleYLine2,
    'Organochlorverbindungen':  typeTitleYLine2 + 10,
    'Organozinnverbindungen': typeTitleYLine2 - 10,
    'PAK': typeTitleYLine2,
    'PCB': typeTitleYLine2,
    'Pestizide': typeTitleYLine3,
    'Phthalate': typeTitleYLine3,
    'Roentgenkontrastmittel': typeTitleYLine3,
    'Suessstoffe': typeTitleYLine3,
    'Summenparameter': typeTitleYLine3
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