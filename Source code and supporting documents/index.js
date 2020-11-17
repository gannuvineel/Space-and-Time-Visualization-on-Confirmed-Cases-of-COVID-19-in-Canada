
// imports the required modules
import { 
  select, 
  json, 
  html,
  csv,
  max,
  geoPath, 
  geoMercator, 
  scaleOrdinal,
  scaleTime,
  scaleLinear,
  scaleBand,
  extent,
  axisLeft,
  axisBottom,
  line,
  curveBasis
  } from 'd3';
import { feature } from 'topojson';
import { colorLegend } from './colorLegend';


// Creation and Initialization of different constants and variables 
const zoom                 = d3.zoom().on('zoom', () => {
                                  d3.select('svg').attr('transform', d3.event.transform);
                             });
const svg                  = d3.select('svg').style('background','#ffffff');
const g                    = svg.append('g'); 
const div                  = d3.select("body")
                               .append("div")  
                               .attr("class", "tooltip")
                               .style("opacity", 0).call(zoom).on("dblclick.zoom",null);
const titleText            = 'Confirmed COVID Cases in Canada';
const width                = +svg.attr('width');
const height               = +svg.attr('height');
const projection           = d3.geoMercator();
const pathGenerator        = d3.geoPath().projection(projection);
const margin               = { top: 20, right: 40, bottom: 88, left: 150 };
const innerWidth           = width - margin.left - margin.right;
const innerHeight          = height - margin.top - margin.bottom; 

var RegionID               = 0;
var Regions                = [];
var RegionPopulation       = [0, 2438318, 8552362, 14784526, 7034339, 5161477];
var Male                   = [0, 0, 0, 0, 0, 0];
var Female                 = [0, 0, 0, 0, 0, 0];
var GenderNotStated        = [0, 0, 0, 0, 0, 0];
var RegionCount            = [0, 0, 0, 0, 0, 0];
var NormalizedRegionCount  = [0, 0, 0, 0, 0, 0];
var Recovered              = [0, 0, 0, 0, 0, 0];
var NotRecovered           = [0, 0, 0, 0, 0, 0];
var RecoveryNotStated      = [0, 0, 0, 0, 0, 0];
var RegionNames            = ['', 'Atlantic', 'Quebec', 'Ontario and Nunavut', 'Prairies and the Northwest Territories', 'British Columbia and Yukon'];
var colorScale             = null;
var filteredLineData       = {}
var filteredBarGraphData   = {}
var lineChartg             = null;
var BarGraphg              = null;
var SelectedRegionID       = null;


// Appends the title text to the group element 'g'
g.append('div'); 
g.append("text")
 .attr("x", (innerWidth / 2))             
 .attr("y", 40)
 .attr("text-anchor", "middle")  
 .style("font-size", "26px")
 .html(titleText);

