


//START

var margin = {t:50,r:50,b:50,l:70};
var width = document.getElementById('plot').clientWidth-margin.l-margin.r,
  height = document.getElementById('plot').clientHeight-margin.t-margin.b;


var plot = d3.select('.canvas')
  .append('svg')
  .attr('width',width+margin.l+margin.r)
  .attr('height',height+margin.t+margin.b)
  .append('g')
  .attr('class','plot')
  .attr('transform', 'translate ('+margin.l+','+margin.r+')');



d3.csv('data/HSall_members_new.csv',parse,dataLoaded);

scaleX = d3.scale.linear().domain([-1,1]).range([0,width]);
scaleY = d3.scale.linear().domain([-1,1]).range([height*.9,height*.1]);
scaleC = d3.scale.linear().domain([0,10,26]).range(['rgba(156,156,156,.4)','rgba(156,156,156,.4)','rgba(14,14,14,.8)']);
scaleO = d3.scale.linear().domain([0,26]).range([.2,1]);
scaleCC = d3.scale.ordinal().domain([100,200]).range(['blue','red']);

///////////////////////////////////////////////////////////////////////////////
function dataLoaded(err,rows){
/////////////////////////////////////////////////////////

var force = d3.layout.force()
    .size([width,height])
    .charge(-4)
    .gravity(0);



var byCongress = d3.nest()
    .key(function(d){return d.congress})
    .map(rows,d3.map);



d3.select('#slider3').call(d3.slider()
    .value(1)
    .min(1)
    .max(119)
    .step(1)
    // .on("slide", function(evt, value) {
    //     d3.select('#slider3text')
    //     .text(value);
    //     draw(value)


    .on("slide", function(evt, value) {

        // grab "years" from first row of this congress
        var years = byCongress.get(value)[0].years;

        // update header with both congress # and years
        d3.select('#slider3text')
          .text(years);

        draw(value);
    })
);




plot.append('rect')
    .attr('x',scaleX(0))
    .attr('y', 0)
    .attr('width','2px')
    .attr('height',height)
    .attr('fill','rgb(56,56,56)')


function draw(id){

force
    .nodes(byCongress.get(id))
    .on('tick', loadForce)

var bins = d3.range(-1,1,.02),
    histogramValues = d3.layout.histogram()
    .value(function(d){return d.score;})
    .bins(bins)(byCongress.get(id));


histogramValues.forEach(function(bin){
    bin.forEach(function(p,i){
        p.xx = bin.x + bin.dx/2;
        p.yy = i*10;
    });
});

//console.log(histogramValues);


var node_update = plot.selectAll('.node')
    .data(force.nodes(), function(d){return d.id});

node_update.enter()
    .append('circle')
    .attr('class','node')
    .attr('class', function(d){return "node " + d.name;})
    .attr('r', 5)
    .attr('fill',function(d){

      if (d.party == 100){return 'rgb(0,197,215)'}
      else if (d.party ==200){return 'rgb(329,60,35)'}
      else {return 'black'}

      })
    .style('opacity',.9)




      //return scaleCC(d.party)})

    .on('mouseover',function() {

        var classV = d3.select(this).attr('class')
        console.log(classV)
    })

node_update.exit()

     .remove();




    node_update.transition().duration(100)
        .attr('cx',function(d){return scaleX(d.xx)})
        .attr('cy',function(d){return height/2 - d.yy})
        .attr('fill',function(d){

      if (d.party == 100){return 'rgb(0,197,215)'}
      else if (d.party ==200){return 'rgb(329,60,35)'}
      else {return 'black'}

      })
        force.stop();

d3.select('#hist').on('click',function(){
    force.start();

});

d3.select('#scatter').on('click',function(){
    force.stop();
    node_update.transition().duration(700)
        .attr('cx',function(d){return scaleX(d.score)})
        .attr('cy',function(d){return scaleY(d.score2)});
});

// d3.select('#hist').on('click',function(){
//     force.stop();
//         node_update.transition().duration(0)
//         .attr('cx',function(d){return scaleX(d.xx)})
//         .attr('cy',function(d){return height/2 - d.yy})

// });

// d3.select('#plot').on('mouseup', function() {
//   force.start();
// });


function loadForce(e){
            var q = d3.geom.quadtree(byCongress.get(id)),
                i = 0,
                n = byCongress.get(id).length;
    
            while( ++i<n ){
                q.visit(collide(byCongress.get(id)[i]));
            }
        
            node_update
                .each(function(d){
                    var focus = {};
                    focus.x = scaleX(d.score);
                    focus.y = height/2;
        
                    d.x += (focus.x-d.x)*(e.alpha*.12);
                    d.y += (focus.y-d.y)*(e.alpha*.12);
                })

               .attr('cy',function(d){return d.y})
               .attr('cx',function(d){return d.x})

}//END loadForce Function

function collide(dataPoint){
                var nr = dataPoint.r,
                nx1 = dataPoint.x - nr,
                ny1 = dataPoint.y - nr,
                nx2 = dataPoint.x + nr,
                ny2 = dataPoint.y + nr;
    
                return function(quadPoint,x1,y1,x2,y2){
                    if(quadPoint.point && (quadPoint.point !== dataPoint)){
                        var x = dataPoint.x - quadPoint.point.x,
                            y = dataPoint.y - quadPoint.point.y,
                            l = Math.sqrt(x*x+y*y),
                            r = nr + quadPoint.point.r;
                        if(l<r){
                      l = (l-r)/l*.1;
                      dataPoint.x -= x*= (l*.05);
                      dataPoint.y -= y*= l;
                      quadPoint.point.x += (x*.05);
                      quadPoint.point.y += y;
                        }
                    }
                    return x1>nx2 || x2<nx1 || y1>ny2 || y2<ny1;
                }
            }// END collide






} //END DRAW function



/////////////////////////////////////////////////
}//END DATA LOADED
////////////////////////////////////////////////////////////////////////////////


function parse(d){

  var xStart = scaleX(+d.dim1);

  return{
    congress: +d.congress,
    r: 5,
    x: xStart + Math.random()*5,
    y: height/2 + Math.random()*7,
    chamber: d.chamber,
    id: d.bioguide_id,
    state: d.state_abbrev,
    experience: d.experience,
    name: d.bioname,
    party: d.party_code,
    score: +d.dim1,
    score2: +d.dim2,
    years: d.years
  }
}



