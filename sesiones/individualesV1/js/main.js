/*
*    main.js
*    Grafo de sesiones individuales
*/

var margin = { left:80, right:20, top:70, bottom:100 };
var height = 700 - margin.top - margin.bottom, 
    width = 800 - margin.left - margin.right;

var g = d3.select("#chart-area")
    .append("svg")
        .attr("viewBox", [-width / 2, -height / 2, width + margin.left + margin.right , height + margin.top + margin.bottom])
        //.attr("width", width + margin.left + margin.right)
        //.attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + - margin.left + 
            ", " + margin.top + ")");


//datos sesion
let nodos = []
let links = []

// info baja
let partidos = []
let regiones = []
let provincias = []

//Mapeo
let partidosId = []
let regionesId = []
let provId = []

// info superio
let asambleistas = []
let enlaces = []
let sesiones = []
let sesionid = 0

let validLinks = []
//let validNodes = []

//Elementos del buscador
const searchBar = document.getElementById('search');
const matchList = document.getElementById('match-list');

let simulation = d3.forceSimulation(nodos)
    .force("charge", d3.forceManyBody().strength(-40))
    .force("link", d3.forceLink(links).id(d => d.id))
    //.force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .alpha(0.5)
    .on("tick", tick);

simulation.force("link").links(validLinks);

let nodes = g.selectAll("circle")

simulation.nodes(nodos, d=> d.id)
simulation.alpha(0.3).restart();

const promises = [
    d3.json("data/info2.json"),
    d3.json("data/nodos.json"),
    d3.json("data/links.json"),
    d3.json("data/data.json"),
]

// date formate and parse
let parseDate = d3.timeParse("%Y-%m-%d")
let formatDate = d3.timeFormat("%e-%b-%Y")

//let allGroups1 = [...new Set(partidos)]
//var data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
//let myColor = d3.scaleSequential().domain(data).interpolator(d3.interpolateRainbow);
//console.log('mycolor', myColor(7))


let legend = d3.select("svg")
    .append("g")
    .attr("id", "g2")
    .attr("transform", "translate(" + (400) + 
            "," + (-200) + ")");
    //.attr("transform", "translate(" + (width - 50) + 
    //    "," + (height - 400) + ")");

// Tooltip
var tip = d3.tip().attr('class', 'd3-tip')
    .html(function(d) {
        let value = "Si"
        if(d.suplente === false){
            value = "No"
        }
        var text = "<strong>Nombre:</strong> <span style='color:red'>" + d.nombre + "</span><br>";
        text += "<strong>Partido:</strong> <span style='color:red;text-transform:capitalize'>" + d.partido + "</span><br>";
        text += "<strong>Provincia:</strong> <span style='color:red;text-transform:capitalize'>" + d.provincia + "</span><br>";
        text += "<strong>Region:</strong> <span style='color:red;text-transform:capitalize'>" + d.region + "</span><br>";
        text += "<strong>Suplente:</strong> <span style='color:red;text-transform:capitalize'>" + value  + "</span><br>";
        return text;
    });
g.call(tip);

$("#region-select")
    .on("change", function(){
        //console.log('Sesion actual:', sesionid)
        resetFlags()
        update(sesiones[sesionid]);
    })

$("#provincia-select")
    .on("change", function(){
        //console.log('Sesion actual:', sesionid)
        resetFlags()
        update(sesiones[sesionid]);
    })

$("#partido-select")
    .on("change", function(){
        //console.log('Sesion actual:', sesionid)
        resetFlags()
        update(sesiones[sesionid]);
    })

$("#map-select")
    .on("change", function(){
        //console.log('Sesion actual:', sesionid)
        resetFlags()
        removeLegends()
        updateLegends()
        update(sesiones[sesionid]);
    })

$("#date-slider").ionRangeSlider({
    skin: "big",
    min: 0,
    max: 399,
    step: 1,
    grid: true,         // default false (enable grid)
    onChange: function (data) {
        // fired on every range slider update
        //console.log('on change', data.from)
        searchBar.value = ''
        matchList.innerHTML = ''
        sesionid = data.from
        resetFlags()
        update(sesiones[sesionid])
    }
});