// renderBarGraphData const variable is used to render the bar graph
const renderBarGraphData = (BarGraphData, data) => {

    // Different consts and variables are created and initialized.
    const barGraphTitle     = 'Confirmed COVID Cases by Age Group';
    const BarGraphWidth     = 700;
    const BarGraphHeight    = 300;
    const xValue            = d => d.age_group;
    const xValueDescription = d => d.age_group_description;
    const xAxisLabel        = 'Age Group (in years)';
    const yValue            = d => d.count;
    const circleRadius      = 6;
    const yAxisLabel        = 'Confirmed Cases';
    const innerWidth        = BarGraphWidth - margin.left - margin.right;
    const innerHeight       = BarGraphHeight - margin.top - margin.bottom;
    const xScale            = scaleBand()
                                    .domain(BarGraphData.map(xValueDescription))
                                    .range([0, innerWidth]);
    const yScale            = scaleLinear()
                                    .domain(extent(BarGraphData, yValue))
                                    .range([innerHeight, 0])
                                    .nice();
   
    // BarGraphg is appended to 'g' and is displayed on the screen. 
    BarGraphg               = d3.select('svg').append('g')
                                .attr('id', +data.RegionID)
                                .attr('transform', `translate(${margin.left + 375},${margin.top + 280}) scale(0.6, 0.6)`)
                                .attr('opacity',0.9);  
    
    // xAxis const is initialized with the ticks.
    const xAxis             = axisBottom(xScale)
                                .tickSize(-innerHeight)
                                .tickPadding(15)
                                .ticks(11);
    // yAxis const is initialized with the ticks.
    const yAxis             = axisLeft(yScale)
                                .tickSize(-innerWidth)
                                .tickPadding(10);
  
    const yAxisG            = BarGraphg.append('g').call(yAxis);
    
    // div const is used to display the tooltip.
    const div               = d3.select("body").append("div").data(BarGraphData)
                                .attr("class", "barChartTooltip")
                                .style("opacity", 0);
    
    // yAxis label is appended to the yAxis.
    yAxisG.append('text')
          .attr('class', 'bargraph-axis-label')
          .attr('y', -50)
          .attr('x', -innerHeight / 2)
          .attr('fill', 'black')
          .attr('transform', `rotate(-90)`)
          .attr('text-anchor', 'middle')
          .text(yAxisLabel);
  
    const xAxisG = BarGraphg.append('g').call(xAxis)
                            .attr('transform', `translate(0, ${innerHeight})`);
    
    // xAxis tick labels are tilted by 45 degrees.
    xAxisG.selectAll("text")  
          .style("text-anchor", "end")
          .attr("transform", "rotate(-45)");
  
    // xAxis label is appended to the xAxis.
    xAxisG.append('text')
          .attr('class', 'bargraph-axis-label')
          .attr('y', 80)
          .attr('x', innerWidth/2)
          .attr('fill', 'black')
          .text(xAxisLabel); 
    
    // Rectangular bars are placed at different positions.
    BarGraphg.selectAll('rect').data(BarGraphData)
                               .enter().append('rect')
                               .attr('x', d => xScale(xValueDescription(d)) + xScale.bandwidth()/4)
                               .attr('id', d => xValueDescription(d))
                               .attr('y',d=> yScale(yValue(d)))
                               .attr('width', xScale.bandwidth()/2)
                               .attr('height', d=> innerHeight- yScale(yValue(d)))
                               .attr('fill', colorScale(NormalizedRegionCount[+data.RegionID]))
                               .on('mouseover', function(d) {     // When user hovers on a rectangular bar
       
                                     // Sets an ID to the rectangular bar tooltip.
                                     div.attr("id", d.age_group_description);  
                                     
                                     // Sets the background colour to the rectangular bar tooltip and displays
                                     // the content in tooltip.
                                     div.style("left", d3.event.pageX - 30 + "px")    
                                        .style("top",  d3.event.pageY + "px")
                                        .style("opacity", 0.9)
                                        .style('background','#fee0d2')
                                        .html("<table>" +
                      
                                           "<tr>" +
                                            "<th style='width: 60%';>Age Group:</th>" + 
                                            "<td style='width: 40%';>" + d.age_group_description + " years" + "</td>" +
                                          "</tr>" +
                                          
                                          "<tr>" +
                                            "<th style='width: 60%';>Confirmed Cases:</th>" + 
                                            "<td style='width: 40%';>" + d.count + "</td>" +
                                          "</tr>" +
                                      
                                         "</table>"
                                         );
                         
                                     // Sets the background colour to the rectangular bar tooltip of id "Not stated" and displays
                                     // the content in tooltip.
                                     d3.selectAll('[id="Not stated"]')
                                       .style("left", d3.event.pageX - 50 + "px")    
                                       .style("top",  d3.event.pageY + "px")
                                       .style('background', '#edf8e9')
                                       .html("<table>" +
                                                
                                                "<tr>" +
                                                 "<p>Age group data is not stated for " + d.count + " confirmed cases. </p>" +
                                                "</tr>" +
                                                
                                               "</table>"
                                               );
                              })
                              .on('mouseout', function(d) {       // When the user mouseouts from the rectangular bar
                                       div.style("opacity", 0);   // Tooltip is hidden
                              });
    
    // Appends the title of the bar graph.
    BarGraphg.append('text')
      .attr('class', 'lineChartTitle')
      .attr('y', -10)
      .attr('x', innerWidth / 4)
      .text(barGraphTitle);
    
    // Selects the rect bars with id "Not stated" and sets the colour. 
    d3.selectAll('[id="Not stated"]')
    .style('fill', '#74c476')
};


