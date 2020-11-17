 export const colorLegend = (selection, props) => {
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
}