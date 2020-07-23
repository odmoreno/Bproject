/*
*    main.js
*    Minimapa
*/

var margin = { left:40, right:10, top:40, bottom:50 };
var height = 500 //- margin.top - margin.bottom, 
    width = 500 //- margin.left - margin.right;

var g = d3.select("#chart-area")
    //.append("svg")
    //    .attr("viewBox", [-width / 2, -height / 2, width + margin.left + margin.right , height + margin.top + margin.bottom])
    //    //.attr("width", width + margin.left + margin.right)
    //    //.attr("height", height + margin.top + margin.bottom)
    //.append("g")
    //    .attr("transform", "translate(" + (- margin.left +20) + 
    //        ", " + margin.top + ")");

let grafos = [23,24]
//[0,5,10,23,24]

// info cargada json
let info = []
let asambleistas = []
let enlaces = []
let sesiones = []

let sesionid = 0

let votesSet = [0,1,2,3,4]


//Elementos del buscador
const searchBar = document.getElementById('search');
const fechaList = document.getElementById('fecha-list');

// date formate and parse
let parseDate = d3.timeParse("%Y-%m-%d")
let formatDate = d3.timeFormat("%e-%b-%Y")

const promises = [
  d3.json("data/info.json"),
  d3.json("data/nodos.json"),
  d3.json("data/links.json"),
  d3.json("data/data.json"),
]

Promise.all(promises).then(allData => {
    info = allData[0]
    asambleistas = allData[1]
    enlaces = allData[2]
    sesiones = allData[3]

    manageData()
}).catch(
  err => console.log(err))

function drawGraphs() {
  for (let i =0; i<grafos.length; i++){
    g.append("svg")
      .attr("width", 300)
      .attr("height", 300)
      .attr("id", i)
    .append("circle")
      .attr("cx",150)
      .attr("cy", 150)
      .attr("r", 100)
      .attr("fill", "red");
  }
}

manageData = () => {
    console.log("info", info)
    console.log('Asambs: ', asambleistas)
    console.log('Sesiones: ', sesiones)
    //console.log('enlaces', Object.keys(enlaces).length)
    //console.log('enlaces: ', enlaces)

    //drawGraphs()
    grafos.map(id => {
      drawGraph(sesiones[id], id) 
    })
    //for (let i =0; i<grafos.length; i++){
    // drawGraph(sesiones[i])
    // //drawGraph(sesiones[i]) 
    //}
}


drawGraph = (data, id) => {
  
  const svg = g.append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("id", data.sesId)
    
  const defaultMap = "voto"
  let colorMap = defaultMap
  
  console.log('sesion', data)
  let nodosSesion =  data.nodes // pasa los nodos de las sesion y sus votos
  let linksSesion =  data.links

  for (let i=0; i<nodosSesion.length; i++){
        let _asamb = nodosSesion[i]
        //console.log("info asamb", _asamb)
        if(asambleistas[_asamb.id]){
            asambleistas[_asamb.id].visitado = true
            asambleistas[_asamb.id].voto = _asamb.voto
        }
        else console.log('No existe', id)
    }

  const newnodes = []
  for (let key in asambleistas) {
      if(asambleistas[key].visitado == true) newnodes.push(asambleistas[key])
      //console.log(key, asambleistas[key]);
  }
  for (let l=0; l<linksSesion.length; l++){
      id = linksSesion[l]
      if(enlaces[id]){
          //console.log("enlace: " , enlaces[id])
          enlaces[id].visitado = 1
      }
      else console.log('No existe enlace id: ', id)
  }
  
  const newlinks = []
  for (let key in enlaces) {
      if(enlaces[key].visitado == 1) newlinks.push(enlaces[key])
  }
  //newlinks = newlinks.map(d => Object.create(d));
  console.log('nodos asam', newnodes)
  console.log('links asam', newlinks)
  resetFlags()
  validNodes = [...newnodes]
  validLinks = [...newlinks]

  const simulation = d3.forceSimulation(validNodes, d => d.id)
      .force("charge", d3.forceManyBody().strength(-50))
      .force("link", d3.forceLink(validLinks).id(d => d.id))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", d3.forceX())
      .force("y", d3.forceY());

  //simulation.force("link").links(validLinks)
  const node = svg.append("g")
      .attr("fill", "#fff")
      //.attr("viewBox", [-width / 2, -height / 2, width , height])
    .selectAll("circle")
    .data(validNodes, d => d.id)
    .join(
      enter => 
        enter.append("circle").attr("r", 4)
            .call( enter => enter.transition().attr("r", 4).attr("fill", function(d) { 
                //console.log('color', color(d, mapeo))
                return color(d, colorMap) }).transition().duration(500))
            .call(drag(simulation)),
      update => update.transition().duration(500).attr("fill", d => color(d, colorMap)),
      exit => exit.remove().transition().duration(500)
    );

  node.append("title")
      .text(d => d.nombre);

  simulation.on("tick", () => {
    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
  });

  simulation.force("link", d3.forceLink(validLinks).strength(0.1))
  //simulation.alpha(0.5).restart();
  simulation.alphaTarget(0).restart();

}

color = (d, option) => {
  //console.log("option", option)
  if(option == "partidos"){
      let valueId = partidos[d.partido]
      return colorPartidos(valueId)
  }
  else if (option == "region") {
      let valueId = regiones[d.region]
      return colorRegions(valueId)
  }
  else if ( option == "provincia") {
      //let valueId = provincias[d.provincia.trim()]
      let valueId = provincias[d.provincia]
      return colorProvincias(valueId)
  }
  else if (option == "voto") {
      let valueId = d.voto
      return colorVotos(valueId)
  }
}

colorPartidos = (d) => {
  let partidosD = [...new Set(partidosId)]
  const colors = ["#1b70fc", "#158940", "#d50527", "#faff16", "#f898fd", "#24c9d7", "#cb9b64", "#866888", "#22e67a", "#e509ae", "#9dabfa", "#437e8a"]
  let scale = d3.scaleOrdinal().domain(partidosD).range(colors);
  return scale(d)

}

colorRegions = (d) => {
  let regionesD = [...new Set(regionesId)]
  let scale = d3.scaleOrdinal().domain(regionesD).range(d3.schemeCategory10);
  return scale(d)
}

colorProvincias = (d) => {
  let prov = [...new Set(provId)]
  let scale = d3.scaleSequential().domain([0, prov.length-1]).interpolator(d3.interpolateRainbow);
  return scale(d)
}

colorVotos = (d) => {
  let scale = d3.scaleOrdinal().domain(votesSet).range(d3.schemeCategory10);
  return scale(d)
}

function resetFlags(){
  for (let key in asambleistas) {
      if(asambleistas[key].visitado == true) asambleistas[key].visitado = false
  }
  for (let key in enlaces) {
      if(enlaces[key].visitado == 1) enlaces[key].visitado = 0
  }

}

drag = simulation => {
     
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }
  
  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  
  return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
}