// renderLineData const variable is used to render the timeline chart
const renderLineData = (lineData, data) => {
    const lineChartTitle = 'Confirmed COVID Cases by Week';
    const lineChartWidth  = 700;
    const lineChartHeight = 300;
    const xValue = d => d.episode_week_start_date;
    const xAxisLabel = 'Date';
    const yValue = d => d.count;
    const circleRadius = 5;
    const yAxisLabel = 'Confirmed Cases';
    const innerWidth = lineChartWidth - margin.left - margin.right;
    const innerHeight = lineChartHeight - margin.top - margin.bottom; 
    const xScale = scaleTime()
                          .domain(extent(lineData, xValue))
                          .range([0, innerWidth])
                          .nice();
    const yScale = scaleLinear()
                          .domain(extent(lineData, yValue))
                          .range([innerHeight, 0])
                          .nice();
    
    // lineChartg is appended to 'g' and is displayed on the screen. 
    lineChartg = d3.select('svg').append('g')
                          .attr('transform', `translate(${margin.left + 375},${margin.top + 80}) scale(0.6, 0.6)`)
                          .attr('opacity',0.9);

    // timeFormat const is used to format the date displayed on xAxis.
    const timeFormat = d3.timeFormat("%d %b"); 
    
    // xAxis const is initialized with the ticks.
    const xAxis = axisBottom(xScale)
                          .tickSize(-innerHeight)
                          .tickPadding(10)
                          .tickFormat(timeFormat);
    
    // yAxis const is initialized with the ticks.
    const yAxis = axisLeft(yScale)
                          .tickSize(-innerWidth)
                          .tickPadding(10)
  
    const yAxisG = lineChartg.append('g').call(yAxis);

    // yAxis label is appended to the yAxis.  
    yAxisG.append('text')
        .attr('class', 'linechart-axis-label')
        .attr('y', -50)
        .attr('x', -innerHeight / 2)
        .attr('fill', 'black')
        .attr('transform', `rotate(-90)`)
        .attr('text-anchor', 'middle')
        .text(yAxisLabel);
    
    const xAxisG = lineChartg.append('g').call(xAxis)
      .attr('transform', `translate(0,${innerHeight})`);
    
    xAxisG.selectAll("text")  
          .style("text-anchor", "end")
          .attr("transform", "rotate(-45)");
    
    // xAxis label is appended to the xAxis.
    xAxisG.append('text')
        .attr('class', 'linechart-axis-label')
        .attr('y', 65)
        .attr('x', innerWidth / 2)
        .attr('fill', 'black')
        .text(xAxisLabel);
    
    // lineGenerator is used to generate the line by specifying x and y values. 
    const lineGenerator = line()
      .x(d => xScale(xValue(d)) - 5)
      .y(d => yScale(yValue(d)));
    
    const div = d3.select("body").append("div").data(lineData)
                                 .attr("class", "lineChartTooltip")
                                 .style("opacity", 0);
    
    // line is stroked with the colour similar to the selected region.
    lineChartg.append('path')
        .attr('class', 'line-path')
        .attr('d', lineGenerator(lineData))
        .attr('stroke', colorScale(NormalizedRegionCount[+data.RegionID]));
   
    // Appends the title of the timeline chart.
    lineChartg.append('text')
        .attr('class', 'lineChartTitle')
        .attr('y', -10)
        .attr('x', innerWidth/4)
        .text(lineChartTitle)      
   
   // Places the circles (points) at different positions, sets the ID and colour.
    lineChartg.selectAll('lineChartCircle').data(lineData)
        .enter().append('circle')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', '0.1em')
        .attr('fill', colorScale(NormalizedRegionCount[+data.RegionID]))
        .attr('id', d => timeFormat(d.episode_week_start_date))
        .attr('cy', d => yScale(yValue(d)))
        .attr('cx', d => xScale(xValue(d)) - 5)
        .attr('r', circleRadius)
        .on('mouseover', function(d) {        // When user hovers on a circle
             
             var formatDate =  d3.timeFormat("%m/%d/%Y");
             
             // Sets an ID to the circle tooltip.   
             div.attr('id',formatDate(d.episode_week_start_date))
             
             // Sets the background colour to the circle tooltip and displays
             // the content in tooltip.
             div.style("left", d3.event.pageX + "px")    
                .style("top",  d3.event.pageY + "px")
                .style("opacity", 0.9)
                .style('background','#fee5d9')
                .html("<table>" +
                      
                      "<tr>" +
                        "<th style='width: 60%';>Start Week:</th>" + 
                        "<td style='width: 40%';>" + formatDate(d.episode_week_start_date) + "</td>" +
                      "</tr>" +
                      
                      "<tr>" +
                        "<th style='width: 60%';>End Week:</th>" + 
                        "<td style='width: 40%';>" + formatDate(d.episode_week_end_date) + "</td>" +
                      "</tr>" +
                      
                      "<tr>" +
                        "<th style='width: 80%;'>Confirmed Cases:</th>" + 
                        "<td style='width: 20%;'>" + d.count + "</td>" +
                      "</tr>" +
                     "</table>");
             
             // Sets the background colour to the circle tooltip of id "06/29/2020" and displays
             // the content in tooltip.
             d3.selectAll('[id="06/29/2020"]')
               .style("left", d3.event.pageX - 50 + "px")    
               .style("top",  d3.event.pageY + "px")
               .style('background', '#edf8e9')
               .html("<table>" +
                      
                      "<tr>" +
                          "<p>The weekly data is not stated for " + d.count + " confirmed cases.</p>" +
                      "</tr>" +
                   
                     "</table>");

        })
        .on('mouseout', function(d) {     // When the user mouseouts from the circle
      
             div.style("opacity", 0);     // Tooltip is hidden
        });

      // Selects the circles with id "29 Jun" and sets the colour. 
       d3.selectAll('[id="29 Jun"]').attr('fill','#74c476');

};