$("#search")
    .on("input", function() {
        console.log('hello search', this.value)
        searchSesiones(this.value)
    })

Promise.all(promises).then(allData => {
    let info = allData[0]
    asambleistas = allData[1]
    enlaces = allData[2]
    sesiones = allData[3]
    partidos = info.partidos
    regiones = info.regiones
    provincias = info.provincias

    partidosId = Object.values(partidos)
    regionesId = Object.values(regiones)
    provId = Object.values(provincias)

    manageData()
}).catch(
    err => console.log(err))

function manageData(){
    console.log('partidosid', partidosId)
    console.log('regionesid', regionesId)
    console.log('provid', provId)
    console.log('asambleistas', asambleistas)
    console.log('enlaces', Object.keys(enlaces).length)
    console.log('sesiones', sesiones)


    //updateLegends()
    
    sesionid = 0
    updateLegends()
    updateSelects()
    update(sesiones[0])    
}

function resetFlags(){
    for (let key in asambleistas) {
        if(asambleistas[key].visitado == true) asambleistas[key].visitado = false
    }
    for (let key in enlaces) {
        if(enlaces[key].visitado == 1) enlaces[key].visitado = 0
    }
}

function updateSelects(){
    var $dropdown = $("#partido-select");
    let partidos2 = Object.keys(partidos)
    $.each(partidos2, function() {
        //console.log("this", this)
        $dropdown.append($("<option />").val(this).text(this));
    });

    let $dropdownSelect = $("#provincia-select")
    let prov2 = Object.keys(provincias)
    $.each(prov2, function() {
        //console.log("this", this)
        $dropdownSelect.append($("<option />").val(this).text(this));
    });
}

function removeLegends(){
    legend.selectAll("g").remove()
}

function updateLegends() {
    let option = $("#map-select").val();
    console.log('mapeo Legends: ', option)

    if(option == "partidos"){
        list = Object.keys(partidos)
        list.forEach(function(element, i){
            let valueid = partidos[element]
            var legendRow = legend.append("g")
            .attr("transform", "translate(0, " + (i * 20) + ")");
        
            legendRow.append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", colorPartidos(valueid));
        
            legendRow.append("text")
                .attr("x", -10)
                .attr("y", 10)
                .attr("text-anchor", "end")
                .style("text-transform", "capitalize")
                .text(element);
        });
    }
    else if (option == "region") {
        list = Object.keys(regiones)
        list.forEach(function(element, i){
            let valueid = regiones[element]
            var legendRow = legend.append("g")
            .attr("transform", "translate(0, " + (i * 20) + ")");
        
            legendRow.append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", colorRegions(valueid));
        
            legendRow.append("text")
                .attr("x", -10)
                .attr("y", 10)
                .attr("text-anchor", "end")
                .style("text-transform", "capitalize")
                .text(element);
        });
    }
    else if ( option == "provincia") {
        list = Object.keys(provincias)
        list.forEach(function(element, i){
            let valueid = provincias[element]
            var legendRow = legend.append("g")
            .attr("transform", "translate(0, " + (i * 20) + ")");
        
            legendRow.append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", colorProvincias(valueid));
        
            legendRow.append("text")
                .attr("x", -10)
                .attr("y", 10)
                .attr("text-anchor", "end")
                .style("text-transform", "capitalize")
                .text(element);
        });
    }
}

function selectLegends(list, dict){
    //legend.attr('transform', function(d, i) { 
    //    return 'translate('+(10)+',' + (10+(25*i)) +')';
    //  })
    //  
    //let partidosL = Object.keys(partidos)
    list.forEach(function(element, i){
        //console.log('color', color1(partido))
        //console.log('colorF', partido)
        value = dict[element] 
        var legendRow = legend.append("g")
            .attr("transform", "translate(0, " + (i * 20) + ")");
        
        legendRow.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", );
    
        legendRow.append("text")
            .attr("x", -10)
            .attr("y", 10)
            .attr("text-anchor", "end")
            .style("text-transform", "capitalize")
            .text(element);
    });
}


