


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



d3.csv('data/HSall_members.csv',parse,dataLoaded);

scaleX = d3.scale.linear().domain([-1,1]).range([width*.1,width*.9]);
scaleY = d3.scale.linear().domain([-1,1]).range([height*.9,height*.1]);
scaleC = d3.scale.linear().domain([0,10,26]).range(['rgba(156,156,156,.4)','rgba(156,156,156,.4)','rgba(14,14,14,.8)']);
scaleO = d3.scale.linear().domain([0,26]).range([.2,1])


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
    .max(115)
    .step(1)
    .on("slide", function(evt, value) {
        d3.select('#slider3text')
        .text(value);
        draw(value)
    })
);

plot.append('rect')
    .attr('x',scaleX(0))
    .attr('y', 0)
    .attr('width','2px')
    .attr('height',height)
    .attr('fill','red')


function draw(id){

force
    .nodes(byCongress.get(id))
    .on('tick', loadForce)

var node_update = plot.selectAll('.node')
    .data(force.nodes(), function(d){return d.id});

node_update.enter()
    .append('circle')
    .attr('class','node')
    .attr('class', function(d){return "node " + d.experience;})
    .attr('r', function(d){return d.radius})
    .style('opacity',function(d){return scaleO(d.experience)})
    .attr('fill','rgb(16,16,16')

    .on('mouseover',function() {

        var classV = d3.select(this).attr('class')
        console.log(classV)
    })


node_update.exit()
     .transition()
     //.attr('r',0)
     .remove();

var transition = node_update
    .transition() 

transition
    .style('opacity',function(d){return scaleO(d.experience)})


    force.start();

var bins = d3.range(-1,1,.03),
    histogramValues = d3.layout.histogram()
    .value(function(d){return d.score;})
    .bins(bins)(byCongress.get(id));

histogramValues.forEach(function(bin){
    bin.forEach(function(p,i){
        p.xx = bin.x + bin.dx/2;
        p.yy = i*8;
    });
});



d3.select('#hist').on('click',function(){
    force.stop();
    node_update.transition().duration(700)
        .attr('cx',function(d){return scaleX(d.xx)})
        .attr('cy',function(d){return height/2 - d.yy});
});



d3.select('#scatter').on('click',function(){
    force.stop();
    node_update.transition().duration(700)
        .attr('cx',function(d){return scaleX(d.score)})
        .attr('cy',function(d){return scaleY(d.score2)});
});


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
                var nr = dataPoint.radius +16,
                nx1 = dataPoint.x - nr,
                nx2 = dataPoint.x + nr,
                ny1 = dataPoint.y - nr,
                ny2 = dataPoint.y + nr;
    
                return function(quadPoint,x1,y1,x2,y2){
                    if(quadPoint.point && (quadPoint.point !== dataPoint)){
                        var x = dataPoint.x - quadPoint.point.x,
                            y = dataPoint.y - quadPoint.point.y,
                            l = Math.sqrt(x*x+y*y),
                            r = dataPoint.radius + quadPoint.point.radius;
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
    
scaleS = d3.scale.linear().domain([0,100]).range([-50,50]);


	return{
		congress: +d.congress,
		radius: 4,//1 + Math.random()*10,
		x: xStart + Math.random()*5,
		y: height/2 + (scaleS(Math.random()*100)),
		chamber: d.chamber,
		id: d.bioguide_id,
		state: d.state_abbrev,
        experience: d.experience,
    name: d.bioname,
		score: +d.dim1,
        score2: +d.dim2,
	}
}