// renderMapData const variable is used to render the choropleth map.
const renderMapData = RegionsData => {
 
  // Loops through the records in canada.json file
  d3.json('canada.json').then((data) => {
    
    RegionsData.forEach(function(d, i) 
    { 
      // Finds the number of records specific to a region and saves it accordingly.
      RegionCount[d.regionid] += d.regioncount
      
      // Finds the number of records with gender 'male' and saves to Male variable accordingly.
      if(d.gender    == 1)     {  Male[d.regionid]             += d.regioncount;  }
      
      // Finds the number of records with gender 'female' and saves to Female variable accordingly.
      if(d.gender    == 2)     {  Female[d.regionid]           += d.regioncount; }
      
      // Finds the number of records with gender 'Not stated' and saves to GenderNotStated variable accordingly.
      if(d.gender    == 9)      {  GenderNotStated[d.regionid] += d.regioncount; }
      
      // Finds the number of records with recovered 'Yes' and saves to Recovered variable accordingly. 
      if(d.recovered == 1)  {  Recovered[d.regionid]           += d.regioncount; }
      
      // Finds the number of records with recovered 'No' and saves to NotRecovered variable accordingly. 
      if(d.recovered == 2)  {  NotRecovered[d.regionid]        += d.regioncount; } 
      
      // Finds the number of records with recovered 'Not stated' and saves to RecoveryNotStated variable accordingly.
      if(d.recovered == 9)  { RecoveryNotStated[d.regionid]    += d.regioncount; }
   }); 
    
   NormalizedRegionCount.forEach(function(d, i) 
   {
       if(i != 0)
       {
         // The RegionCount is normalized with the population of Region.
         NormalizedRegionCount[i] = RegionCount[i] / RegionPopulation[i] * 10000;
         
       }
   }); 
    
   // scaleOrdinal module is used to map the NormalizedRegionCount to different colours.
   colorScale = d3.scaleOrdinal().domain(NormalizedRegionCount.slice(1, 6))
                                 .range(['#fcae91', '#a50f15', '#de2d26',  '#fb6a4a', '#fee5d9']);

    var legendDescription = {};
    
    // The label of the legend is customized.
    legendDescription[NormalizedRegionCount[1]] =  '2.5 - 4'; 
    legendDescription[NormalizedRegionCount[2]] =  '10 - 25'; 
    legendDescription[NormalizedRegionCount[3]] =  '7 - 10'; 
    legendDescription[NormalizedRegionCount[4]] =  '4 - 7'; 
    legendDescription[NormalizedRegionCount[5]] =  '1 - 2.5'; 
    
    console.log(legendDescription)
    
    // Adds text for legend.
    d3.select('g').append('text')
      .attr('class', 'title')
      .style('font-size','0.9em')
      .attr('y', 310)
      .attr('x', 32)
      .text('Confirmed cases')
      .attr('fill', 'black')
      .attr("font-weight",900);
    
    // Adds text for legend.
    d3.select('g').append('text')
      .attr('class', 'title')
      .style('font-size','0.9em')
      .attr('y', 330)
      .attr('x', 30)
      .text('(per 10000 people)')
      .attr('fill', 'black');
    
    // Calls the colorLegend function that is in colorLegend.js file.
    select('g').append('g')
               .attr('transform', `translate(40,150)`)
               .call(colorLegend, {
                 colorScale,
                 circleRadius: 6,
                 spacing: 30,
                 textOffset: 30,
                 legendDescription: legendDescription
               });
    
    // Sets a colour to each region.      
    g.selectAll('path')
     .data(data.features)
     .enter()
     .append('path')
     .attr('d', pathGenerator)
     .style('stroke', 'black')
     .style('stroke-width', '0.3')
     .attr('transform', 'translate(0, 150) scale(1.3, 1.3)')
     .attr('fill',function (d) {
                 return colorScale(NormalizedRegionCount[+d.RegionID])
     })
    .on('dblclick', function (d) {  // When user double-clicks a region

        SelectedRegionID = d.RegionID; 
      
        // Existing line chart is removed. 
        d3.selectAll("lineChartg").remove();
        
        // Provinces with the selected region are highlighted.
        d3.selectAll('path')
          .data(data.features)
          .style('stroke-width', '0.2')
          .filter(function (data, i) {
           if(data.RegionID == d.RegionID) {  return data.RegionID;  }
                    
        })
          .style('stroke-width', '1')
          .style("opacity", 1);
        
        // Provinces whose region is not selected are unhighlighted.      
        d3.selectAll('path')
          .data(data.features)
          .filter(function (data, i) {
             if(data.RegionID != d.RegionID) { return data.RegionID;  }
                    
        })
          .style('stroke-width', '0.3')
          .style("opacity", 0.1);
        
        // Displays the summary table specific to the region.       
        div.html(
              "<table style='width: 100%; margin-top: 10px; font-size: 0.8em;' border='1px' >" +
                      
              "<tr align='center' class='border_bottom'>" +
              "<th style='padding:2.5px; width: 100%;' rowspan='2'>Region</th>" +
              "<th style='padding:2.5px; width: 40%;' rowspan='2'>Confirmed Cases</th>" +
              "<th style='padding:2.5px;' colspan='3'>Gender</th>" +
              "<th style='padding:2.5px;' colspan='3'>Recovery</th>" +
              "</tr>" +
                       
              "<tr>" +
              "<th>Male</th>" + 
              "<th>Female</th>" + 
              "<th>Not Stated</th>" + 
              "<th>Recovered</th>" + 
              "<th>Not Recovered</th>" + 
              "<th>Not Stated</th>" + 
              "</tr>" +
                 
              "<tr style='height:40px'>" +
              "<th style='width:200px'>" + RegionNames[d.RegionID] + "</th>" +
              "<th>" + RegionCount[d.RegionID] + "</th>" +
              "<th>" + Male[d.RegionID] + "</th>" +
              "<th>" + Female[d.RegionID] + "</th>" + 
              "<th>" + GenderNotStated[d.RegionID] + "</th>" +
              "<th>" + Recovered[d.RegionID] + "</th>" + 
              "<th>" + NotRecovered[d.RegionID] + "</th>" + 
              "<th>" + RecoveryNotStated[d.RegionID] + "</th>" +
              "</tr>" +
                                       
              "</table>"
             )
           .style("left", 100 + "px")    
           .style("top",  350 + "px")
           .style("opacity", .9);
    
    // Loops through the records in casesbyweek.csv file.
    csv("casesbyweek.csv").then(lineData => {
         lineData.forEach(linedata => { 

                   // Data attributes are converted to their appropriate types.
                   linedata.episode_week_start_date   = new Date(linedata.episode_week_start_date);
                   linedata.episode_week_end_date   = new Date(linedata.episode_week_end_date);
                   linedata.count  = +linedata.count;  
                   linedata.region = +linedata.region;
                 })
        filteredLineData = lineData;

        // Records specific to the selected region are chosen and are passed to renderLineData.
        renderLineData(filteredLineData.filter(function (a) { return a.region === d.RegionID; }), d);
        })
    
    // Loops through the records in casesbyagegroup.csv file.
    csv("casesbyagegroup.csv").then(BarGraphData => {
         BarGraphData.forEach(BarGraphdata => { 

                   // Data attributes are converted to their appropriate types.
                   BarGraphdata.count  = +BarGraphdata.count;  
                   BarGraphdata.region = +BarGraphdata.region;
                   BarGraphdata.age_group = +BarGraphdata.age_group;
                 })
        filteredBarGraphData = BarGraphData;

        // Records specific to the selected region are chosen and are passed to renderBarGraphData.
        renderBarGraphData(filteredBarGraphData.filter(function (a) { return a.region === d.RegionID; }), d);
        })
            
   })
   .on('click', function (d) {  // When user clicks a region.

      // Tooltips are removed, selected region is de-selected and only the choropleth map is displayed.
      d3.selectAll('path')
        .data(data.features)
        .style('stroke-width', '0.3')
        .style("opacity", 1);
        
      div.style("opacity", 0);
        
      lineChartg.style("opacity", 0);
      BarGraphg.style("opacity", 0);

      d3.selectAll(".barChartTooltip").remove();
      d3.selectAll(".lineChartTooltip").remove();
   })
 });
};

// Loops through the casesbyregion.csv file
d3.csv('casesbyregion.csv').then((RegionsData) => {
     RegionsData.forEach(d => {

            // Converts the data from str to int.
            d.regionid       = +d.regionid;
            d.regioncount    = +d.regioncount;
            d.gender         = +d.gender;
            d.recovered      = +d.recovered;
     })  

     // Calls the renderMapData  by passing the RegionsData
     renderMapData(RegionsData);
        
});