function update(data) {

    // Standard transition time for the visualization
    let t = d3.transition()
        .duration(100);

    let region = $("#region-select").val();
    console.log('region select: ', region)

    let partidoTag = $("#partido-select").val();
    console.log('partido select: ', partidoTag)

    let provTag = $("#provincia-select").val();
    console.log('prov select: ', provTag)

    let mapeo = $("#map-select").val();
    console.log('mapeo select: ', mapeo)

    console.log('sesion', data)
    let nodosSesion =  data.nodes
    let linksSesion =  data.links

    let fecha = formatDate(parseDate(data.fecha))
    //console.log(fecha)
    
    //var d = {created_time : "2018-01-15T12:37:30+0000"}
    //var parseDate = d3.utcParse("%Y-%m-%dT%H:%M:%S%Z")
    //var formatDate = d3.timeFormat("%b-%Y")
    //console.log(formatDate(parseDate(d.created_time)))

    for (let i=0; i<nodosSesion.length; i++){
        id = nodosSesion[i]
        if(asambleistas[id]){
            asambleistas[id].visitado = true
        }
        else console.log('No existe', id)
    }

    let newnodes = []
    for (let key in asambleistas) {
        if(asambleistas[key].visitado == true) newnodes.push(asambleistas[key])
        //console.log(key, asambleistas[key]);
    }

    for (let l=0; l<linksSesion.length; l++){
        id = linksSesion[l]
        if(enlaces[id]){
            enlaces[id].visitado = 1
        }
        else console.log('No existe enlace id: ', id)
    }
    
    let newlinks = []
    for (let key in enlaces) {
        if(enlaces[key].visitado == 1) newlinks.push(enlaces[key])
    }

    newlinks = newlinks.map(d => Object.create(d));
    console.log('nodos asam', newnodes)
    console.log('links asam', newlinks)

    let validNodes =  newnodes.filter(function(d){
        if (region == "all" && partidoTag =="all" && provTag =="all" ) { return true; }
        else if (region != "all" && partidoTag !="all" && provTag !="all") { 
            return d.region == region && d.partido.trim() == partidoTag && d.provincia.trim() == provTag 
        } 
        else if (region != "all" && provTag !="all") {
            return (d.region == region && d.provincia.trim() == provTag) || d.partido.trim() == partidoTag
        }
        else if (region != "all" && partidoTag !="all") {
            return (d.region == region && d.partido.trim() == partidoTag) || d.provincia.trim() == provTag
        }
        else if (provTag !="all" && partidoTag !="all") {
            return (d.provincia.trim() == provTag && d.partido.trim() == partidoTag) || d.region == region
        }
        else {
            return d.region == region || d.partido.trim() == partidoTag || d.provincia.trim() == provTag
        }
    })
    console.log('valid nodes', validNodes)

    validLinks = validateLinks(validNodes, newlinks)

    nodes = nodes
    .data(validNodes, d => d.id)
    .join(
      enter => 
        enter.append("circle").attr("r", 5)
            .call(enter => enter.transition().attr("r", 5).attr("fill", function(d) { 
                //console.log('color', color(d, mapeo))
                return color(d, mapeo) }).transition().duration(500)),
      update => update.transition().duration(500).attr("fill", d => color(d, mapeo)),
      exit => exit.remove().transition().duration(500)
    );

    //nodes.append("title")
    //  .text(d => d.nombre);

    nodes
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide)

    simulation.nodes(validNodes, d=> d.id)
    simulation.force("link").links(validLinks);
    simulation.alpha(0.3).restart();

    $("#sesion")[0].innerHTML = data.sesion
    $("#votacion")[0].innerHTML = data.votacion
    $("#asunto")[0].innerHTML = data.asunto
    $("#fecha")[0].innerHTML = fecha
}

