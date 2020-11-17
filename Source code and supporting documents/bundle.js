(function (d3$1, topojson) {
  'use strict';

  const colorLegend = (selection, props) => {
    const {
      colorScale,
      circleRadius,
      spacing,
      textOffset,
      legendDescription
    } = props;
    
    const groups = selection.selectAll('g')
        .data(colorScale.domain().sort(function(a, b) {  return a - b; }));
       
    const groupsEnter = groups
      .enter().append('g')
        .attr('class', 'tick');
    
     
    groupsEnter
      .merge(groups)
        .attr('transform', (d, i) =>
          `translate(0, ${i * spacing})`
        );
    groups.exit().remove();

   groupsEnter.append('rect')
      .merge(groups.select('rect'))
        .attr('width', 15)
        .attr('height', 10)
       .attr('fill', colorScale);  

    d3.select('text').enter().append('text')
        .text('hi')
        .attr('y', '200')
        .attr('x', '200')
     		.style('font-size','0.9em');  
     
    groupsEnter.append('text')
      .merge(groups.select('text'))
        .text(d => legendDescription[d])
        .attr('dy', '0.7em')
        .attr('x', textOffset)
     		.style('font-size','0.9em');
  };

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
  var filteredLineData       = {};
  var filteredBarGraphData   = {};
  var lineChartg             = null;
  var BarGraphg              = null;
  var SelectedRegionID			 = null;


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
      const xValueDescription = d => d.age_group_description;
      const xAxisLabel        = 'Age Group (in years)';
      const yValue            = d => d.count;
      const yAxisLabel        = 'Confirmed Cases';
      const innerWidth        = BarGraphWidth - margin.left - margin.right;
      const innerHeight       = BarGraphHeight - margin.top - margin.bottom;
      const xScale            = d3$1.scaleBand()
                                      .domain(BarGraphData.map(xValueDescription))
                                      .range([0, innerWidth]);
      const yScale            = d3$1.scaleLinear()
                                      .domain(d3$1.extent(BarGraphData, yValue))
                                      .range([innerHeight, 0])
                                      .nice();
     
      // BarGraphg is appended to 'g' and is displayed on the screen. 
      BarGraphg               = d3.select('svg').append('g')
                                  .attr('id', +data.RegionID)
                                  .attr('transform', `translate(${margin.left + 375},${margin.top + 280}) scale(0.6, 0.6)`)
                                  .attr('opacity',0.9);  
      
      // xAxis const is initialized with the ticks.
      const xAxis             = d3$1.axisBottom(xScale)
                                  .tickSize(-innerHeight)
                                  .tickPadding(15)
                                  .ticks(11);
      // yAxis const is initialized with the ticks.
      const yAxis             = d3$1.axisLeft(yScale)
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
      .style('fill', '#74c476');
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
      const xScale = d3$1.scaleTime()
                            .domain(d3$1.extent(lineData, xValue))
                            .range([0, innerWidth])
                            .nice();
      const yScale = d3$1.scaleLinear()
                            .domain(d3$1.extent(lineData, yValue))
                            .range([innerHeight, 0])
                            .nice();
      
      // lineChartg is appended to 'g' and is displayed on the screen. 
      lineChartg = d3.select('svg').append('g')
                            .attr('transform', `translate(${margin.left + 375},${margin.top + 80}) scale(0.6, 0.6)`)
                            .attr('opacity',0.9);

      // timeFormat const is used to format the date displayed on xAxis.
      const timeFormat = d3.timeFormat("%d %b"); 
      
      // xAxis const is initialized with the ticks.
      const xAxis = d3$1.axisBottom(xScale)
                            .tickSize(-innerHeight)
                            .tickPadding(10)
                            .tickFormat(timeFormat);
      
      // yAxis const is initialized with the ticks.
      const yAxis = d3$1.axisLeft(yScale)
                            .tickSize(-innerWidth)
                            .tickPadding(10);
    
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
      const lineGenerator = d3$1.line()
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
          .text(lineChartTitle);      
     
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
               div.attr('id',formatDate(d.episode_week_start_date));
               
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
        RegionCount[d.regionid] += d.regioncount;
        
        // Finds the number of records with gender 'male' and saves to Male variable accordingly.
        if(d.gender    == 1)     {  Male[d.regionid]             += d.regioncount;  }
        
        // Finds the number of records with gender 'female' and saves to Female variable accordingly.
        if(d.gender    == 2)     {  Female[d.regionid]           += d.regioncount; }
        
        // Finds the number of records with gender 'Not stated' and saves to GenderNotStated variable accordingly.
        if(d.gender    == 9)			{  GenderNotStated[d.regionid] += d.regioncount; }
        
        // Finds the number of records with recovered 'Yes' and saves to Recovered variable accordingly. 
        if(d.recovered == 1)  {  Recovered[d.regionid]           += d.regioncount; }
        
        // Finds the number of records with recovered 'No' and saves to NotRecovered variable accordingly. 
        if(d.recovered == 2)  {  NotRecovered[d.regionid]        += d.regioncount; } 
        
        // Finds the number of records with recovered 'Not stated' and saves to RecoveryNotStated variable accordingly.
        if(d.recovered == 9)  {	RecoveryNotStated[d.regionid]    += d.regioncount; }
     }); 
      
     NormalizedRegionCount.forEach(function(d, i) 
     {
     		 if(i != 0)
         {
           // The RegionCount is normalized with the population of Region.
           NormalizedRegionCount[i]	=	RegionCount[i] / RegionPopulation[i] * 10000;
           
         }
     }); 
      
     // scaleOrdinal module is used to map the NormalizedRegionCount to different colours.
     colorScale = d3.scaleOrdinal().domain(NormalizedRegionCount.slice(1, 6))
      														 .range(['#fcae91', '#a50f15', '#de2d26',  '#fb6a4a', '#fee5d9']);

      var legendDescription = {};
      
      // The label of the legend is customized.
      legendDescription[NormalizedRegionCount[1]] =  '2.5 - 4'; 
      legendDescription[NormalizedRegionCount[2]] =  '20 - 25'; 
      legendDescription[NormalizedRegionCount[3]] =  '8 - 10'; 
      legendDescription[NormalizedRegionCount[4]] =  '4 - 8'; 
      legendDescription[NormalizedRegionCount[5]] =  '0 - 2.4'; 
      
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
      d3$1.select('g').append('g')
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
      d3$1.csv("casesbyweek.csv").then(lineData => {
           lineData.forEach(linedata => { 

                     // Data attributes are converted to their appropriate types.
                     linedata.episode_week_start_date   = new Date(linedata.episode_week_start_date);
                     linedata.episode_week_end_date   = new Date(linedata.episode_week_end_date);
                     linedata.count  = +linedata.count;  
                     linedata.region = +linedata.region;
                   });
          filteredLineData = lineData;

          // Records specific to the selected region are chosen and are passed to renderLineData.
          renderLineData(filteredLineData.filter(function (a) { return a.region === d.RegionID; }), d);
          });
      
      // Loops through the records in casesbyagegroup.csv file.
      d3$1.csv("casesbyagegroup.csv").then(BarGraphData => {
           BarGraphData.forEach(BarGraphdata => { 

                     // Data attributes are converted to their appropriate types.
                     BarGraphdata.count  = +BarGraphdata.count;  
                     BarGraphdata.region = +BarGraphdata.region;
                     BarGraphdata.age_group = +BarGraphdata.age_group;
                   });
          filteredBarGraphData = BarGraphData;

          // Records specific to the selected region are chosen and are passed to renderBarGraphData.
          renderBarGraphData(filteredBarGraphData.filter(function (a) { return a.region === d.RegionID; }), d);
          });
              
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
     });
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
       });  

       // Calls the renderMapData  by passing the RegionsData
       renderMapData(RegionsData);
          
  });

}(d3, topojson));

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbImNvbG9yTGVnZW5kLmpzIiwiaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiIGV4cG9ydCBjb25zdCBjb2xvckxlZ2VuZCA9IChzZWxlY3Rpb24sIHByb3BzKSA9PiB7XG4gIGNvbnN0IHtcbiAgICBjb2xvclNjYWxlLFxuICAgIGNpcmNsZVJhZGl1cyxcbiAgICBzcGFjaW5nLFxuICAgIHRleHRPZmZzZXQsXG4gICAgbGVnZW5kRGVzY3JpcHRpb25cbiAgfSA9IHByb3BzO1xuICBcbiAgY29uc3QgZ3JvdXBzID0gc2VsZWN0aW9uLnNlbGVjdEFsbCgnZycpXG4gICAgICAuZGF0YShjb2xvclNjYWxlLmRvbWFpbigpLnNvcnQoZnVuY3Rpb24oYSwgYikgeyAgcmV0dXJuIGEgLSBiOyB9KSk7XG4gICAgIFxuICBjb25zdCBncm91cHNFbnRlciA9IGdyb3Vwc1xuICAgIC5lbnRlcigpLmFwcGVuZCgnZycpXG4gICAgICAuYXR0cignY2xhc3MnLCAndGljaycpO1xuICBcbiAgIFxuICBncm91cHNFbnRlclxuICAgIC5tZXJnZShncm91cHMpXG4gICAgICAuYXR0cigndHJhbnNmb3JtJywgKGQsIGkpID0+XG4gICAgICAgIGB0cmFuc2xhdGUoMCwgJHtpICogc3BhY2luZ30pYFxuICAgICAgKTtcbiAgZ3JvdXBzLmV4aXQoKS5yZW1vdmUoKTtcblxuIGdyb3Vwc0VudGVyLmFwcGVuZCgncmVjdCcpXG4gICAgLm1lcmdlKGdyb3Vwcy5zZWxlY3QoJ3JlY3QnKSlcbiAgICAgIC5hdHRyKCd3aWR0aCcsIDE1KVxuICAgICAgLmF0dHIoJ2hlaWdodCcsIDEwKVxuICAgICAuYXR0cignZmlsbCcsIGNvbG9yU2NhbGUpOyAgXG5cbiAgZDMuc2VsZWN0KCd0ZXh0JykuZW50ZXIoKS5hcHBlbmQoJ3RleHQnKVxuICAgICAgLnRleHQoJ2hpJylcbiAgICAgIC5hdHRyKCd5JywgJzIwMCcpXG4gICAgICAuYXR0cigneCcsICcyMDAnKVxuICAgXHRcdC5zdHlsZSgnZm9udC1zaXplJywnMC45ZW0nKTsgIFxuICAgXG4gIGdyb3Vwc0VudGVyLmFwcGVuZCgndGV4dCcpXG4gICAgLm1lcmdlKGdyb3Vwcy5zZWxlY3QoJ3RleHQnKSlcbiAgICAgIC50ZXh0KGQgPT4gbGVnZW5kRGVzY3JpcHRpb25bZF0pXG4gICAgICAuYXR0cignZHknLCAnMC43ZW0nKVxuICAgICAgLmF0dHIoJ3gnLCB0ZXh0T2Zmc2V0KVxuICAgXHRcdC5zdHlsZSgnZm9udC1zaXplJywnMC45ZW0nKTtcbn0iLCJcbi8vIGltcG9ydHMgdGhlIHJlcXVpcmVkIG1vZHVsZXNcbmltcG9ydCB7IFxuICBzZWxlY3QsIFxuICBqc29uLCBcbiAgaHRtbCxcbiAgY3N2LFxuICBtYXgsXG4gIGdlb1BhdGgsIFxuICBnZW9NZXJjYXRvciwgXG4gIHNjYWxlT3JkaW5hbCxcbiAgc2NhbGVUaW1lLFxuICBzY2FsZUxpbmVhcixcbiAgc2NhbGVCYW5kLFxuICBleHRlbnQsXG4gIGF4aXNMZWZ0LFxuICBheGlzQm90dG9tLFxuICBsaW5lLFxuICBjdXJ2ZUJhc2lzXG4gIH0gZnJvbSAnZDMnO1xuaW1wb3J0IHsgZmVhdHVyZSB9IGZyb20gJ3RvcG9qc29uJztcbmltcG9ydCB7IGNvbG9yTGVnZW5kIH0gZnJvbSAnLi9jb2xvckxlZ2VuZCc7XG5cblxuLy8gQ3JlYXRpb24gYW5kIEluaXRpYWxpemF0aW9uIG9mIGRpZmZlcmVudCBjb25zdGFudHMgYW5kIHZhcmlhYmxlcyBcbmNvbnN0IHpvb20gICAgICAgICAgICAgICAgID0gZDMuem9vbSgpLm9uKCd6b29tJywgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdCgnc3ZnJykuYXR0cigndHJhbnNmb3JtJywgZDMuZXZlbnQudHJhbnNmb3JtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5jb25zdCBzdmcgICAgICAgICAgICAgICAgICA9IGQzLnNlbGVjdCgnc3ZnJykuc3R5bGUoJ2JhY2tncm91bmQnLCcjZmZmZmZmJyk7XG5jb25zdCBnICAgICAgICAgICAgICAgICAgICA9IHN2Zy5hcHBlbmQoJ2cnKTsgXG5jb25zdCBkaXYgICAgICAgICAgICAgICAgICA9IGQzLnNlbGVjdChcImJvZHlcIilcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCAgICAgICAuYXBwZW5kKFwiZGl2XCIpICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwidG9vbHRpcFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgMCkuY2FsbCh6b29tKS5vbihcImRibGNsaWNrLnpvb21cIixudWxsKTtcbmNvbnN0IHRpdGxlVGV4dCAgICAgICAgICAgID0gJ0NvbmZpcm1lZCBDT1ZJRCBDYXNlcyBpbiBDYW5hZGEnO1xuY29uc3Qgd2lkdGggICAgICAgICAgICAgICAgPSArc3ZnLmF0dHIoJ3dpZHRoJyk7XG5jb25zdCBoZWlnaHQgICAgICAgICAgICAgICA9ICtzdmcuYXR0cignaGVpZ2h0Jyk7XG5jb25zdCBwcm9qZWN0aW9uICAgICAgICAgICA9IGQzLmdlb01lcmNhdG9yKCk7XG5jb25zdCBwYXRoR2VuZXJhdG9yICAgICAgICA9IGQzLmdlb1BhdGgoKS5wcm9qZWN0aW9uKHByb2plY3Rpb24pO1xuY29uc3QgbWFyZ2luICAgICAgICAgICAgICAgPSB7IHRvcDogMjAsIHJpZ2h0OiA0MCwgYm90dG9tOiA4OCwgbGVmdDogMTUwIH07XG5jb25zdCBpbm5lcldpZHRoICAgICAgICAgICA9IHdpZHRoIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHQ7XG5jb25zdCBpbm5lckhlaWdodCAgICAgICAgICA9IGhlaWdodCAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tOyBcblxudmFyIFJlZ2lvbklEICAgICAgICAgICAgICAgPSAwO1xudmFyIFJlZ2lvbnMgICAgICAgICAgICAgICAgPSBbXTtcbnZhciBSZWdpb25Qb3B1bGF0aW9uICAgICAgID0gWzAsIDI0MzgzMTgsIDg1NTIzNjIsIDE0Nzg0NTI2LCA3MDM0MzM5LCA1MTYxNDc3XTtcbnZhciBNYWxlICAgICAgICAgICAgICAgICAgID0gWzAsIDAsIDAsIDAsIDAsIDBdO1xudmFyIEZlbWFsZSAgICAgICAgICAgICAgICAgPSBbMCwgMCwgMCwgMCwgMCwgMF07XG52YXIgR2VuZGVyTm90U3RhdGVkICAgICAgICA9IFswLCAwLCAwLCAwLCAwLCAwXTtcbnZhciBSZWdpb25Db3VudCAgICAgICAgICAgID0gWzAsIDAsIDAsIDAsIDAsIDBdO1xudmFyIE5vcm1hbGl6ZWRSZWdpb25Db3VudCAgPSBbMCwgMCwgMCwgMCwgMCwgMF07XG52YXIgUmVjb3ZlcmVkICAgICAgICAgICAgICA9IFswLCAwLCAwLCAwLCAwLCAwXTtcbnZhciBOb3RSZWNvdmVyZWQgICAgICAgICAgID0gWzAsIDAsIDAsIDAsIDAsIDBdO1xudmFyIFJlY292ZXJ5Tm90U3RhdGVkICAgICAgPSBbMCwgMCwgMCwgMCwgMCwgMF07XG52YXIgUmVnaW9uTmFtZXMgICAgICAgICAgICA9IFsnJywgJ0F0bGFudGljJywgJ1F1ZWJlYycsICdPbnRhcmlvIGFuZCBOdW5hdnV0JywgJ1ByYWlyaWVzIGFuZCB0aGUgTm9ydGh3ZXN0IFRlcnJpdG9yaWVzJywgJ0JyaXRpc2ggQ29sdW1iaWEgYW5kIFl1a29uJ107XG52YXIgY29sb3JTY2FsZSAgICAgICAgICAgICA9IG51bGw7XG52YXIgZmlsdGVyZWRMaW5lRGF0YSAgICAgICA9IHt9XG52YXIgZmlsdGVyZWRCYXJHcmFwaERhdGEgICA9IHt9XG52YXIgbGluZUNoYXJ0ZyAgICAgICAgICAgICA9IG51bGw7XG52YXIgQmFyR3JhcGhnICAgICAgICAgICAgICA9IG51bGw7XG52YXIgU2VsZWN0ZWRSZWdpb25JRFx0XHRcdCA9IG51bGw7XG5cblxuLy8gQXBwZW5kcyB0aGUgdGl0bGUgdGV4dCB0byB0aGUgZ3JvdXAgZWxlbWVudCAnZydcbmcuYXBwZW5kKCdkaXYnKTsgXG5nLmFwcGVuZChcInRleHRcIilcbiAuYXR0cihcInhcIiwgKGlubmVyV2lkdGggLyAyKSkgICAgICAgICAgICAgXG4gLmF0dHIoXCJ5XCIsIDQwKVxuIC5hdHRyKFwidGV4dC1hbmNob3JcIiwgXCJtaWRkbGVcIikgIFxuIC5zdHlsZShcImZvbnQtc2l6ZVwiLCBcIjI2cHhcIilcbiAuaHRtbCh0aXRsZVRleHQpO1xuXG4vLyByZW5kZXJCYXJHcmFwaERhdGEgY29uc3QgdmFyaWFibGUgaXMgdXNlZCB0byByZW5kZXIgdGhlIGJhciBncmFwaFxuY29uc3QgcmVuZGVyQmFyR3JhcGhEYXRhID0gKEJhckdyYXBoRGF0YSwgZGF0YSkgPT4ge1xuXG4gICAgLy8gRGlmZmVyZW50IGNvbnN0cyBhbmQgdmFyaWFibGVzIGFyZSBjcmVhdGVkIGFuZCBpbml0aWFsaXplZC5cbiAgICBjb25zdCBiYXJHcmFwaFRpdGxlICAgICA9ICdDb25maXJtZWQgQ09WSUQgQ2FzZXMgYnkgQWdlIEdyb3VwJztcbiAgICBjb25zdCBCYXJHcmFwaFdpZHRoICAgICA9IDcwMDtcbiAgICBjb25zdCBCYXJHcmFwaEhlaWdodCAgICA9IDMwMDtcbiAgICBjb25zdCB4VmFsdWUgICAgICAgICAgICA9IGQgPT4gZC5hZ2VfZ3JvdXA7XG4gICAgY29uc3QgeFZhbHVlRGVzY3JpcHRpb24gPSBkID0+IGQuYWdlX2dyb3VwX2Rlc2NyaXB0aW9uO1xuICAgIGNvbnN0IHhBeGlzTGFiZWwgICAgICAgID0gJ0FnZSBHcm91cCAoaW4geWVhcnMpJztcbiAgICBjb25zdCB5VmFsdWUgICAgICAgICAgICA9IGQgPT4gZC5jb3VudDtcbiAgICBjb25zdCBjaXJjbGVSYWRpdXMgICAgICA9IDY7XG4gICAgY29uc3QgeUF4aXNMYWJlbCAgICAgICAgPSAnQ29uZmlybWVkIENhc2VzJztcbiAgICBjb25zdCBpbm5lcldpZHRoICAgICAgICA9IEJhckdyYXBoV2lkdGggLSBtYXJnaW4ubGVmdCAtIG1hcmdpbi5yaWdodDtcbiAgICBjb25zdCBpbm5lckhlaWdodCAgICAgICA9IEJhckdyYXBoSGVpZ2h0IC0gbWFyZ2luLnRvcCAtIG1hcmdpbi5ib3R0b207XG4gICAgY29uc3QgeFNjYWxlICAgICAgICAgICAgPSBzY2FsZUJhbmQoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmRvbWFpbihCYXJHcmFwaERhdGEubWFwKHhWYWx1ZURlc2NyaXB0aW9uKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yYW5nZShbMCwgaW5uZXJXaWR0aF0pO1xuICAgIGNvbnN0IHlTY2FsZSAgICAgICAgICAgID0gc2NhbGVMaW5lYXIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmRvbWFpbihleHRlbnQoQmFyR3JhcGhEYXRhLCB5VmFsdWUpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJhbmdlKFtpbm5lckhlaWdodCwgMF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubmljZSgpO1xuICAgXG4gICAgLy8gQmFyR3JhcGhnIGlzIGFwcGVuZGVkIHRvICdnJyBhbmQgaXMgZGlzcGxheWVkIG9uIHRoZSBzY3JlZW4uIFxuICAgIEJhckdyYXBoZyAgICAgICAgICAgICAgID0gZDMuc2VsZWN0KCdzdmcnKS5hcHBlbmQoJ2cnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignaWQnLCArZGF0YS5SZWdpb25JRClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGB0cmFuc2xhdGUoJHttYXJnaW4ubGVmdCArIDM3NX0sJHttYXJnaW4udG9wICsgMjgwfSkgc2NhbGUoMC42LCAwLjYpYClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ29wYWNpdHknLDAuOSk7ICBcbiAgICBcbiAgICAvLyB4QXhpcyBjb25zdCBpcyBpbml0aWFsaXplZCB3aXRoIHRoZSB0aWNrcy5cbiAgICBjb25zdCB4QXhpcyAgICAgICAgICAgICA9IGF4aXNCb3R0b20oeFNjYWxlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGlja1NpemUoLWlubmVySGVpZ2h0KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGlja1BhZGRpbmcoMTUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aWNrcygxMSk7XG4gICAgLy8geUF4aXMgY29uc3QgaXMgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgdGlja3MuXG4gICAgY29uc3QgeUF4aXMgICAgICAgICAgICAgPSBheGlzTGVmdCh5U2NhbGUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aWNrU2l6ZSgtaW5uZXJXaWR0aClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRpY2tQYWRkaW5nKDEwKTtcbiAgXG4gICAgY29uc3QgeUF4aXNHICAgICAgICAgICAgPSBCYXJHcmFwaGcuYXBwZW5kKCdnJykuY2FsbCh5QXhpcyk7XG4gICAgXG4gICAgLy8gZGl2IGNvbnN0IGlzIHVzZWQgdG8gZGlzcGxheSB0aGUgdG9vbHRpcC5cbiAgICBjb25zdCBkaXYgICAgICAgICAgICAgICA9IGQzLnNlbGVjdChcImJvZHlcIikuYXBwZW5kKFwiZGl2XCIpLmRhdGEoQmFyR3JhcGhEYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiYmFyQ2hhcnRUb29sdGlwXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgMCk7XG4gICAgXG4gICAgLy8geUF4aXMgbGFiZWwgaXMgYXBwZW5kZWQgdG8gdGhlIHlBeGlzLlxuICAgIHlBeGlzRy5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdiYXJncmFwaC1heGlzLWxhYmVsJylcbiAgICAgICAgICAuYXR0cigneScsIC01MClcbiAgICAgICAgICAuYXR0cigneCcsIC1pbm5lckhlaWdodCAvIDIpXG4gICAgICAgICAgLmF0dHIoJ2ZpbGwnLCAnYmxhY2snKVxuICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBgcm90YXRlKC05MClgKVxuICAgICAgICAgIC5hdHRyKCd0ZXh0LWFuY2hvcicsICdtaWRkbGUnKVxuICAgICAgICAgIC50ZXh0KHlBeGlzTGFiZWwpO1xuICBcbiAgICBjb25zdCB4QXhpc0cgPSBCYXJHcmFwaGcuYXBwZW5kKCdnJykuY2FsbCh4QXhpcylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgYHRyYW5zbGF0ZSgwLCAke2lubmVySGVpZ2h0fSlgKTtcbiAgICBcbiAgICAvLyB4QXhpcyB0aWNrIGxhYmVscyBhcmUgdGlsdGVkIGJ5IDQ1IGRlZ3JlZXMuXG4gICAgeEF4aXNHLnNlbGVjdEFsbChcInRleHRcIikgIFxuICAgICAgICAgIC5zdHlsZShcInRleHQtYW5jaG9yXCIsIFwiZW5kXCIpXG4gICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJyb3RhdGUoLTQ1KVwiKTtcbiAgXG4gICAgLy8geEF4aXMgbGFiZWwgaXMgYXBwZW5kZWQgdG8gdGhlIHhBeGlzLlxuICAgIHhBeGlzRy5hcHBlbmQoJ3RleHQnKVxuICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdiYXJncmFwaC1heGlzLWxhYmVsJylcbiAgICAgICAgICAuYXR0cigneScsIDgwKVxuICAgICAgICAgIC5hdHRyKCd4JywgaW5uZXJXaWR0aC8yKVxuICAgICAgICAgIC5hdHRyKCdmaWxsJywgJ2JsYWNrJylcbiAgICAgICAgICAudGV4dCh4QXhpc0xhYmVsKTsgXG4gICAgXG4gICAgLy8gUmVjdGFuZ3VsYXIgYmFycyBhcmUgcGxhY2VkIGF0IGRpZmZlcmVudCBwb3NpdGlvbnMuXG4gICAgQmFyR3JhcGhnLnNlbGVjdEFsbCgncmVjdCcpLmRhdGEoQmFyR3JhcGhEYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5lbnRlcigpLmFwcGVuZCgncmVjdCcpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3gnLCBkID0+IHhTY2FsZSh4VmFsdWVEZXNjcmlwdGlvbihkKSkgKyB4U2NhbGUuYmFuZHdpZHRoKCkvNClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignaWQnLCBkID0+IHhWYWx1ZURlc2NyaXB0aW9uKGQpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd5JyxkPT4geVNjYWxlKHlWYWx1ZShkKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3dpZHRoJywgeFNjYWxlLmJhbmR3aWR0aCgpLzIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIGQ9PiBpbm5lckhlaWdodC0geVNjYWxlKHlWYWx1ZShkKSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2ZpbGwnLCBjb2xvclNjYWxlKE5vcm1hbGl6ZWRSZWdpb25Db3VudFsrZGF0YS5SZWdpb25JRF0pKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5vbignbW91c2VvdmVyJywgZnVuY3Rpb24oZCkgeyAgICAgLy8gV2hlbiB1c2VyIGhvdmVycyBvbiBhIHJlY3Rhbmd1bGFyIGJhclxuICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNldHMgYW4gSUQgdG8gdGhlIHJlY3Rhbmd1bGFyIGJhciB0b29sdGlwLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpdi5hdHRyKFwiaWRcIiwgZC5hZ2VfZ3JvdXBfZGVzY3JpcHRpb24pOyAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU2V0cyB0aGUgYmFja2dyb3VuZCBjb2xvdXIgdG8gdGhlIHJlY3Rhbmd1bGFyIGJhciB0b29sdGlwIGFuZCBkaXNwbGF5c1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZSBjb250ZW50IGluIHRvb2x0aXAuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGl2LnN0eWxlKFwibGVmdFwiLCBkMy5ldmVudC5wYWdlWCAtIDMwICsgXCJweFwiKSAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc3R5bGUoXCJ0b3BcIiwgIGQzLmV2ZW50LnBhZ2VZICsgXCJweFwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgMC45KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zdHlsZSgnYmFja2dyb3VuZCcsJyNmZWUwZDInKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5odG1sKFwiPHRhYmxlPlwiICtcbiAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjx0cj5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiPHRoIHN0eWxlPSd3aWR0aDogNjAlJzs+QWdlIEdyb3VwOjwvdGg+XCIgKyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI8dGQgc3R5bGU9J3dpZHRoOiA0MCUnOz5cIiArIGQuYWdlX2dyb3VwX2Rlc2NyaXB0aW9uICsgXCIgeWVhcnNcIiArIFwiPC90ZD5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjwvdHI+XCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjx0cj5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiPHRoIHN0eWxlPSd3aWR0aDogNjAlJzs+Q29uZmlybWVkIENhc2VzOjwvdGg+XCIgKyBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI8dGQgc3R5bGU9J3dpZHRoOiA0MCUnOz5cIiArIGQuY291bnQgKyBcIjwvdGQ+XCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI8L3RyPlwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiPC90YWJsZT5cIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFNldHMgdGhlIGJhY2tncm91bmQgY29sb3VyIHRvIHRoZSByZWN0YW5ndWxhciBiYXIgdG9vbHRpcCBvZiBpZCBcIk5vdCBzdGF0ZWRcIiBhbmQgZGlzcGxheXNcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgY29udGVudCBpbiB0b29sdGlwLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQzLnNlbGVjdEFsbCgnW2lkPVwiTm90IHN0YXRlZFwiXScpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc3R5bGUoXCJsZWZ0XCIsIGQzLmV2ZW50LnBhZ2VYIC0gNTAgKyBcInB4XCIpICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnN0eWxlKFwidG9wXCIsICBkMy5ldmVudC5wYWdlWSArIFwicHhcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zdHlsZSgnYmFja2dyb3VuZCcsICcjZWRmOGU5JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5odG1sKFwiPHRhYmxlPlwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI8dHI+XCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiPHA+QWdlIGdyb3VwIGRhdGEgaXMgbm90IHN0YXRlZCBmb3IgXCIgKyBkLmNvdW50ICsgXCIgY29uZmlybWVkIGNhc2VzLiA8L3A+XCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCI8L3RyPlwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIjwvdGFibGU+XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gIFx0XHQgICAgICAgICAgICAgICAgICAgICAgICAub24oJ21vdXNlb3V0JywgZnVuY3Rpb24oZCkgeyAgICAgICAvLyBXaGVuIHRoZSB1c2VyIG1vdXNlb3V0cyBmcm9tIHRoZSByZWN0YW5ndWxhciBiYXJcbiAgICBcdFx0XHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpdi5zdHlsZShcIm9wYWNpdHlcIiwgMCk7ICAgLy8gVG9vbHRpcCBpcyBoaWRkZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgIFxuICAgIC8vIEFwcGVuZHMgdGhlIHRpdGxlIG9mIHRoZSBiYXIgZ3JhcGguXG4gICAgQmFyR3JhcGhnLmFwcGVuZCgndGV4dCcpXG4gICAgICAuYXR0cignY2xhc3MnLCAnbGluZUNoYXJ0VGl0bGUnKVxuICAgICAgLmF0dHIoJ3knLCAtMTApXG4gICAgICAuYXR0cigneCcsIGlubmVyV2lkdGggLyA0KVxuICAgICAgLnRleHQoYmFyR3JhcGhUaXRsZSk7XG4gICAgXG4gICAgLy8gU2VsZWN0cyB0aGUgcmVjdCBiYXJzIHdpdGggaWQgXCJOb3Qgc3RhdGVkXCIgYW5kIHNldHMgdGhlIGNvbG91ci4gXG4gICAgZDMuc2VsZWN0QWxsKCdbaWQ9XCJOb3Qgc3RhdGVkXCJdJylcbiAgICAuc3R5bGUoJ2ZpbGwnLCAnIzc0YzQ3NicpXG59O1xuXG5cbi8vIHJlbmRlckxpbmVEYXRhIGNvbnN0IHZhcmlhYmxlIGlzIHVzZWQgdG8gcmVuZGVyIHRoZSB0aW1lbGluZSBjaGFydFxuY29uc3QgcmVuZGVyTGluZURhdGEgPSAobGluZURhdGEsIGRhdGEpID0+IHtcbiAgICBjb25zdCBsaW5lQ2hhcnRUaXRsZSA9ICdDb25maXJtZWQgQ09WSUQgQ2FzZXMgYnkgV2Vlayc7XG4gICAgY29uc3QgbGluZUNoYXJ0V2lkdGggID0gNzAwO1xuICAgIGNvbnN0IGxpbmVDaGFydEhlaWdodCA9IDMwMDtcbiAgICBjb25zdCB4VmFsdWUgPSBkID0+IGQuZXBpc29kZV93ZWVrX3N0YXJ0X2RhdGU7XG4gICAgY29uc3QgeEF4aXNMYWJlbCA9ICdEYXRlJztcbiAgICBjb25zdCB5VmFsdWUgPSBkID0+IGQuY291bnQ7XG4gICAgY29uc3QgY2lyY2xlUmFkaXVzID0gNTtcbiAgICBjb25zdCB5QXhpc0xhYmVsID0gJ0NvbmZpcm1lZCBDYXNlcyc7XG4gICAgY29uc3QgaW5uZXJXaWR0aCA9IGxpbmVDaGFydFdpZHRoIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHQ7XG4gICAgY29uc3QgaW5uZXJIZWlnaHQgPSBsaW5lQ2hhcnRIZWlnaHQgLSBtYXJnaW4udG9wIC0gbWFyZ2luLmJvdHRvbTsgXG4gICAgY29uc3QgeFNjYWxlID0gc2NhbGVUaW1lKClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLmRvbWFpbihleHRlbnQobGluZURhdGEsIHhWYWx1ZSkpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5yYW5nZShbMCwgaW5uZXJXaWR0aF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5uaWNlKCk7XG4gICAgY29uc3QgeVNjYWxlID0gc2NhbGVMaW5lYXIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAuZG9tYWluKGV4dGVudChsaW5lRGF0YSwgeVZhbHVlKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLnJhbmdlKFtpbm5lckhlaWdodCwgMF0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5uaWNlKCk7XG4gICAgXG4gICAgLy8gbGluZUNoYXJ0ZyBpcyBhcHBlbmRlZCB0byAnZycgYW5kIGlzIGRpc3BsYXllZCBvbiB0aGUgc2NyZWVuLiBcbiAgICBsaW5lQ2hhcnRnID0gZDMuc2VsZWN0KCdzdmcnKS5hcHBlbmQoJ2cnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgYHRyYW5zbGF0ZSgke21hcmdpbi5sZWZ0ICsgMzc1fSwke21hcmdpbi50b3AgKyA4MH0pIHNjYWxlKDAuNiwgMC42KWApXG4gICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdvcGFjaXR5JywwLjkpO1xuXG4gICAgLy8gdGltZUZvcm1hdCBjb25zdCBpcyB1c2VkIHRvIGZvcm1hdCB0aGUgZGF0ZSBkaXNwbGF5ZWQgb24geEF4aXMuXG4gICAgY29uc3QgdGltZUZvcm1hdCA9IGQzLnRpbWVGb3JtYXQoXCIlZCAlYlwiKTsgXG4gICAgXG4gICAgLy8geEF4aXMgY29uc3QgaXMgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgdGlja3MuXG4gICAgY29uc3QgeEF4aXMgPSBheGlzQm90dG9tKHhTY2FsZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLnRpY2tTaXplKC1pbm5lckhlaWdodClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLnRpY2tQYWRkaW5nKDEwKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAudGlja0Zvcm1hdCh0aW1lRm9ybWF0KTtcbiAgICBcbiAgICAvLyB5QXhpcyBjb25zdCBpcyBpbml0aWFsaXplZCB3aXRoIHRoZSB0aWNrcy5cbiAgICBjb25zdCB5QXhpcyA9IGF4aXNMZWZ0KHlTY2FsZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLnRpY2tTaXplKC1pbm5lcldpZHRoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAudGlja1BhZGRpbmcoMTApXG4gIFxuICAgIGNvbnN0IHlBeGlzRyA9IGxpbmVDaGFydGcuYXBwZW5kKCdnJykuY2FsbCh5QXhpcyk7XG5cbiAgICAvLyB5QXhpcyBsYWJlbCBpcyBhcHBlbmRlZCB0byB0aGUgeUF4aXMuICBcbiAgICB5QXhpc0cuYXBwZW5kKCd0ZXh0JylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2xpbmVjaGFydC1heGlzLWxhYmVsJylcbiAgICAgICAgLmF0dHIoJ3knLCAtNTApXG4gICAgICAgIC5hdHRyKCd4JywgLWlubmVySGVpZ2h0IC8gMilcbiAgICAgICAgLmF0dHIoJ2ZpbGwnLCAnYmxhY2snKVxuICAgICAgICAuYXR0cigndHJhbnNmb3JtJywgYHJvdGF0ZSgtOTApYClcbiAgICAgICAgLmF0dHIoJ3RleHQtYW5jaG9yJywgJ21pZGRsZScpXG4gICAgICAgIC50ZXh0KHlBeGlzTGFiZWwpO1xuICAgIFxuICAgIGNvbnN0IHhBeGlzRyA9IGxpbmVDaGFydGcuYXBwZW5kKCdnJykuY2FsbCh4QXhpcylcbiAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKDAsJHtpbm5lckhlaWdodH0pYCk7XG4gICAgXG4gICAgeEF4aXNHLnNlbGVjdEFsbChcInRleHRcIikgIFxuICAgICAgICAgIC5zdHlsZShcInRleHQtYW5jaG9yXCIsIFwiZW5kXCIpXG4gICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJyb3RhdGUoLTQ1KVwiKTtcbiAgICBcbiAgICAvLyB4QXhpcyBsYWJlbCBpcyBhcHBlbmRlZCB0byB0aGUgeEF4aXMuXG4gICAgeEF4aXNHLmFwcGVuZCgndGV4dCcpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsICdsaW5lY2hhcnQtYXhpcy1sYWJlbCcpXG4gICAgICAgIC5hdHRyKCd5JywgNjUpXG4gICAgICAgIC5hdHRyKCd4JywgaW5uZXJXaWR0aCAvIDIpXG4gICAgICAgIC5hdHRyKCdmaWxsJywgJ2JsYWNrJylcbiAgICAgICAgLnRleHQoeEF4aXNMYWJlbCk7XG4gICAgXG4gICAgLy8gbGluZUdlbmVyYXRvciBpcyB1c2VkIHRvIGdlbmVyYXRlIHRoZSBsaW5lIGJ5IHNwZWNpZnlpbmcgeCBhbmQgeSB2YWx1ZXMuIFxuICAgIGNvbnN0IGxpbmVHZW5lcmF0b3IgPSBsaW5lKClcbiAgICAgIC54KGQgPT4geFNjYWxlKHhWYWx1ZShkKSkgLSA1KVxuICAgICAgLnkoZCA9PiB5U2NhbGUoeVZhbHVlKGQpKSk7XG4gICAgXG4gICAgY29uc3QgZGl2ID0gZDMuc2VsZWN0KFwiYm9keVwiKS5hcHBlbmQoXCJkaXZcIikuZGF0YShsaW5lRGF0YSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJsaW5lQ2hhcnRUb29sdGlwXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc3R5bGUoXCJvcGFjaXR5XCIsIDApO1xuICAgIFxuICAgIC8vIGxpbmUgaXMgc3Ryb2tlZCB3aXRoIHRoZSBjb2xvdXIgc2ltaWxhciB0byB0aGUgc2VsZWN0ZWQgcmVnaW9uLlxuICAgIGxpbmVDaGFydGcuYXBwZW5kKCdwYXRoJylcbiAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ2xpbmUtcGF0aCcpXG4gICAgICAgIC5hdHRyKCdkJywgbGluZUdlbmVyYXRvcihsaW5lRGF0YSkpXG4gICAgICAgIC5hdHRyKCdzdHJva2UnLCBjb2xvclNjYWxlKE5vcm1hbGl6ZWRSZWdpb25Db3VudFsrZGF0YS5SZWdpb25JRF0pKTtcbiAgIFxuICAgIC8vIEFwcGVuZHMgdGhlIHRpdGxlIG9mIHRoZSB0aW1lbGluZSBjaGFydC5cbiAgICBsaW5lQ2hhcnRnLmFwcGVuZCgndGV4dCcpXG4gICAgICAgIC5hdHRyKCdjbGFzcycsICdsaW5lQ2hhcnRUaXRsZScpXG4gICAgICAgIC5hdHRyKCd5JywgLTEwKVxuICAgICAgICAuYXR0cigneCcsIGlubmVyV2lkdGgvNClcbiAgICAgICAgLnRleHQobGluZUNoYXJ0VGl0bGUpICAgICAgXG4gICBcbiAgIC8vIFBsYWNlcyB0aGUgY2lyY2xlcyAocG9pbnRzKSBhdCBkaWZmZXJlbnQgcG9zaXRpb25zLCBzZXRzIHRoZSBJRCBhbmQgY29sb3VyLlxuICAgIGxpbmVDaGFydGcuc2VsZWN0QWxsKCdsaW5lQ2hhcnRDaXJjbGUnKS5kYXRhKGxpbmVEYXRhKVxuICAgICAgICAuZW50ZXIoKS5hcHBlbmQoJ2NpcmNsZScpXG4gIFx0XHQgIC5hdHRyKCdzdHJva2UnLCAnI2ZmZmZmZicpXG4gIFx0XHQgIC5hdHRyKCdzdHJva2Utd2lkdGgnLCAnMC4xZW0nKVxuICBcdFx0ICAuYXR0cignZmlsbCcsIGNvbG9yU2NhbGUoTm9ybWFsaXplZFJlZ2lvbkNvdW50WytkYXRhLlJlZ2lvbklEXSkpXG4gICAgICAgIC5hdHRyKCdpZCcsIGQgPT4gdGltZUZvcm1hdChkLmVwaXNvZGVfd2Vla19zdGFydF9kYXRlKSlcbiAgICAgICAgLmF0dHIoJ2N5JywgZCA9PiB5U2NhbGUoeVZhbHVlKGQpKSlcbiAgICAgICAgLmF0dHIoJ2N4JywgZCA9PiB4U2NhbGUoeFZhbHVlKGQpKSAtIDUpXG4gICAgICAgIC5hdHRyKCdyJywgY2lyY2xlUmFkaXVzKVxuICAgICAgICAub24oJ21vdXNlb3ZlcicsIGZ1bmN0aW9uKGQpIHsgICAgICAgIC8vIFdoZW4gdXNlciBob3ZlcnMgb24gYSBjaXJjbGVcbiAgICAgICAgICAgICBcbiAgICAgICAgICAgICB2YXIgZm9ybWF0RGF0ZSA9ICBkMy50aW1lRm9ybWF0KFwiJW0vJWQvJVlcIik7XG4gICAgICAgICAgICAgXG4gICAgICAgICAgICAgLy8gU2V0cyBhbiBJRCB0byB0aGUgY2lyY2xlIHRvb2x0aXAuICAgXG4gICAgICAgICAgICAgZGl2LmF0dHIoJ2lkJyxmb3JtYXREYXRlKGQuZXBpc29kZV93ZWVrX3N0YXJ0X2RhdGUpKVxuICAgICAgICAgICAgIFxuICAgICAgICAgICAgIC8vIFNldHMgdGhlIGJhY2tncm91bmQgY29sb3VyIHRvIHRoZSBjaXJjbGUgdG9vbHRpcCBhbmQgZGlzcGxheXNcbiAgICAgICAgICAgICAvLyB0aGUgY29udGVudCBpbiB0b29sdGlwLlxuICAgICAgICAgICAgIGRpdi5zdHlsZShcImxlZnRcIiwgZDMuZXZlbnQucGFnZVggKyBcInB4XCIpICAgIFxuICAgICAgICAgICAgICAgIC5zdHlsZShcInRvcFwiLCAgZDMuZXZlbnQucGFnZVkgKyBcInB4XCIpXG4gICAgICAgICAgICAgICAgLnN0eWxlKFwib3BhY2l0eVwiLCAwLjkpXG4gICAgICAgICAgICAgICAgLnN0eWxlKCdiYWNrZ3JvdW5kJywnI2ZlZTVkOScpXG4gICAgICAgICAgICAgICAgLmh0bWwoXCI8dGFibGU+XCIgK1xuICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgIFwiPHRyPlwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiPHRoIHN0eWxlPSd3aWR0aDogNjAlJzs+U3RhcnQgV2Vlazo8L3RoPlwiICsgXG4gICAgICAgICAgICAgICAgICAgICAgICBcIjx0ZCBzdHlsZT0nd2lkdGg6IDQwJSc7PlwiICsgZm9ybWF0RGF0ZShkLmVwaXNvZGVfd2Vla19zdGFydF9kYXRlKSArIFwiPC90ZD5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgXCI8L3RyPlwiICtcbiAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICBcIjx0cj5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcIjx0aCBzdHlsZT0nd2lkdGg6IDYwJSc7PkVuZCBXZWVrOjwvdGg+XCIgKyBcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiPHRkIHN0eWxlPSd3aWR0aDogNDAlJzs+XCIgKyBmb3JtYXREYXRlKGQuZXBpc29kZV93ZWVrX2VuZF9kYXRlKSArIFwiPC90ZD5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgXCI8L3RyPlwiICtcbiAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgICBcIjx0cj5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBcIjx0aCBzdHlsZT0nd2lkdGg6IDgwJTsnPkNvbmZpcm1lZCBDYXNlczo8L3RoPlwiICsgXG4gICAgICAgICAgICAgICAgICAgICAgICBcIjx0ZCBzdHlsZT0nd2lkdGg6IDIwJTsnPlwiICsgZC5jb3VudCArIFwiPC90ZD5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgXCI8L3RyPlwiICtcbiAgICAgICAgICAgICAgICAgICAgIFwiPC90YWJsZT5cIik7XG4gICAgICAgICAgICAgXG4gICAgICAgICAgICAgLy8gU2V0cyB0aGUgYmFja2dyb3VuZCBjb2xvdXIgdG8gdGhlIGNpcmNsZSB0b29sdGlwIG9mIGlkIFwiMDYvMjkvMjAyMFwiIGFuZCBkaXNwbGF5c1xuICAgICAgICAgICAgIC8vIHRoZSBjb250ZW50IGluIHRvb2x0aXAuXG4gICAgICAgICAgICAgZDMuc2VsZWN0QWxsKCdbaWQ9XCIwNi8yOS8yMDIwXCJdJylcbiAgICBcdFx0XHRcdCAgIC5zdHlsZShcImxlZnRcIiwgZDMuZXZlbnQucGFnZVggLSA1MCArIFwicHhcIikgICAgXG4gICAgICAgICAgICAgICAuc3R5bGUoXCJ0b3BcIiwgIGQzLmV2ZW50LnBhZ2VZICsgXCJweFwiKVxuICAgICAgICAgICAgICAgLnN0eWxlKCdiYWNrZ3JvdW5kJywgJyNlZGY4ZTknKVxuICAgICAgICAgICAgICAgLmh0bWwoXCI8dGFibGU+XCIgK1xuICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAgIFwiPHRyPlwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCI8cD5UaGUgd2Vla2x5IGRhdGEgaXMgbm90IHN0YXRlZCBmb3IgXCIgKyBkLmNvdW50ICsgXCIgY29uZmlybWVkIGNhc2VzLjwvcD5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgXCI8L3RyPlwiICtcbiAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgIFwiPC90YWJsZT5cIik7XG5cbiAgICAgICAgfSlcbiAgICAgICAgLm9uKCdtb3VzZW91dCcsIGZ1bmN0aW9uKGQpIHsgICAgIC8vIFdoZW4gdGhlIHVzZXIgbW91c2VvdXRzIGZyb20gdGhlIGNpcmNsZVxuICAgICAgXG4gICAgICAgICAgICAgZGl2LnN0eWxlKFwib3BhY2l0eVwiLCAwKTsgICAgIC8vIFRvb2x0aXAgaXMgaGlkZGVuXG4gICAgICAgIH0pO1xuXG4gICAgICAvLyBTZWxlY3RzIHRoZSBjaXJjbGVzIHdpdGggaWQgXCIyOSBKdW5cIiBhbmQgc2V0cyB0aGUgY29sb3VyLiBcbiAgICAgICBkMy5zZWxlY3RBbGwoJ1tpZD1cIjI5IEp1blwiXScpLmF0dHIoJ2ZpbGwnLCcjNzRjNDc2Jyk7XG5cbn07XG5cbi8vIHJlbmRlck1hcERhdGEgY29uc3QgdmFyaWFibGUgaXMgdXNlZCB0byByZW5kZXIgdGhlIGNob3JvcGxldGggbWFwLlxuY29uc3QgcmVuZGVyTWFwRGF0YSA9IFJlZ2lvbnNEYXRhID0+IHtcbiBcbiAgLy8gTG9vcHMgdGhyb3VnaCB0aGUgcmVjb3JkcyBpbiBjYW5hZGEuanNvbiBmaWxlXG4gIGQzLmpzb24oJ2NhbmFkYS5qc29uJykudGhlbigoZGF0YSkgPT4ge1xuICAgIFxuICAgIFJlZ2lvbnNEYXRhLmZvckVhY2goZnVuY3Rpb24oZCwgaSkgXG4gICAgeyBcbiAgICAgIC8vIEZpbmRzIHRoZSBudW1iZXIgb2YgcmVjb3JkcyBzcGVjaWZpYyB0byBhIHJlZ2lvbiBhbmQgc2F2ZXMgaXQgYWNjb3JkaW5nbHkuXG4gICAgICBSZWdpb25Db3VudFtkLnJlZ2lvbmlkXSArPSBkLnJlZ2lvbmNvdW50XG4gICAgICBcbiAgICAgIC8vIEZpbmRzIHRoZSBudW1iZXIgb2YgcmVjb3JkcyB3aXRoIGdlbmRlciAnbWFsZScgYW5kIHNhdmVzIHRvIE1hbGUgdmFyaWFibGUgYWNjb3JkaW5nbHkuXG4gICAgICBpZihkLmdlbmRlciAgICA9PSAxKSAgICAgeyAgTWFsZVtkLnJlZ2lvbmlkXSAgICAgICAgICAgICArPSBkLnJlZ2lvbmNvdW50OyAgfVxuICAgICAgXG4gICAgICAvLyBGaW5kcyB0aGUgbnVtYmVyIG9mIHJlY29yZHMgd2l0aCBnZW5kZXIgJ2ZlbWFsZScgYW5kIHNhdmVzIHRvIEZlbWFsZSB2YXJpYWJsZSBhY2NvcmRpbmdseS5cbiAgICAgIGlmKGQuZ2VuZGVyICAgID09IDIpICAgICB7ICBGZW1hbGVbZC5yZWdpb25pZF0gICAgICAgICAgICs9IGQucmVnaW9uY291bnQ7IH1cbiAgICAgIFxuICAgICAgLy8gRmluZHMgdGhlIG51bWJlciBvZiByZWNvcmRzIHdpdGggZ2VuZGVyICdOb3Qgc3RhdGVkJyBhbmQgc2F2ZXMgdG8gR2VuZGVyTm90U3RhdGVkIHZhcmlhYmxlIGFjY29yZGluZ2x5LlxuICAgICAgaWYoZC5nZW5kZXIgICAgPT0gOSlcdFx0XHR7ICBHZW5kZXJOb3RTdGF0ZWRbZC5yZWdpb25pZF0gKz0gZC5yZWdpb25jb3VudDsgfVxuICAgICAgXG4gICAgICAvLyBGaW5kcyB0aGUgbnVtYmVyIG9mIHJlY29yZHMgd2l0aCByZWNvdmVyZWQgJ1llcycgYW5kIHNhdmVzIHRvIFJlY292ZXJlZCB2YXJpYWJsZSBhY2NvcmRpbmdseS4gXG4gICAgICBpZihkLnJlY292ZXJlZCA9PSAxKSAgeyAgUmVjb3ZlcmVkW2QucmVnaW9uaWRdICAgICAgICAgICArPSBkLnJlZ2lvbmNvdW50OyB9XG4gICAgICBcbiAgICAgIC8vIEZpbmRzIHRoZSBudW1iZXIgb2YgcmVjb3JkcyB3aXRoIHJlY292ZXJlZCAnTm8nIGFuZCBzYXZlcyB0byBOb3RSZWNvdmVyZWQgdmFyaWFibGUgYWNjb3JkaW5nbHkuIFxuICAgICAgaWYoZC5yZWNvdmVyZWQgPT0gMikgIHsgIE5vdFJlY292ZXJlZFtkLnJlZ2lvbmlkXSAgICAgICAgKz0gZC5yZWdpb25jb3VudDsgfSBcbiAgICAgIFxuICAgICAgLy8gRmluZHMgdGhlIG51bWJlciBvZiByZWNvcmRzIHdpdGggcmVjb3ZlcmVkICdOb3Qgc3RhdGVkJyBhbmQgc2F2ZXMgdG8gUmVjb3ZlcnlOb3RTdGF0ZWQgdmFyaWFibGUgYWNjb3JkaW5nbHkuXG4gICAgICBpZihkLnJlY292ZXJlZCA9PSA5KSAge1x0UmVjb3ZlcnlOb3RTdGF0ZWRbZC5yZWdpb25pZF0gICAgKz0gZC5yZWdpb25jb3VudDsgfVxuICAgfSk7IFxuICAgIFxuICAgTm9ybWFsaXplZFJlZ2lvbkNvdW50LmZvckVhY2goZnVuY3Rpb24oZCwgaSkgXG4gICB7XG4gICBcdFx0IGlmKGkgIT0gMClcbiAgICAgICB7XG4gICAgICAgICAvLyBUaGUgUmVnaW9uQ291bnQgaXMgbm9ybWFsaXplZCB3aXRoIHRoZSBwb3B1bGF0aW9uIG9mIFJlZ2lvbi5cbiAgICAgICAgIE5vcm1hbGl6ZWRSZWdpb25Db3VudFtpXVx0PVx0UmVnaW9uQ291bnRbaV0gLyBSZWdpb25Qb3B1bGF0aW9uW2ldICogMTAwMDA7XG4gICAgICAgICBcbiAgICAgICB9XG4gICB9KTsgXG4gICAgXG4gICAvLyBzY2FsZU9yZGluYWwgbW9kdWxlIGlzIHVzZWQgdG8gbWFwIHRoZSBOb3JtYWxpemVkUmVnaW9uQ291bnQgdG8gZGlmZmVyZW50IGNvbG91cnMuXG4gICBjb2xvclNjYWxlID0gZDMuc2NhbGVPcmRpbmFsKCkuZG9tYWluKE5vcm1hbGl6ZWRSZWdpb25Db3VudC5zbGljZSgxLCA2KSlcbiAgICBcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0IC5yYW5nZShbJyNmY2FlOTEnLCAnI2E1MGYxNScsICcjZGUyZDI2JywgICcjZmI2YTRhJywgJyNmZWU1ZDknXSk7XG5cbiAgICB2YXIgbGVnZW5kRGVzY3JpcHRpb24gPSB7fTtcbiAgICBcbiAgICAvLyBUaGUgbGFiZWwgb2YgdGhlIGxlZ2VuZCBpcyBjdXN0b21pemVkLlxuICAgIGxlZ2VuZERlc2NyaXB0aW9uW05vcm1hbGl6ZWRSZWdpb25Db3VudFsxXV0gPSAgJzIuNSAtIDQnOyBcbiAgICBsZWdlbmREZXNjcmlwdGlvbltOb3JtYWxpemVkUmVnaW9uQ291bnRbMl1dID0gICcyMCAtIDI1JzsgXG4gICAgbGVnZW5kRGVzY3JpcHRpb25bTm9ybWFsaXplZFJlZ2lvbkNvdW50WzNdXSA9ICAnOCAtIDEwJzsgXG4gICAgbGVnZW5kRGVzY3JpcHRpb25bTm9ybWFsaXplZFJlZ2lvbkNvdW50WzRdXSA9ICAnNCAtIDgnOyBcbiAgICBsZWdlbmREZXNjcmlwdGlvbltOb3JtYWxpemVkUmVnaW9uQ291bnRbNV1dID0gICcwIC0gMi40JzsgXG4gICAgXG4gICAgLy8gQWRkcyB0ZXh0IGZvciBsZWdlbmQuXG4gICAgZDMuc2VsZWN0KCdnJykuYXBwZW5kKCd0ZXh0JylcbiAgICBcdC5hdHRyKCdjbGFzcycsICd0aXRsZScpXG4gICBcdFx0LnN0eWxlKCdmb250LXNpemUnLCcwLjllbScpXG4gICAgICAuYXR0cigneScsIDMxMClcbiAgICAgIC5hdHRyKCd4JywgMzIpXG4gICAgICAudGV4dCgnQ29uZmlybWVkIGNhc2VzJylcbiAgICAgIC5hdHRyKCdmaWxsJywgJ2JsYWNrJylcbiAgICBcdC5hdHRyKFwiZm9udC13ZWlnaHRcIiw5MDApO1xuICAgIFxuICAgIC8vIEFkZHMgdGV4dCBmb3IgbGVnZW5kLlxuICAgIGQzLnNlbGVjdCgnZycpLmFwcGVuZCgndGV4dCcpXG4gICAgXHQuYXR0cignY2xhc3MnLCAndGl0bGUnKVxuICAgXHRcdC5zdHlsZSgnZm9udC1zaXplJywnMC45ZW0nKVxuICAgICAgLmF0dHIoJ3knLCAzMzApXG4gICAgICAuYXR0cigneCcsIDMwKVxuICAgICAgLnRleHQoJyhwZXIgMTAwMDAgcGVvcGxlKScpXG4gICAgICAuYXR0cignZmlsbCcsICdibGFjaycpO1xuICAgIFxuICAgIC8vIENhbGxzIHRoZSBjb2xvckxlZ2VuZCBmdW5jdGlvbiB0aGF0IGlzIGluIGNvbG9yTGVnZW5kLmpzIGZpbGUuXG4gICAgc2VsZWN0KCdnJykuYXBwZW5kKCdnJylcbiAgICAgICAgICAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBgdHJhbnNsYXRlKDQwLDE1MClgKVxuICAgICAgICAgICAgICAgLmNhbGwoY29sb3JMZWdlbmQsIHtcbiAgICAgICAgICAgICAgICAgY29sb3JTY2FsZSxcbiAgICAgICAgICAgICAgICAgY2lyY2xlUmFkaXVzOiA2LFxuICAgICAgICAgICAgICAgICBzcGFjaW5nOiAzMCxcbiAgICAgICAgICAgICAgICAgdGV4dE9mZnNldDogMzAsXG4gICAgICBcdFx0XHRcdFx0IGxlZ2VuZERlc2NyaXB0aW9uOiBsZWdlbmREZXNjcmlwdGlvblxuICAgICAgICAgICAgICAgfSk7XG4gICAgXG4gICAgLy8gU2V0cyBhIGNvbG91ciB0byBlYWNoIHJlZ2lvbi4gICAgICBcbiAgICBnLnNlbGVjdEFsbCgncGF0aCcpXG4gICAgIC5kYXRhKGRhdGEuZmVhdHVyZXMpXG4gICAgIC5lbnRlcigpXG4gICAgIC5hcHBlbmQoJ3BhdGgnKVxuICAgICAuYXR0cignZCcsIHBhdGhHZW5lcmF0b3IpXG4gICAgIC5zdHlsZSgnc3Ryb2tlJywgJ2JsYWNrJylcbiAgICAgLnN0eWxlKCdzdHJva2Utd2lkdGgnLCAnMC4zJylcbiAgICAgLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoMCwgMTUwKSBzY2FsZSgxLjMsIDEuMyknKVxuICAgICAuYXR0cignZmlsbCcsZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbG9yU2NhbGUoTm9ybWFsaXplZFJlZ2lvbkNvdW50WytkLlJlZ2lvbklEXSlcbiAgICAgfSlcbiAgICAub24oJ2RibGNsaWNrJywgZnVuY3Rpb24gKGQpIHsgIC8vIFdoZW4gdXNlciBkb3VibGUtY2xpY2tzIGEgcmVnaW9uXG5cbiAgICAgICAgU2VsZWN0ZWRSZWdpb25JRCA9IGQuUmVnaW9uSUQ7IFxuICAgICAgXG4gICAgICAgIC8vIEV4aXN0aW5nIGxpbmUgY2hhcnQgaXMgcmVtb3ZlZC4gXG4gICAgICAgIGQzLnNlbGVjdEFsbChcImxpbmVDaGFydGdcIikucmVtb3ZlKCk7XG4gICAgICAgIFxuICAgICAgICAvLyBQcm92aW5jZXMgd2l0aCB0aGUgc2VsZWN0ZWQgcmVnaW9uIGFyZSBoaWdobGlnaHRlZC5cbiAgICAgICAgZDMuc2VsZWN0QWxsKCdwYXRoJylcbiAgICAgICAgICAuZGF0YShkYXRhLmZlYXR1cmVzKVxuICAgICAgICAgIC5zdHlsZSgnc3Ryb2tlLXdpZHRoJywgJzAuMicpXG4gICAgICAgICAgLmZpbHRlcihmdW5jdGlvbiAoZGF0YSwgaSkge1xuICAgICAgICAgICBpZihkYXRhLlJlZ2lvbklEID09IGQuUmVnaW9uSUQpIHsgIHJldHVybiBkYXRhLlJlZ2lvbklEOyAgfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgfSlcbiAgICAgICAgICAuc3R5bGUoJ3N0cm9rZS13aWR0aCcsICcxJylcbiAgICAgICAgICAuc3R5bGUoXCJvcGFjaXR5XCIsIDEpO1xuICAgICAgICBcbiAgICAgICAgLy8gUHJvdmluY2VzIHdob3NlIHJlZ2lvbiBpcyBub3Qgc2VsZWN0ZWQgYXJlIHVuaGlnaGxpZ2h0ZWQuICAgICAgXG4gICAgICAgIGQzLnNlbGVjdEFsbCgncGF0aCcpXG4gICAgICAgICAgLmRhdGEoZGF0YS5mZWF0dXJlcylcbiAgICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uIChkYXRhLCBpKSB7XG4gICAgICAgICAgICAgaWYoZGF0YS5SZWdpb25JRCAhPSBkLlJlZ2lvbklEKSB7IHJldHVybiBkYXRhLlJlZ2lvbklEOyAgfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgfSlcbiAgICAgICAgICAuc3R5bGUoJ3N0cm9rZS13aWR0aCcsICcwLjMnKVxuICAgICAgICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgMC4xKTtcbiAgICAgICAgXG4gICAgICAgIC8vIERpc3BsYXlzIHRoZSBzdW1tYXJ5IHRhYmxlIHNwZWNpZmljIHRvIHRoZSByZWdpb24uICAgICAgIFxuICAgICAgICBkaXYuaHRtbChcbiAgICAgICAgICAgICAgXCI8dGFibGUgc3R5bGU9J3dpZHRoOiAxMDAlOyBtYXJnaW4tdG9wOiAxMHB4OyBmb250LXNpemU6IDAuOGVtOycgYm9yZGVyPScxcHgnID5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIFwiPHRyIGFsaWduPSdjZW50ZXInIGNsYXNzPSdib3JkZXJfYm90dG9tJz5cIiArXG4gICAgICAgICAgICAgIFwiPHRoIHN0eWxlPSdwYWRkaW5nOjIuNXB4OyB3aWR0aDogMTAwJTsnIHJvd3NwYW49JzInPlJlZ2lvbjwvdGg+XCIgK1xuICAgICAgICAgICAgICBcIjx0aCBzdHlsZT0ncGFkZGluZzoyLjVweDsgd2lkdGg6IDQwJTsnIHJvd3NwYW49JzInPkNvbmZpcm1lZCBDYXNlczwvdGg+XCIgK1xuICAgICAgICAgICAgICBcIjx0aCBzdHlsZT0ncGFkZGluZzoyLjVweDsnIGNvbHNwYW49JzMnPkdlbmRlcjwvdGg+XCIgK1xuICAgICAgICAgICAgICBcIjx0aCBzdHlsZT0ncGFkZGluZzoyLjVweDsnIGNvbHNwYW49JzMnPlJlY292ZXJ5PC90aD5cIiArXG4gICAgICAgICAgICAgIFwiPC90cj5cIiArXG4gICAgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICBcIjx0cj5cIiArXG4gICAgICAgICAgICAgIFwiPHRoPk1hbGU8L3RoPlwiICsgXG4gICAgICAgICAgICAgIFwiPHRoPkZlbWFsZTwvdGg+XCIgKyBcbiAgICAgICAgICAgICAgXCI8dGg+Tm90IFN0YXRlZDwvdGg+XCIgKyBcbiAgICAgICAgICAgICAgXCI8dGg+UmVjb3ZlcmVkPC90aD5cIiArIFxuICAgICAgICAgICAgICBcIjx0aD5Ob3QgUmVjb3ZlcmVkPC90aD5cIiArIFxuICAgICAgICAgICAgICBcIjx0aD5Ob3QgU3RhdGVkPC90aD5cIiArIFxuICAgICAgICAgICAgICBcIjwvdHI+XCIgK1xuICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgXCI8dHIgc3R5bGU9J2hlaWdodDo0MHB4Jz5cIiArXG4gICAgICAgICAgICAgIFwiPHRoIHN0eWxlPSd3aWR0aDoyMDBweCc+XCIgKyBSZWdpb25OYW1lc1tkLlJlZ2lvbklEXSArIFwiPC90aD5cIiArXG4gICAgICAgICAgICAgIFwiPHRoPlwiICsgUmVnaW9uQ291bnRbZC5SZWdpb25JRF0gKyBcIjwvdGg+XCIgK1xuICAgICAgICAgICAgICBcIjx0aD5cIiArIE1hbGVbZC5SZWdpb25JRF0gKyBcIjwvdGg+XCIgK1xuICAgICAgICAgICAgICBcIjx0aD5cIiArIEZlbWFsZVtkLlJlZ2lvbklEXSArIFwiPC90aD5cIiArIFxuICAgICAgICAgICAgICBcIjx0aD5cIiArIEdlbmRlck5vdFN0YXRlZFtkLlJlZ2lvbklEXSArIFwiPC90aD5cIiArXG4gICAgICAgICAgICAgIFwiPHRoPlwiICsgUmVjb3ZlcmVkW2QuUmVnaW9uSURdICsgXCI8L3RoPlwiICsgXG4gICAgICAgICAgICAgIFwiPHRoPlwiICsgTm90UmVjb3ZlcmVkW2QuUmVnaW9uSURdICsgXCI8L3RoPlwiICsgXG4gICAgICAgICAgICAgIFwiPHRoPlwiICsgUmVjb3ZlcnlOb3RTdGF0ZWRbZC5SZWdpb25JRF0gKyBcIjwvdGg+XCIgK1xuICAgICAgICAgICAgICBcIjwvdHI+XCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgIFwiPC90YWJsZT5cIlxuICAgICAgICAgICAgIClcbiAgICAgICAgICAgLnN0eWxlKFwibGVmdFwiLCAxMDAgKyBcInB4XCIpICAgIFxuICAgICAgICAgICAuc3R5bGUoXCJ0b3BcIiwgIDM1MCArIFwicHhcIilcbiAgICAgICAgICAgLnN0eWxlKFwib3BhY2l0eVwiLCAuOSk7XG4gICAgXG4gICAgLy8gTG9vcHMgdGhyb3VnaCB0aGUgcmVjb3JkcyBpbiBjYXNlc2J5d2Vlay5jc3YgZmlsZS5cbiAgICBjc3YoXCJjYXNlc2J5d2Vlay5jc3ZcIikudGhlbihsaW5lRGF0YSA9PiB7XG4gICAgICAgICBsaW5lRGF0YS5mb3JFYWNoKGxpbmVkYXRhID0+IHsgXG5cbiAgICAgICAgICAgICAgICAgICAvLyBEYXRhIGF0dHJpYnV0ZXMgYXJlIGNvbnZlcnRlZCB0byB0aGVpciBhcHByb3ByaWF0ZSB0eXBlcy5cbiAgICAgICAgICAgICAgICAgICBsaW5lZGF0YS5lcGlzb2RlX3dlZWtfc3RhcnRfZGF0ZSAgID0gbmV3IERhdGUobGluZWRhdGEuZXBpc29kZV93ZWVrX3N0YXJ0X2RhdGUpO1xuICAgICAgICAgICAgICAgICAgIGxpbmVkYXRhLmVwaXNvZGVfd2Vla19lbmRfZGF0ZSAgID0gbmV3IERhdGUobGluZWRhdGEuZXBpc29kZV93ZWVrX2VuZF9kYXRlKTtcbiAgICAgICAgICAgICAgICAgICBsaW5lZGF0YS5jb3VudCAgPSArbGluZWRhdGEuY291bnQ7ICBcbiAgICAgICAgICAgICAgICAgICBsaW5lZGF0YS5yZWdpb24gPSArbGluZWRhdGEucmVnaW9uO1xuICAgICAgICAgICAgICAgICB9KVxuICAgICAgICBmaWx0ZXJlZExpbmVEYXRhID0gbGluZURhdGE7XG5cbiAgICAgICAgLy8gUmVjb3JkcyBzcGVjaWZpYyB0byB0aGUgc2VsZWN0ZWQgcmVnaW9uIGFyZSBjaG9zZW4gYW5kIGFyZSBwYXNzZWQgdG8gcmVuZGVyTGluZURhdGEuXG4gICAgICAgIHJlbmRlckxpbmVEYXRhKGZpbHRlcmVkTGluZURhdGEuZmlsdGVyKGZ1bmN0aW9uIChhKSB7IHJldHVybiBhLnJlZ2lvbiA9PT0gZC5SZWdpb25JRDsgfSksIGQpO1xuICAgICAgICB9KVxuICAgIFxuICAgIC8vIExvb3BzIHRocm91Z2ggdGhlIHJlY29yZHMgaW4gY2FzZXNieWFnZWdyb3VwLmNzdiBmaWxlLlxuICAgIGNzdihcImNhc2VzYnlhZ2Vncm91cC5jc3ZcIikudGhlbihCYXJHcmFwaERhdGEgPT4ge1xuICAgICAgICAgQmFyR3JhcGhEYXRhLmZvckVhY2goQmFyR3JhcGhkYXRhID0+IHsgXG5cbiAgICAgICAgICAgICAgICAgICAvLyBEYXRhIGF0dHJpYnV0ZXMgYXJlIGNvbnZlcnRlZCB0byB0aGVpciBhcHByb3ByaWF0ZSB0eXBlcy5cbiAgICAgICAgICAgICAgICAgICBCYXJHcmFwaGRhdGEuY291bnQgID0gK0JhckdyYXBoZGF0YS5jb3VudDsgIFxuICAgICAgICAgICAgICAgICAgIEJhckdyYXBoZGF0YS5yZWdpb24gPSArQmFyR3JhcGhkYXRhLnJlZ2lvbjtcbiAgICAgICAgICAgICAgICAgICBCYXJHcmFwaGRhdGEuYWdlX2dyb3VwID0gK0JhckdyYXBoZGF0YS5hZ2VfZ3JvdXA7XG4gICAgICAgICAgICAgICAgIH0pXG4gICAgICAgIGZpbHRlcmVkQmFyR3JhcGhEYXRhID0gQmFyR3JhcGhEYXRhO1xuXG4gICAgICAgIC8vIFJlY29yZHMgc3BlY2lmaWMgdG8gdGhlIHNlbGVjdGVkIHJlZ2lvbiBhcmUgY2hvc2VuIGFuZCBhcmUgcGFzc2VkIHRvIHJlbmRlckJhckdyYXBoRGF0YS5cbiAgICAgICAgcmVuZGVyQmFyR3JhcGhEYXRhKGZpbHRlcmVkQmFyR3JhcGhEYXRhLmZpbHRlcihmdW5jdGlvbiAoYSkgeyByZXR1cm4gYS5yZWdpb24gPT09IGQuUmVnaW9uSUQ7IH0pLCBkKTtcbiAgICAgICAgfSlcbiAgICAgICAgICAgIFxuICAgfSlcbiAgIC5vbignY2xpY2snLCBmdW5jdGlvbiAoZCkgeyAgLy8gV2hlbiB1c2VyIGNsaWNrcyBhIHJlZ2lvbi5cblxuICAgICAgLy8gVG9vbHRpcHMgYXJlIHJlbW92ZWQsIHNlbGVjdGVkIHJlZ2lvbiBpcyBkZS1zZWxlY3RlZCBhbmQgb25seSB0aGUgY2hvcm9wbGV0aCBtYXAgaXMgZGlzcGxheWVkLlxuICAgICAgZDMuc2VsZWN0QWxsKCdwYXRoJylcbiAgICAgICAgLmRhdGEoZGF0YS5mZWF0dXJlcylcbiAgICAgICAgLnN0eWxlKCdzdHJva2Utd2lkdGgnLCAnMC4zJylcbiAgICAgICAgLnN0eWxlKFwib3BhY2l0eVwiLCAxKTtcbiAgICAgICAgXG4gICAgICBkaXYuc3R5bGUoXCJvcGFjaXR5XCIsIDApO1xuICAgICAgICBcbiAgICAgIGxpbmVDaGFydGcuc3R5bGUoXCJvcGFjaXR5XCIsIDApO1xuICAgICAgQmFyR3JhcGhnLnN0eWxlKFwib3BhY2l0eVwiLCAwKTtcblxuICAgICAgZDMuc2VsZWN0QWxsKFwiLmJhckNoYXJ0VG9vbHRpcFwiKS5yZW1vdmUoKTtcbiAgICAgIGQzLnNlbGVjdEFsbChcIi5saW5lQ2hhcnRUb29sdGlwXCIpLnJlbW92ZSgpO1xuICAgfSlcbiB9KTtcbn07XG5cbi8vIExvb3BzIHRocm91Z2ggdGhlIGNhc2VzYnlyZWdpb24uY3N2IGZpbGVcbmQzLmNzdignY2FzZXNieXJlZ2lvbi5jc3YnKS50aGVuKChSZWdpb25zRGF0YSkgPT4ge1xuICAgICBSZWdpb25zRGF0YS5mb3JFYWNoKGQgPT4ge1xuXG4gICAgICAgICAgICAvLyBDb252ZXJ0cyB0aGUgZGF0YSBmcm9tIHN0ciB0byBpbnQuXG4gICAgICAgICAgICBkLnJlZ2lvbmlkICAgICAgID0gK2QucmVnaW9uaWQ7XG4gICAgICAgICAgICBkLnJlZ2lvbmNvdW50ICAgID0gK2QucmVnaW9uY291bnQ7XG4gICAgICAgICAgICBkLmdlbmRlciAgICAgICAgID0gK2QuZ2VuZGVyO1xuICAgICAgICAgICAgZC5yZWNvdmVyZWQgICAgICA9ICtkLnJlY292ZXJlZDtcbiAgICAgfSkgIFxuXG4gICAgIC8vIENhbGxzIHRoZSByZW5kZXJNYXBEYXRhICBieSBwYXNzaW5nIHRoZSBSZWdpb25zRGF0YVxuICAgICByZW5kZXJNYXBEYXRhKFJlZ2lvbnNEYXRhKTtcbiAgICAgICAgXG59KTsiXSwibmFtZXMiOlsic2NhbGVCYW5kIiwic2NhbGVMaW5lYXIiLCJleHRlbnQiLCJheGlzQm90dG9tIiwiYXhpc0xlZnQiLCJzY2FsZVRpbWUiLCJsaW5lIiwic2VsZWN0IiwiY3N2Il0sIm1hcHBpbmdzIjoiOzs7RUFBUSxNQUFNLFdBQVcsR0FBRyxDQUFDLFNBQVMsRUFBRSxLQUFLLEtBQUs7RUFDbEQsRUFBRSxNQUFNO0VBQ1IsSUFBSSxVQUFVO0VBQ2QsSUFBSSxZQUFZO0VBQ2hCLElBQUksT0FBTztFQUNYLElBQUksVUFBVTtFQUNkLElBQUksaUJBQWlCO0VBQ3JCLEdBQUcsR0FBRyxLQUFLLENBQUM7RUFDWjtFQUNBLEVBQUUsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUM7RUFDekMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUN6RTtFQUNBLEVBQUUsTUFBTSxXQUFXLEdBQUcsTUFBTTtFQUM1QixLQUFLLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUM7RUFDeEIsT0FBTyxJQUFJLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0VBQzdCO0VBQ0E7RUFDQSxFQUFFLFdBQVc7RUFDYixLQUFLLEtBQUssQ0FBQyxNQUFNLENBQUM7RUFDbEIsT0FBTyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7RUFDOUIsUUFBUSxDQUFDLGFBQWEsRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQztFQUN0QyxPQUFPLENBQUM7RUFDUixFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUN6QjtFQUNBLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7RUFDM0IsS0FBSyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztFQUNqQyxPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDO0VBQ3hCLE9BQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUM7RUFDekIsTUFBTSxJQUFJLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBQy9CO0VBQ0EsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7RUFDMUMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDO0VBQ2pCLE9BQU8sSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUM7RUFDdkIsT0FBTyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQztFQUN2QixNQUFNLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7RUFDakM7RUFDQSxFQUFFLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0VBQzVCLEtBQUssS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7RUFDakMsT0FBTyxJQUFJLENBQUMsQ0FBQyxJQUFJLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3RDLE9BQU8sSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUM7RUFDMUIsT0FBTyxJQUFJLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQztFQUM1QixNQUFNLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7RUFDakM7O0VDbEJBO0VBQ0EsTUFBTSxJQUFJLG1CQUFtQixFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNO0VBQ3hELGtDQUFrQyxFQUFFLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztFQUN6Riw4QkFBOEIsQ0FBQyxDQUFDO0VBQ2hDLE1BQU0sR0FBRyxvQkFBb0IsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0VBQzVFLE1BQU0sQ0FBQyxzQkFBc0IsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUM3QyxNQUFNLEdBQUcsb0JBQW9CLEVBQUUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0VBQzlDLG9CQUFvQixNQUFNLENBQUMsS0FBSyxDQUFDO0VBQ2pDLGdDQUFnQyxJQUFJLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQztFQUN4RCxnQ0FBZ0MsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUN4RixNQUFNLFNBQVMsY0FBYyxpQ0FBaUMsQ0FBQztFQUMvRCxNQUFNLEtBQUssa0JBQWtCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztFQUNoRCxNQUFNLE1BQU0saUJBQWlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztFQUNqRCxNQUFNLFVBQVUsYUFBYSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7RUFDOUMsTUFBTSxhQUFhLFVBQVUsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztFQUNqRSxNQUFNLE1BQU0saUJBQWlCLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxDQUFDO0VBQzNFLE1BQU0sVUFBVSxhQUFhLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7RUFLaEUsSUFBSSxnQkFBZ0IsU0FBUyxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7RUFDL0UsSUFBSSxJQUFJLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7RUFDaEQsSUFBSSxNQUFNLG1CQUFtQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7RUFDaEQsSUFBSSxlQUFlLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0VBQ2hELElBQUksV0FBVyxjQUFjLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUNoRCxJQUFJLHFCQUFxQixJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUNoRCxJQUFJLFNBQVMsZ0JBQWdCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUNoRCxJQUFJLFlBQVksYUFBYSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7RUFDaEQsSUFBSSxpQkFBaUIsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7RUFDaEQsSUFBSSxXQUFXLGNBQWMsQ0FBQyxFQUFFLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxxQkFBcUIsRUFBRSx3Q0FBd0MsRUFBRSw0QkFBNEIsQ0FBQyxDQUFDO0VBQ3ZKLElBQUksVUFBVSxlQUFlLElBQUksQ0FBQztFQUNsQyxJQUFJLGdCQUFnQixTQUFTLEdBQUU7RUFDL0IsSUFBSSxvQkFBb0IsS0FBSyxHQUFFO0VBQy9CLElBQUksVUFBVSxlQUFlLElBQUksQ0FBQztFQUNsQyxJQUFJLFNBQVMsZ0JBQWdCLElBQUksQ0FBQztFQUNsQyxJQUFJLGdCQUFnQixNQUFNLElBQUksQ0FBQztBQUMvQjtBQUNBO0VBQ0E7RUFDQSxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0VBQ2hCLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0VBQ2hCLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxVQUFVLEdBQUcsQ0FBQyxFQUFFO0VBQzdCLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7RUFDZixFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDO0VBQy9CLEVBQUUsS0FBSyxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUM7RUFDNUIsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbEI7RUFDQTtFQUNBLE1BQU0sa0JBQWtCLEdBQUcsQ0FBQyxZQUFZLEVBQUUsSUFBSSxLQUFLO0FBQ25EO0VBQ0E7RUFDQSxJQUFJLE1BQU0sYUFBYSxPQUFPLG9DQUFvQyxDQUFDO0VBQ25FLElBQUksTUFBTSxhQUFhLE9BQU8sR0FBRyxDQUFDO0VBQ2xDLElBQUksTUFBTSxjQUFjLE1BQU0sR0FBRyxDQUFDO0VBRWxDLElBQUksTUFBTSxpQkFBaUIsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLHFCQUFxQixDQUFDO0VBQzNELElBQUksTUFBTSxVQUFVLFVBQVUsc0JBQXNCLENBQUM7RUFDckQsSUFBSSxNQUFNLE1BQU0sY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQztFQUUzQyxJQUFJLE1BQU0sVUFBVSxVQUFVLGlCQUFpQixDQUFDO0VBQ2hELElBQUksTUFBTSxVQUFVLFVBQVUsYUFBYSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztFQUN6RSxJQUFJLE1BQU0sV0FBVyxTQUFTLGNBQWMsR0FBRyxNQUFNLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7RUFDMUUsSUFBSSxNQUFNLE1BQU0sY0FBY0EsY0FBUyxFQUFFO0VBQ3pDLHFDQUFxQyxNQUFNLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0VBQ2hGLHFDQUFxQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztFQUM1RCxJQUFJLE1BQU0sTUFBTSxjQUFjQyxnQkFBVyxFQUFFO0VBQzNDLHFDQUFxQyxNQUFNLENBQUNDLFdBQU0sQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLENBQUM7RUFDekUscUNBQXFDLEtBQUssQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUM1RCxxQ0FBcUMsSUFBSSxFQUFFLENBQUM7RUFDNUM7RUFDQTtFQUNBLElBQUksU0FBUyxpQkFBaUIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDO0VBQzFELGlDQUFpQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztFQUMzRCxpQ0FBaUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztFQUN6SCxpQ0FBaUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNyRDtFQUNBO0VBQ0EsSUFBSSxNQUFNLEtBQUssZUFBZUMsZUFBVSxDQUFDLE1BQU0sQ0FBQztFQUNoRCxpQ0FBaUMsUUFBUSxDQUFDLENBQUMsV0FBVyxDQUFDO0VBQ3ZELGlDQUFpQyxXQUFXLENBQUMsRUFBRSxDQUFDO0VBQ2hELGlDQUFpQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUM7RUFDM0M7RUFDQSxJQUFJLE1BQU0sS0FBSyxlQUFlQyxhQUFRLENBQUMsTUFBTSxDQUFDO0VBQzlDLGlDQUFpQyxRQUFRLENBQUMsQ0FBQyxVQUFVLENBQUM7RUFDdEQsaUNBQWlDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztFQUNqRDtFQUNBLElBQUksTUFBTSxNQUFNLGNBQWMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7RUFDaEU7RUFDQTtFQUNBLElBQUksTUFBTSxHQUFHLGlCQUFpQixFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO0VBQ2hGLGlDQUFpQyxJQUFJLENBQUMsT0FBTyxFQUFFLGlCQUFpQixDQUFDO0VBQ2pFLGlDQUFpQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0VBQ3JEO0VBQ0E7RUFDQSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0VBQ3pCLFdBQVcsSUFBSSxDQUFDLE9BQU8sRUFBRSxxQkFBcUIsQ0FBQztFQUMvQyxXQUFXLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7RUFDekIsV0FBVyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztFQUN0QyxXQUFXLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDO0VBQ2hDLFdBQVcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0VBQzNDLFdBQVcsSUFBSSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUM7RUFDeEMsV0FBVyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7RUFDNUI7RUFDQSxJQUFJLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztFQUNwRCw2QkFBNkIsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUMvRTtFQUNBO0VBQ0EsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztFQUM1QixXQUFXLEtBQUssQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDO0VBQ3RDLFdBQVcsSUFBSSxDQUFDLFdBQVcsRUFBRSxhQUFhLENBQUMsQ0FBQztFQUM1QztFQUNBO0VBQ0EsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztFQUN6QixXQUFXLElBQUksQ0FBQyxPQUFPLEVBQUUscUJBQXFCLENBQUM7RUFDL0MsV0FBVyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztFQUN4QixXQUFXLElBQUksQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztFQUNsQyxXQUFXLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDO0VBQ2hDLFdBQVcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0VBQzVCO0VBQ0E7RUFDQSxJQUFJLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQztFQUNsRCxnQ0FBZ0MsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztFQUN0RCxnQ0FBZ0MsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUNuRyxnQ0FBZ0MsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDckUsZ0NBQWdDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUMvRCxnQ0FBZ0MsSUFBSSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0VBQ25FLGdDQUFnQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxXQUFXLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ2xGLGdDQUFnQyxJQUFJLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0VBQy9GLGdDQUFnQyxFQUFFLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxFQUFFO0VBQzVEO0VBQ0E7RUFDQSxxQ0FBcUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUM7RUFDN0U7RUFDQTtFQUNBO0VBQ0EscUNBQXFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7RUFDbEYseUNBQXlDLEtBQUssQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0VBQzdFLHlDQUF5QyxLQUFLLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQztFQUM5RCx5Q0FBeUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUM7RUFDdEUseUNBQXlDLElBQUksQ0FBQyxTQUFTO0VBQ3ZEO0VBQ0EsMkNBQTJDLE1BQU07RUFDakQsNENBQTRDLHlDQUF5QztFQUNyRiw0Q0FBNEMsMEJBQTBCLEdBQUcsQ0FBQyxDQUFDLHFCQUFxQixHQUFHLFFBQVEsR0FBRyxPQUFPO0VBQ3JILDBDQUEwQyxPQUFPO0VBQ2pEO0VBQ0EsMENBQTBDLE1BQU07RUFDaEQsNENBQTRDLCtDQUErQztFQUMzRiw0Q0FBNEMsMEJBQTBCLEdBQUcsQ0FBQyxDQUFDLEtBQUssR0FBRyxPQUFPO0VBQzFGLDBDQUEwQyxPQUFPO0VBQ2pEO0VBQ0EseUNBQXlDLFVBQVU7RUFDbkQsMENBQTBDLENBQUM7RUFDM0M7RUFDQTtFQUNBO0VBQ0EscUNBQXFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUM7RUFDdEUsd0NBQXdDLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztFQUNqRix3Q0FBd0MsS0FBSyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7RUFDNUUsd0NBQXdDLEtBQUssQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDO0VBQ3RFLHdDQUF3QyxJQUFJLENBQUMsU0FBUztFQUN0RDtFQUNBLGdEQUFnRCxNQUFNO0VBQ3RELGlEQUFpRCxzQ0FBc0MsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLHdCQUF3QjtFQUM1SCxnREFBZ0QsT0FBTztFQUN2RDtFQUNBLCtDQUErQyxVQUFVO0VBQ3pELGdEQUFnRCxDQUFDO0VBQ2pELCtCQUErQixDQUFDO0VBQ2hDLDZCQUE2QixFQUFFLENBQUMsVUFBVSxFQUFFLFNBQVMsQ0FBQyxFQUFFO0VBQ3hELG9DQUFvQyxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUM1RCwrQkFBK0IsQ0FBQyxDQUFDO0VBQ2pDO0VBQ0E7RUFDQSxJQUFJLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0VBQzVCLE9BQU8sSUFBSSxDQUFDLE9BQU8sRUFBRSxnQkFBZ0IsQ0FBQztFQUN0QyxPQUFPLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUM7RUFDckIsT0FBTyxJQUFJLENBQUMsR0FBRyxFQUFFLFVBQVUsR0FBRyxDQUFDLENBQUM7RUFDaEMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7RUFDM0I7RUFDQTtFQUNBLElBQUksRUFBRSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQztFQUNyQyxLQUFLLEtBQUssQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFDO0VBQzdCLENBQUMsQ0FBQztBQUNGO0FBQ0E7RUFDQTtFQUNBLE1BQU0sY0FBYyxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksS0FBSztFQUMzQyxJQUFJLE1BQU0sY0FBYyxHQUFHLCtCQUErQixDQUFDO0VBQzNELElBQUksTUFBTSxjQUFjLElBQUksR0FBRyxDQUFDO0VBQ2hDLElBQUksTUFBTSxlQUFlLEdBQUcsR0FBRyxDQUFDO0VBQ2hDLElBQUksTUFBTSxNQUFNLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQztFQUNsRCxJQUFJLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQztFQUM5QixJQUFJLE1BQU0sTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDO0VBQ2hDLElBQUksTUFBTSxZQUFZLEdBQUcsQ0FBQyxDQUFDO0VBQzNCLElBQUksTUFBTSxVQUFVLEdBQUcsaUJBQWlCLENBQUM7RUFDekMsSUFBSSxNQUFNLFVBQVUsR0FBRyxjQUFjLEdBQUcsTUFBTSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO0VBQ25FLElBQUksTUFBTSxXQUFXLEdBQUcsZUFBZSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQztFQUNyRSxJQUFJLE1BQU0sTUFBTSxHQUFHQyxjQUFTLEVBQUU7RUFDOUIsMkJBQTJCLE1BQU0sQ0FBQ0gsV0FBTSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztFQUMzRCwyQkFBMkIsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0VBQ2pELDJCQUEyQixJQUFJLEVBQUUsQ0FBQztFQUNsQyxJQUFJLE1BQU0sTUFBTSxHQUFHRCxnQkFBVyxFQUFFO0VBQ2hDLDJCQUEyQixNQUFNLENBQUNDLFdBQU0sQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7RUFDM0QsMkJBQTJCLEtBQUssQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUNsRCwyQkFBMkIsSUFBSSxFQUFFLENBQUM7RUFDbEM7RUFDQTtFQUNBLElBQUksVUFBVSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztFQUM3QywyQkFBMkIsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLFVBQVUsRUFBRSxNQUFNLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsaUJBQWlCLENBQUMsQ0FBQztFQUNsSCwyQkFBMkIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMvQztFQUNBO0VBQ0EsSUFBSSxNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0VBQzlDO0VBQ0E7RUFDQSxJQUFJLE1BQU0sS0FBSyxHQUFHQyxlQUFVLENBQUMsTUFBTSxDQUFDO0VBQ3BDLDJCQUEyQixRQUFRLENBQUMsQ0FBQyxXQUFXLENBQUM7RUFDakQsMkJBQTJCLFdBQVcsQ0FBQyxFQUFFLENBQUM7RUFDMUMsMkJBQTJCLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztFQUNsRDtFQUNBO0VBQ0EsSUFBSSxNQUFNLEtBQUssR0FBR0MsYUFBUSxDQUFDLE1BQU0sQ0FBQztFQUNsQywyQkFBMkIsUUFBUSxDQUFDLENBQUMsVUFBVSxDQUFDO0VBQ2hELDJCQUEyQixXQUFXLENBQUMsRUFBRSxFQUFDO0VBQzFDO0VBQ0EsSUFBSSxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN0RDtFQUNBO0VBQ0EsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztFQUN6QixTQUFTLElBQUksQ0FBQyxPQUFPLEVBQUUsc0JBQXNCLENBQUM7RUFDOUMsU0FBUyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO0VBQ3ZCLFNBQVMsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7RUFDcEMsU0FBUyxJQUFJLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQztFQUM5QixTQUFTLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxXQUFXLENBQUMsQ0FBQztFQUN6QyxTQUFTLElBQUksQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDO0VBQ3RDLFNBQVMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0VBQzFCO0VBQ0EsSUFBSSxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUM7RUFDckQsT0FBTyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsWUFBWSxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3hEO0VBQ0EsSUFBSSxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztFQUM1QixXQUFXLEtBQUssQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDO0VBQ3RDLFdBQVcsSUFBSSxDQUFDLFdBQVcsRUFBRSxhQUFhLENBQUMsQ0FBQztFQUM1QztFQUNBO0VBQ0EsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztFQUN6QixTQUFTLElBQUksQ0FBQyxPQUFPLEVBQUUsc0JBQXNCLENBQUM7RUFDOUMsU0FBUyxJQUFJLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQztFQUN0QixTQUFTLElBQUksQ0FBQyxHQUFHLEVBQUUsVUFBVSxHQUFHLENBQUMsQ0FBQztFQUNsQyxTQUFTLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDO0VBQzlCLFNBQVMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0VBQzFCO0VBQ0E7RUFDQSxJQUFJLE1BQU0sYUFBYSxHQUFHRSxTQUFJLEVBQUU7RUFDaEMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDcEMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ2pDO0VBQ0EsSUFBSSxNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO0VBQzlELGtDQUFrQyxJQUFJLENBQUMsT0FBTyxFQUFFLGtCQUFrQixDQUFDO0VBQ25FLGtDQUFrQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0VBQ3REO0VBQ0E7RUFDQSxJQUFJLFVBQVUsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0VBQzdCLFNBQVMsSUFBSSxDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUM7RUFDbkMsU0FBUyxJQUFJLENBQUMsR0FBRyxFQUFFLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztFQUMzQyxTQUFTLElBQUksQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLHFCQUFxQixDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUMzRTtFQUNBO0VBQ0EsSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztFQUM3QixTQUFTLElBQUksQ0FBQyxPQUFPLEVBQUUsZ0JBQWdCLENBQUM7RUFDeEMsU0FBUyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO0VBQ3ZCLFNBQVMsSUFBSSxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO0VBQ2hDLFNBQVMsSUFBSSxDQUFDLGNBQWMsRUFBQztFQUM3QjtFQUNBO0VBQ0EsSUFBSSxVQUFVLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztFQUMxRCxTQUFTLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7RUFDakMsT0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQztFQUNoQyxPQUFPLElBQUksQ0FBQyxjQUFjLEVBQUUsT0FBTyxDQUFDO0VBQ3BDLE9BQU8sSUFBSSxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMscUJBQXFCLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztFQUN0RSxTQUFTLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsdUJBQXVCLENBQUMsQ0FBQztFQUMvRCxTQUFTLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUMzQyxTQUFTLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDL0MsU0FBUyxJQUFJLENBQUMsR0FBRyxFQUFFLFlBQVksQ0FBQztFQUNoQyxTQUFTLEVBQUUsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLEVBQUU7RUFDckM7RUFDQSxhQUFhLElBQUksVUFBVSxJQUFJLEVBQUUsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7RUFDekQ7RUFDQTtFQUNBLGFBQWEsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxFQUFDO0VBQ2pFO0VBQ0E7RUFDQTtFQUNBLGFBQWEsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0VBQ3JELGlCQUFpQixLQUFLLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztFQUNyRCxpQkFBaUIsS0FBSyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUM7RUFDdEMsaUJBQWlCLEtBQUssQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDO0VBQzlDLGlCQUFpQixJQUFJLENBQUMsU0FBUztFQUMvQjtFQUNBLHNCQUFzQixNQUFNO0VBQzVCLHdCQUF3QiwwQ0FBMEM7RUFDbEUsd0JBQXdCLDBCQUEwQixHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsdUJBQXVCLENBQUMsR0FBRyxPQUFPO0VBQ3BHLHNCQUFzQixPQUFPO0VBQzdCO0VBQ0Esc0JBQXNCLE1BQU07RUFDNUIsd0JBQXdCLHdDQUF3QztFQUNoRSx3QkFBd0IsMEJBQTBCLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxHQUFHLE9BQU87RUFDbEcsc0JBQXNCLE9BQU87RUFDN0I7RUFDQSxzQkFBc0IsTUFBTTtFQUM1Qix3QkFBd0IsK0NBQStDO0VBQ3ZFLHdCQUF3QiwwQkFBMEIsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLE9BQU87RUFDdEUsc0JBQXNCLE9BQU87RUFDN0IscUJBQXFCLFVBQVUsQ0FBQyxDQUFDO0VBQ2pDO0VBQ0E7RUFDQTtFQUNBLGFBQWEsRUFBRSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQztFQUM5QyxZQUFZLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQztFQUNyRCxnQkFBZ0IsS0FBSyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7RUFDcEQsZ0JBQWdCLEtBQUssQ0FBQyxZQUFZLEVBQUUsU0FBUyxDQUFDO0VBQzlDLGdCQUFnQixJQUFJLENBQUMsU0FBUztFQUM5QjtFQUNBLHNCQUFzQixNQUFNO0VBQzVCLDBCQUEwQix1Q0FBdUMsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLHVCQUF1QjtFQUNyRyxzQkFBc0IsT0FBTztFQUM3QjtFQUNBLHFCQUFxQixVQUFVLENBQUMsQ0FBQztBQUNqQztFQUNBLFNBQVMsQ0FBQztFQUNWLFNBQVMsRUFBRSxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsRUFBRTtFQUNwQztFQUNBLGFBQWEsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7RUFDckMsU0FBUyxDQUFDLENBQUM7QUFDWDtFQUNBO0VBQ0EsT0FBTyxFQUFFLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDNUQ7RUFDQSxDQUFDLENBQUM7QUFDRjtFQUNBO0VBQ0EsTUFBTSxhQUFhLEdBQUcsV0FBVyxJQUFJO0VBQ3JDO0VBQ0E7RUFDQSxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLO0VBQ3hDO0VBQ0EsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7RUFDckMsSUFBSTtFQUNKO0VBQ0EsTUFBTSxXQUFXLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxZQUFXO0VBQzlDO0VBQ0E7RUFDQSxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sT0FBTyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxHQUFHO0VBQ25GO0VBQ0E7RUFDQSxNQUFNLEdBQUcsQ0FBQyxDQUFDLE1BQU0sT0FBTyxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRTtFQUNsRjtFQUNBO0VBQ0EsTUFBTSxHQUFHLENBQUMsQ0FBQyxNQUFNLE9BQU8sQ0FBQyxJQUFJLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLEVBQUU7RUFDL0U7RUFDQTtFQUNBLE1BQU0sR0FBRyxDQUFDLENBQUMsU0FBUyxJQUFJLENBQUMsR0FBRyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxFQUFFO0VBQ2xGO0VBQ0E7RUFDQSxNQUFNLEdBQUcsQ0FBQyxDQUFDLFNBQVMsSUFBSSxDQUFDLEdBQUcsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRTtFQUNsRjtFQUNBO0VBQ0EsTUFBTSxHQUFHLENBQUMsQ0FBQyxTQUFTLElBQUksQ0FBQyxHQUFHLEVBQUUsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRTtFQUNsRixJQUFJLENBQUMsQ0FBQztFQUNOO0VBQ0EsR0FBRyxxQkFBcUIsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQztFQUM5QyxHQUFHO0VBQ0gsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDO0VBQ2YsT0FBTztFQUNQO0VBQ0EsU0FBUyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO0VBQ2pGO0VBQ0EsUUFBUTtFQUNSLElBQUksQ0FBQyxDQUFDO0VBQ047RUFDQTtFQUNBLEdBQUcsVUFBVSxHQUFHLEVBQUUsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUMzRSxvQkFBb0IsS0FBSyxDQUFDLENBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEdBQUcsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDcEY7RUFDQSxJQUFJLElBQUksaUJBQWlCLEdBQUcsRUFBRSxDQUFDO0VBQy9CO0VBQ0E7RUFDQSxJQUFJLGlCQUFpQixDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDO0VBQzdELElBQUksaUJBQWlCLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUM7RUFDN0QsSUFBSSxpQkFBaUIsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQztFQUM1RCxJQUFJLGlCQUFpQixDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksT0FBTyxDQUFDO0VBQzNELElBQUksaUJBQWlCLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUM7RUFDN0Q7RUFDQTtFQUNBLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0VBQ2pDLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUM7RUFDNUIsTUFBTSxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQztFQUNoQyxPQUFPLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0VBQ3JCLE9BQU8sSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7RUFDcEIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUM7RUFDOUIsT0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQztFQUM1QixNQUFNLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUM7RUFDOUI7RUFDQTtFQUNBLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO0VBQ2pDLE1BQU0sSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUM7RUFDNUIsTUFBTSxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQztFQUNoQyxPQUFPLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO0VBQ3JCLE9BQU8sSUFBSSxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7RUFDcEIsT0FBTyxJQUFJLENBQUMsb0JBQW9CLENBQUM7RUFDakMsT0FBTyxJQUFJLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0VBQzdCO0VBQ0E7RUFDQSxJQUFJQyxXQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztFQUMzQixnQkFBZ0IsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLGlCQUFpQixDQUFDLENBQUM7RUFDdEQsZ0JBQWdCLElBQUksQ0FBQyxXQUFXLEVBQUU7RUFDbEMsaUJBQWlCLFVBQVU7RUFDM0IsaUJBQWlCLFlBQVksRUFBRSxDQUFDO0VBQ2hDLGlCQUFpQixPQUFPLEVBQUUsRUFBRTtFQUM1QixpQkFBaUIsVUFBVSxFQUFFLEVBQUU7RUFDL0IsWUFBWSxpQkFBaUIsRUFBRSxpQkFBaUI7RUFDaEQsZ0JBQWdCLENBQUMsQ0FBQztFQUNsQjtFQUNBO0VBQ0EsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztFQUN2QixNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO0VBQ3pCLE1BQU0sS0FBSyxFQUFFO0VBQ2IsTUFBTSxNQUFNLENBQUMsTUFBTSxDQUFDO0VBQ3BCLE1BQU0sSUFBSSxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUM7RUFDOUIsTUFBTSxLQUFLLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQztFQUM5QixNQUFNLEtBQUssQ0FBQyxjQUFjLEVBQUUsS0FBSyxDQUFDO0VBQ2xDLE1BQU0sSUFBSSxDQUFDLFdBQVcsRUFBRSxtQ0FBbUMsQ0FBQztFQUM1RCxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUU7RUFDL0IsaUJBQWlCLE9BQU8sVUFBVSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0VBQ3RFLE1BQU0sQ0FBQztFQUNQLEtBQUssRUFBRSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsRUFBRTtBQUNqQztFQUNBLFFBQVEsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQztFQUN0QztFQUNBO0VBQ0EsUUFBUSxFQUFFLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQzVDO0VBQ0E7RUFDQSxRQUFRLEVBQUUsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO0VBQzVCLFdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7RUFDOUIsV0FBVyxLQUFLLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQztFQUN2QyxXQUFXLE1BQU0sQ0FBQyxVQUFVLElBQUksRUFBRSxDQUFDLEVBQUU7RUFDckMsV0FBVyxHQUFHLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxHQUFHLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHO0VBQ3RFO0VBQ0EsU0FBUyxDQUFDO0VBQ1YsV0FBVyxLQUFLLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQztFQUNyQyxXQUFXLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7RUFDL0I7RUFDQTtFQUNBLFFBQVEsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7RUFDNUIsV0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztFQUM5QixXQUFXLE1BQU0sQ0FBQyxVQUFVLElBQUksRUFBRSxDQUFDLEVBQUU7RUFDckMsYUFBYSxHQUFHLElBQUksQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHO0VBQ3ZFO0VBQ0EsU0FBUyxDQUFDO0VBQ1YsV0FBVyxLQUFLLENBQUMsY0FBYyxFQUFFLEtBQUssQ0FBQztFQUN2QyxXQUFXLEtBQUssQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7RUFDakM7RUFDQTtFQUNBLFFBQVEsR0FBRyxDQUFDLElBQUk7RUFDaEIsY0FBYyxnRkFBZ0Y7RUFDOUY7RUFDQSxjQUFjLDJDQUEyQztFQUN6RCxjQUFjLGlFQUFpRTtFQUMvRSxjQUFjLHlFQUF5RTtFQUN2RixjQUFjLG9EQUFvRDtFQUNsRSxjQUFjLHNEQUFzRDtFQUNwRSxjQUFjLE9BQU87RUFDckI7RUFDQSxjQUFjLE1BQU07RUFDcEIsY0FBYyxlQUFlO0VBQzdCLGNBQWMsaUJBQWlCO0VBQy9CLGNBQWMscUJBQXFCO0VBQ25DLGNBQWMsb0JBQW9CO0VBQ2xDLGNBQWMsd0JBQXdCO0VBQ3RDLGNBQWMscUJBQXFCO0VBQ25DLGNBQWMsT0FBTztFQUNyQjtFQUNBLGNBQWMsMEJBQTBCO0VBQ3hDLGNBQWMsMEJBQTBCLEdBQUcsV0FBVyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxPQUFPO0VBQzVFLGNBQWMsTUFBTSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsT0FBTztFQUN4RCxjQUFjLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLE9BQU87RUFDakQsY0FBYyxNQUFNLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxPQUFPO0VBQ25ELGNBQWMsTUFBTSxHQUFHLGVBQWUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsT0FBTztFQUM1RCxjQUFjLE1BQU0sR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLE9BQU87RUFDdEQsY0FBYyxNQUFNLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxPQUFPO0VBQ3pELGNBQWMsTUFBTSxHQUFHLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxPQUFPO0VBQzlELGNBQWMsT0FBTztFQUNyQjtFQUNBLGNBQWMsVUFBVTtFQUN4QixjQUFjO0VBQ2QsWUFBWSxLQUFLLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxJQUFJLENBQUM7RUFDckMsWUFBWSxLQUFLLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUM7RUFDckMsWUFBWSxLQUFLLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO0VBQ2pDO0VBQ0E7RUFDQSxJQUFJQyxRQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJO0VBQzVDLFNBQVMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLElBQUk7QUFDdEM7RUFDQTtFQUNBLG1CQUFtQixRQUFRLENBQUMsdUJBQXVCLEtBQUssSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLHVCQUF1QixDQUFDLENBQUM7RUFDbkcsbUJBQW1CLFFBQVEsQ0FBQyxxQkFBcUIsS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMscUJBQXFCLENBQUMsQ0FBQztFQUMvRixtQkFBbUIsUUFBUSxDQUFDLEtBQUssSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7RUFDckQsbUJBQW1CLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO0VBQ3RELGtCQUFrQixFQUFDO0VBQ25CLFFBQVEsZ0JBQWdCLEdBQUcsUUFBUSxDQUFDO0FBQ3BDO0VBQ0E7RUFDQSxRQUFRLGNBQWMsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUNyRyxTQUFTLEVBQUM7RUFDVjtFQUNBO0VBQ0EsSUFBSUEsUUFBRyxDQUFDLHFCQUFxQixDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksSUFBSTtFQUNwRCxTQUFTLFlBQVksQ0FBQyxPQUFPLENBQUMsWUFBWSxJQUFJO0FBQzlDO0VBQ0E7RUFDQSxtQkFBbUIsWUFBWSxDQUFDLEtBQUssSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUM7RUFDN0QsbUJBQW1CLFlBQVksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDO0VBQzlELG1CQUFtQixZQUFZLENBQUMsU0FBUyxHQUFHLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQztFQUNwRSxrQkFBa0IsRUFBQztFQUNuQixRQUFRLG9CQUFvQixHQUFHLFlBQVksQ0FBQztBQUM1QztFQUNBO0VBQ0EsUUFBUSxrQkFBa0IsQ0FBQyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUM3RyxTQUFTLEVBQUM7RUFDVjtFQUNBLElBQUksQ0FBQztFQUNMLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxVQUFVLENBQUMsRUFBRTtBQUM3QjtFQUNBO0VBQ0EsTUFBTSxFQUFFLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQztFQUMxQixTQUFTLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO0VBQzVCLFNBQVMsS0FBSyxDQUFDLGNBQWMsRUFBRSxLQUFLLENBQUM7RUFDckMsU0FBUyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDO0VBQzdCO0VBQ0EsTUFBTSxHQUFHLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztFQUM5QjtFQUNBLE1BQU0sVUFBVSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUM7RUFDckMsTUFBTSxTQUFTLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNwQztFQUNBLE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ2hELE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ2pELElBQUksRUFBQztFQUNMLEVBQUUsQ0FBQyxDQUFDO0VBQ0osQ0FBQyxDQUFDO0FBQ0Y7RUFDQTtFQUNBLEVBQUUsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxXQUFXLEtBQUs7RUFDbEQsS0FBSyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSTtBQUM5QjtFQUNBO0VBQ0EsWUFBWSxDQUFDLENBQUMsUUFBUSxTQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztFQUMzQyxZQUFZLENBQUMsQ0FBQyxXQUFXLE1BQU0sQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDO0VBQzlDLFlBQVksQ0FBQyxDQUFDLE1BQU0sV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUM7RUFDekMsWUFBWSxDQUFDLENBQUMsU0FBUyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztFQUM1QyxNQUFNLEVBQUM7QUFDUDtFQUNBO0VBQ0EsS0FBSyxhQUFhLENBQUMsV0FBVyxDQUFDLENBQUM7RUFDaEM7RUFDQSxDQUFDLENBQUM7Ozs7In0=