function tick() {
    nodes.attr("cx", d => d.x)
        .attr("cy", d => d.y);
} 


// para rangos cortos
function colorGroup(d){
    var allGroups = [...new Set(partidos)]
    //const scale = d3.scaleOrdinal().domain(allGroups).range(d3.schemePaired);
    const scale = d3.scaleOrdinal().domain(allGroups).range(colorsCol);
    return scale(d);
}

//function general para el mapeo de colores
function color(d, option){
    //console.log("option", option)
    if(option == "partidos"){
        let valueId = partidos[d.partido.trim()]
        return colorPartidos(valueId)
    }
    else if (option == "region") {
        let valueId = regiones[d.region.trim()]
        return colorRegions(valueId)
    }
    else if ( option == "provincia") {
        let valueId = provincias[d.provincia.trim()]
        return colorProvincias(valueId)
    }
}

function colorPartidos(d){
    let partidosD = [...new Set(partidosId)]
    let scale = d3.scaleSequential().domain([1, partidosD.length-1]).interpolator(d3.interpolateRainbow);
    return scale(d)
}

function colorRegions(d) {
    let regionesD = [...new Set(regionesId)]
    //let valueId = regiones[d.trim()]
    let scale = d3.scaleOrdinal().domain(regionesD).range(d3.schemeCategory10);
    return scale(d)
}

function colorProvincias(d){
    let prov = [...new Set(provId)]
    //let valueId = provincias[d.trim()]
    let scale = d3.scaleSequential().domain([0, prov.length-1]).interpolator(d3.interpolateRainbow);
    return scale(d)
}

function validateLinks(validNodes, linksSesion){
    let links = []
    //console.log('Nodos actuales: ', validNodes)
    //console.log('links actuales: ', linksSesion)
    for(let j=0;j<linksSesion.length;j++){
        //source = linksSesion[j].source
        for(let k=0;k<validNodes.length;k++){
            //console.log('Node:' , validNodes[k].id)
          if(validNodes[k].id === linksSesion[j].source){
            //console.log('igual: ', linksSesion[j].source)
            for(let m=0;m<validNodes.length;m++){
                //console.log('target :', linksSesion[j].target)
              if(validNodes[m].id === linksSesion[j].target){
                //console.log('target match:', linksSesion[j].target)
                links.push(linksSesion[j]);
                continue;
              } 
            } 
          }
        }
    }
    console.log('valid links', links)
    return links
}


function searchSesiones (searchText){
    console.log('Sesiones search', sesiones)
    let ses = Object.values(sesiones)
    let matches = ses.filter(sess => {
        const regex =  new RegExp(`^${searchText}`, 'gi')
        const regex2 =  new RegExp(`\\b.*${searchText}.*?\\b`, 'gi')
        let sesionN = sess.sesion.toString();
        return sesionN.match(regex) || sess.asunto.match(regex2)
      }); 
    if (searchText.length === 0 ){
      matches = []
      matchList.innerHTML = '';
    }
    console.log(matches)
    outputSesiones(matches)
}

function outputSesiones (matches){
    if (matches.length > 0){
        const html = matches.map(match => 
          `
          <a href="#"  id=${match.sesId}
          class="list-group-item list-group-item-action mb-1" data-toggle="list" role="tab" onclick="getId(this.id)">
            <p>${match.asunto.substr(0, 100)} 
              ... <span class="text-primary"> ${match.name}</span>
              <small> -- ${match.fecha} - ${match.hora}</small>
            </p>
            </a>
          `).
          join('');
          //console.log(html)
          matchList.innerHTML = html 
      }
      else matchList.innerHTML = '';
}

function getId (id){
    sesionid = id
    let sesion = sesiones[sesionid]
    console.log("id", id)
    console.log("sesion: ", sesion)
    searchBar.value = sesion.name
    matchList.innerHTML = '';
    update(sesion)


    let slider = $("#date-slider").data("ionRangeSlider");

    // Change slider, by calling it's update method
    slider.update({
        from: id,
    });

} 

