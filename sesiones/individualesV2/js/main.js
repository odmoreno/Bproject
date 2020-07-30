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
        .attr('id', 'g1')
        .attr("transform", "translate(" + (- margin.left +20) + 
            ", " + margin.top + ")");


var w2 = width
var h2 = height

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
//filtros
let itemsPartidos = []
let itemsRegiones = []
let itemsProv = []

// info superio
let asambleistas = []
let enlaces = []
let sesiones = []
let sesionid = 0

let validLinks = []
//let validNodes = []

let codeVotes = {
    "0": "abstencion",
    "1": "ausente",
    "2": "si",
    "3": "no",
    "4": "blanco" 
}
let votesSet = [0,1,2,3,4]

let selectDict ={}
let mapDict ={}

//modo de layout debido al mapeo de grupos: prov, regiones, votos, partidos
let modo = 0

//Elementos del buscador
const searchBar = document.getElementById('search');
//const matchList = document.getElementById('match-list');
const fechaList = document.getElementById('fecha-list');

let simulation = d3.forceSimulation(nodos)
    .force("charge", d3.forceManyBody().strength(-40))
    .force("link", d3.forceLink(links).id(d => d.id))
    //.force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .on("tick", tick);
//simulation.alpha(0.3).restart();
//simulation.force("link", d3.forceLink(validLinks).distance(-10).strength(0.6))

let simulation2 = d3.forceSimulation(nodos)
    .force("charge", d3.forceManyBody().strength(-40))
    .force("link", d3.forceLink(links).id(d => d.id))
    //.force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .on("tick", tick);

let nodes = g.append("g")
    .attr("fill", "#fff")
    //.attr("stroke", "#fff")//#000
    //.attr("stroke-width", 1.5)
  .selectAll("circle")

let labels = g.selectAll("text")

const promises = [
    d3.json("data/info.json"),
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
    .attr("transform", "translate(" + (320) + 
            "," + (-200) + ")")
    //.attr("transform", "translate(" + (width - 50) + 
    //    "," + (height - 400) + ")");
let idg2 = d3.select("#g2")

// Tooltip
var tip = d3.tip().attr('class', 'd3-tip')
    .html(function(d) {
        let value = "Si"
        //if (modo == 1) d = d.data
        if(d.suplente === false){
            value = "No"
        }
        var text = "<strong>Nombre:</strong> <span style='color:aqua'>" + d.nombre + "</span><br>";
        text += "<strong>Partido:</strong> <span style='color:aqua;text-transform:capitalize'>" + d.partido + "</span><br>";
        text += "<strong>Provincia:</strong> <span style='color:aqua;text-transform:capitalize'>" + d.provincia + "</span><br>";
        text += "<strong>Region:</strong> <span style='color:aqua;text-transform:capitalize'>" + d.region + "</span><br>";
        text += "<strong>Voto:</strong> <span style='color:aqua;text-transform:capitalize'>" + codeVotes[d.voto]  + "</span><br>";
        text += "<strong>Suplente:</strong> <span style='color:aqua;text-transform:capitalize'>" + value  + "</span><br>";
        return text;
    });
g.call(tip);

// All jquery instances
$("#region-select")
    .on("change", function(){
        //console.log('Sesion actual:', sesionid)
        resetFlags()
        resetOpacity()
        update(sesiones[sesionid]);
    })

$("#provincia-select")
    .on("change", function(){
        //console.log('Sesion actual:', sesionid)
        resetFlags()
        resetOpacity()
        update(sesiones[sesionid]);
    })

$("#partido-select")
    .on("change", function(){
        //console.log('Sesion actual:', sesionid)
        resetFlags()
        resetOpacity()
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

$("#info-select")
.on("change", function(){
    //resetFlags()
    //removeLegends()
    //updateLegends()
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
        //searchBar.value = ''
        //matchList.innerHTML = ''
        //let dia = ("#datepicker").datepicker().getDate()
        //console.log("dia:", dia)
        fechaList.innerHTML = '';
        sesionid = data.from
        resetFlags()
        update(sesiones[sesionid])
    }
});

var leave = 1
$("#search")
.on("input", function() {
    console.log('hello search', this.value)
    resetFlags()
    searchSesiones(this.value)
})
.on("click", function(){
    console.log('hello click', this.value)
    resetFlags()
    searchSesiones(this.value)
})
.on("focusout", function(){
    console.log('Focus out')
    if(leave == 1 ){
        console.log('salir')
        fechaList.innerHTML = '';
    } 
    leave = 1 
})

var list = $("#search")
$(document).keyup(function(e) {
    if (e.key === "Escape") { // escape key maps to keycode `27`
       console.log('esc')
       fechaList.innerHTML = '';  
   }
   //if ($("#search").is(":focus")) {
   // //I have the focus
   //     console.log('focus serach ')
   // }


});

$("#fecha-list")
.on("mouseenter", function(){
    console.log('enter')
    leave = 0
    //fechaList.innerHTML = '';
})
.on("mouseleave", function(){
    console.log('leave')
    leave = 1
    //fechaList.innerHTML = '';
})

//$("#fecha-list").on('mouseover', function(){
//    console.log('onmouseover')
//})

$("#datepicker").datepicker( {
    format: "dd-mm-yyyy",
    startView: "months", 
    minViewMode: "days",
    maxViewMode: 2,
    orientation: "bottom auto",
    startDate: "14-05-2017",
    endDate: "23-10-2018",
    clearBtn: true,
    autoclose: true
}).on('changeDate', function(e) {
    //console.log('changeDate:', e.date)
    resetFlags()
    let date = e.date
    console.log("month:", date.getMonth() + 1)
    //console.log("year:", date.getFullYear())
    searchFechas(date)
}).on('clearDate', function(e) {
    console.log('year:', e.date)
    fechaList.innerHTML = '';
});

$('#btn-add').click(addFilter)
//$('#btn-add-map').click(addFilter2)

$('#grupos-select').multiselect({
    buttonWidth: '120px',
    onChange : onChangeSelect2
});

$('#colores-select').multiselect({
    buttonWidth: '120px',
    onChange : onChangeSelect2
});


Promise.all(promises).then(allData => {
    let info = allData[0]
    asambleistas = allData[1]
    enlaces = allData[2]
    sesiones = allData[3]
    partidos = info.partidos
    regiones = info.regiones
    provincias = info.provincias

    console.log("info", info)
    partidosId = Object.values(partidos)
    regionesId = Object.values(regiones)
    provId = Object.values(provincias)
    itemsPartidos = Object.keys(partidos)
    itemsRegiones = Object.keys(regiones)
    //itemsRegiones.pop()
    itemsProv = Object.keys(provincias)

    manageData()
}).catch(
    err => console.log(err))

function manageData(){
    console.log('partidosid', itemsPartidos)
    console.log('regionesid', itemsRegiones)
    console.log('provid', itemsProv)
    console.log('asambleistas', asambleistas)
    console.log('enlaces', Object.keys(enlaces).length)
    console.log('sesiones', sesiones)

    
    selectDict ={
    "0": { "id": 'select-partidos', "values": itemsPartidos, "name": "Partidos", "flag": false, "id2": "div-partidos", "idstr": "0"},
    "1": { "id": 'select-regiones', "values": itemsRegiones, "name": "Regiones", "flag": false, "id2": "div-regiones", "idstr": "1"},
    "2": { "id": 'select-provincias', "values": itemsProv, "name": "Provincias", "flag": false, "id2": "div-provincias", "idstr": "1"}
    }
    
    mapDict = {
        "0": { "id": 'select-colores', "values": ["partidos", "region", "provincia", "voto"], "name": "Colores", "flag": false, "id2": "div-colores", "idstr": "0"},
        "1": { "id": 'select-grupos', "values": ["curul", "partido", "region", "provincia", "voto"], "name": "Posición", "flag": false, "id2": "div-grupos", "idstr": "1"}
    }

    sesionid = 0
    updateLegends()
    //updateSelects()
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

function resetOpacity(){
    for (let key in asambleistas) {
        if(asambleistas[key].opacidad == 0.2) asambleistas[key].opacidad = 1
    }
}

//function updateSelects(){
//    var $dropdown = $("#partido-select");
//    let partidos2 = Object.keys(partidos)
//    $.each(partidos2, function() {
//        //console.log("this", this)
//        $dropdown.append($("<option />").val(this).text(this));
//    });
//
//    let $dropdownSelect = $("#provincia-select")
//    let prov2 = Object.keys(provincias)
//    $.each(prov2, function() {
//        //console.log("this", this)
//        $dropdownSelect.append($("<option />").val(this).text(this));
//    });
//}

function removeLegends(){
    legend.selectAll("g").remove()
}

function updateLegends() {
    //let option = $("#map-select").val()
    //console.log('mapeo Legends: ', option)

    let option;
    const defaultVal = "voto";
    option = defaultVal
    
    let colorSelect = $("#colores-select").val()
    if(colorSelect){
        option = colorSelect
        console.log('Legend select', option)
    }

    let label = d3.select("#g2")
        
    label.append("g").attr("transform", "translate(10, -40)")
            .append("text")
            .attr("x", 20)
            .attr("y", 10)
            .attr("text-anchor", "start")
            .style("text-transform", "capitalize")
                .text(option);

    if(option == "partidos"){
        
        list = Object.keys(partidos)
        list.forEach(function(element, i){
            let valueid = partidos[element]
            var legendRow = legend.append("g")
            .attr("transform", "translate(-45, " + (i * 20) + ")");
        
            legendRow.append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", colorPartidos(valueid));
        
            legendRow.append("text")
                .attr("x", 20)
                .attr("y", 10)
                .attr("text-anchor", "start")
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
                .attr("x", 30)
                .attr("y", 10)
                .attr("text-anchor", "start")
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
                .attr("x", 30)
                .attr("y", 10)
                .attr("text-anchor", "start")
                .style("text-transform", "capitalize")
                .text(element);
        });
    }
    else if (option == "voto") {
        list = votesSet
        list.forEach(function(element, i){
            let valueid = element
            var legendRow = legend.append("g")
            .attr("transform", "translate(0, " + (i * 20) + ")");
        
            legendRow.append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .attr("fill", colorVotos(valueid));
        
            legendRow.append("text")
                .attr("x", 30)
                .attr("y", 10)
                .attr("text-anchor", "start")
                .style("text-transform", "capitalize")
                .text(codeVotes[element]);
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

function searchFechas (searchDate){
    let searchMonth = searchDate.getMonth() + 1
    let searchYear = searchDate.getFullYear()
    let searchDia = searchDate.getDate()
    console.log("month:", searchMonth)
    console.log("year:", searchYear)
    console.log("Dia:", searchDia)

    let ses = Object.values(sesiones)
    let matches = ses.filter(sess => {
        let fechaSes = parseDate(sess.fecha)
        let mes = fechaSes.getMonth() + 1
        let year = fechaSes.getFullYear()
        let dia = fechaSes.getDate()
        //console.log("parse", fechaSes)
        //console.log("mes", fechaSes.getMonth() + 1)
        //console.log("year:", fechaSes.getFullYear())
        return searchYear === year && searchMonth === mes && searchDia === dia
      }); 
    console.log(matches)
    
    if (matches.length > 5)
        matches = matches.slice(0,5)

    outputFechas(matches)
}
function outputFechas(matches){
    if (matches.length > 0){
        const html = matches.map(match => 
          `
          <a href="#"  id=${match.sesId}
          class="list-group-item list-group-item-action mb-1" data-toggle="list" role="tab" onclick="getId(this.id)">
            <small>${match.asunto.substr(0, 100)} 
              ... <span class="text-primary"> ${match.name}</span>
              <small> -- ${match.fecha} - ${match.hora}</small>
            </small>
            </a>
          `).
          join('');
          //console.log(html)
          fechaList.innerHTML = html 
      }
      else fechaList.innerHTML = '';
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
      //matchList.innerHTML = '';
      fechaList.innerHTML = ''
    }
    if (matches.length > 5)
        matches = matches.slice(0,5)

    console.log(matches)
    outputSesiones(matches)
}

function outputSesiones (matches){
    if (matches.length > 0){
        const html = matches.map(match => 
          `
          <a href="#"  id=${match.sesId}
          class="list-group-item list-group-item-action mb-1" data-toggle="list" role="tab" onclick="getId(this.id)">
            <small>${match.asunto.substr(0, 100)} 
              ... <span class="text-primary"> ${match.name}</span>
              <small> -- ${match.fecha} - ${match.hora}</small>
            </small>
            </a>
          `).
          join('');
        //console.log(html)
         // matchList.innerHTML = html 
         fechaList.innerHTML = html
      }
      else fechaList.innerHTML = '';
}

function getId (id){
    sesionid = id
    let sesion = sesiones[sesionid]
    console.log("id", id)
    console.log("sesion: ", sesion)
    //searchBar.value = sesion.name
    //matchList.innerHTML = '';
    fechaList.innerHTML = ''
    update(sesion)
    //simulation.on("tick", tick);
    let slider = $("#date-slider").data("ionRangeSlider");
    // Change slider, by calling it's update method
    slider.update({
        from: id,
    });
} 

function update(data) {

    d3.select("#g1")
        .attr("transform", "translate(" + (- margin.left +20) + 
            ", " + margin.top + ")");

    modo = 0
    console.log("UPDATE!")

    // Standard transition time for the visualization
    let t = d3.transition()
        .duration(500);

    let g1 = d3.select("#g1")
    //console.log('g1', g1)
    g1.style("visibility", "visible")

    let pleno = d3.select("#pleno")
    let pleno2 = d3.select("#pleno2")
    if(pleno){
        pleno.remove()
        pleno2.remove()
    }

    const defaultMap = "voto"
    let colorMap = defaultMap

    let colorSelect = $("#colores-select").val()
    
    if(colorSelect){
        colorMap = colorSelect
        console.log('color select', colorMap)
    }

    let filter = $("#filter-select").val()
    console.log('Filter select: ', filter)

    const defaultGroup = "voto"
    let groupMap = defaultGroup

    let groupSelect = $("#grupos-select").val()
    if(groupSelect){
        groupMap = groupSelect
        console.log('Group select', groupMap)
    }

    console.log('sesion', data)
    let nodosSesion =  data.nodes // pasa los nodos de las sesion y sus votos
    let linksSesion =  data.links

    let parse = parseDate(data.fecha)
    //console.log("parse", parse)
    //console.log("mes", parse.getMonth() + 1)
    //console.log("month:", d3.timeMonth(parse))
    let fecha = formatDate(parseDate(data.fecha))
    //console.log(fecha)
    
    
    //var d = {created_time : "2018-01-15T12:37:30+0000"}
    //var parseDate = d3.utcParse("%Y-%m-%dT%H:%M:%S%Z")
    //var formatDate = d3.timeFormat("%b-%Y")
    //console.log(formatDate(parseDate(d.created_time)))

    for (let i=0; i<nodosSesion.length; i++){
        let _asamb = nodosSesion[i]
        //console.log("info asamb", _asamb)
        if(asambleistas[_asamb.id]){
            asambleistas[_asamb.id].visitado = true
            asambleistas[_asamb.id].voto = _asamb.voto
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

    newnodos = filterFunction(newnodes)
    let validNodes; 
    let validLinks;

    if (groupMap === "voto" || !groupSelect){
        modo = 0
        console.log("Controlar el :", groupMap)
        validNodes = [...newnodes]
        validLinks = [...newlinks]
        //validLinks = validateLinks(validNodes, newlinks)

        nodes = nodes
        .data(validNodes, d => d.id)
        .join(
          enter => 
            enter.append("circle").attr("r", 7)
                .call( enter => enter.transition().attr("r", 7).attr("fill", function(d) { 
                    //console.log('color', color(d, mapeo))
                    return color(d, colorMap) }).transition().duration(500) ),
                //.call(drag(simulation2)),
          update => update.transition().duration(500).attr("fill", d => color(d, colorMap)),
          exit => exit.remove().transition().duration(500)
        );
        //nodes.append("text")
        //    .attr("x", d=> d.x )
        //    .attr("y", d=> d.y)     
        //    .text(d => codeVotes[d.voto])
        //    
                    
        nodes
            .on("mouseover", tip.show)
            .on("mouseout", tip.hide)
        nodes
            .style('opacity', d=> d.opacidad)
 
        simulation2.nodes(validNodes, d=> d.id)
        simulation2.force("charge", d3.forceManyBody().strength(-50))
        simulation2.force("link").links(validLinks)
        //simulation.force("link", d3.forceLink(validLinks).id(d => {
        //    console.log('link F', d)
        //    return d.id
        //}).distance(-10).strength(-10))
        simulation2.alpha(0.5).restart();

        drawClusters(validNodes, groupMap)
        //simulation2.alpha(0.5).restart();

    }
    else if (groupMap == "curul"){
        console.log('Por curul')

        t

        g1.style("visibility", "hidden")
        let curulesPorFila = [[2, 4], [3, 5], [4, 6], [5, 7], [6, 9], [8, 10]];
    
        var xyfactor = w2 / 40.0;

        console.log('factor', xyfactor)
    
        var acx = (690-w2) / 8.4
        var cx = w2 / 2 + acx;// - 20;
        var cy = h2 / 4 - 20;
        var tcx = (800-w2)*0.28;
        var tcy = -(690-w2)/23.0;

        let nodos = nodosPrincipales(xyfactor, colorMap)
        //let pleno = d3.select("svg")
        
        d3.select("#pleno").remove()
        d3.select("#pleno2").remove()

        let sup = d3.select("svg").append('g').attr("id", "pleno")
            .attr("transform", "translate(" + (-400) + 
                ", " + (-200) + ")");

        sup.selectAll('circle').data(nodos)
            .enter()
            .append('circle')
            .attr("r", d=> d.r).attr('cx', d=> d.cx).attr('cy', d=>d.cy).attr('fill', d=> color(d, colorMap))
            .on("mouseover", tip.show)
            .on("mouseout", tip.hide)

        let test =  getNodosEdit(newnodes, curulesPorFila, cx, cy, tcx, tcy, xyfactor)
        console.log('edit', test)
    
        let inf = d3.select("svg").append('g').attr("id", "pleno2")
            .attr("transform", "translate(" + (-400) + 
                ", " + (-200) + ")");

        inf.selectAll('circles').data(test, d=> d.id)
            .join(
                enter => 
                    enter.append('circle')
                        .call(enter => enter.attr("r", d=> d.r).attr('cx', d=> d.cx).attr('cy', d=> d.cy).attr('fill', d=> color(d, colorMap))
                        .style('opacity', d=> d.opacidad)
                        .on("mouseover", tip.show).on("mouseout", tip.hide) ),
                update => update.transition().duration(500),
                exit => exit.remove().transition().duration(500)
            );
        
    } 
    else {
        console.log("grupo: ", groupMap)

        d3.select("#g1")
            .attr("transform", "translate(" + (- margin.left + 50) + 
                ", " + margin.top + ")");
        modo = 1 
        //let group = organizeData(newnodes, groupMap)
        //console.log('Data group', group)
        //
        //const root = d3.hierarchy(group)
        //const links = root.links();
        //const nodos = root.descendants();
//
        //console.log("root", root)
        //console.log("nodos", nodos)
        //console.log("links", links)

        let group = dataGroup(newnodes, groupMap)
        //let group = Array.from(d3.group(newnodes, d=> d.region))
        console.log('Data group', group)

        let linksGroup = generateLinks(group)
        
        validNodes = [...newnodes]
        validLinks = [...linksGroup]
        
        console.log("valid N:", validNodes)
        console.log("valid L:", validLinks)

        nodes = nodes
         .data(validNodes, d=> { return d.id
             //if(d.depth ==2){
             //   //console.log("id", d.data.id)
             //   return d.data.id
             //}
         })
         .join(
           enter => 
             enter.append("circle").attr("r", 7)//.attr("stroke", d=> d.depth == 2 ? "#fff" : "#fff") //#000
                 .call(enter => enter.transition().attr("r", 7).attr("fill", function(d) { 
                     return color(d, colorMap)
                    //if (d.depth ==2) {
                    //    //console.log('info', d.data)
                    //    //console.log('color: ', color(d.data, colorMap))
                    //    return color(d.data, colorMap)
                    //}
                      }).transition().duration(500)),
                 //.call(drag(simulation)),
           update => update.transition().duration(500)//.attr("stroke", d=> d.depth == 2 ? "#fff" : "#fff")
                .attr("fill", d => {
                    return color(d, colorMap)
                    //if (d.depth ==2) {
                    //    //console.log('info', d.data)
                    //    //console.log('color: ', color(d.data, colorMap))
                    //    return color(d.data, colorMap)
                    //}
                 }),
           exit => exit.remove().transition().duration(500)
         );

        nodes
            .on("mouseover", tip.show)
            .on("mouseout", tip.hide)
             
        //nodes.append("title")
        //    .text(d => d.data.name);

        nodes
            .style('opacity', d=> { return d.opacidad
                //if(d.depth ==2){ 
                //    //console.log("opacidad", d.data.opacidad)
                //    return d.data.opacidad}
            })

        //simulation.nodes(validNodes, d=> {
        //    if(d.depth ==2){ return d.data.id}
        //})
        ////simulation.force("link").links(validLinks);
        //simulation.force("charge", d3.forceManyBody().strength(-110))
        ////simulation.force("link").links(validLinks)
        //simulation.force("link", d3.forceLink(validLinks).distance(-10).strength(0.6))
        //simulation.alpha(0.5)
        
        simulation.nodes(validNodes, d=> d.id)  
        simulation.force("charge", d3.forceManyBody().strength(-60))
        simulation.force("link", d3.forceLink(validLinks).distance(-1).strength(0.4))
        simulation.alpha(0.3).restart();
        drawClusters(validNodes, groupMap)
    }

    $("#sesion")[0].innerHTML = data.sesion
    $("#votacion")[0].innerHTML = data.votacion
    $("#asunto")[0].innerHTML = data.asunto
    //$("#fecha")[0].innerHTML = fecha
    //$("#dateP")[0].innerHTML = fecha
    document.getElementById('dateP').value = fecha
}

function drawClusters (nodos, mapOption) {
    let group = {"0": '', "1":'', "2":'', "3":'', "4":'', "5": '', "6":'', "7":'', "8":'', "9":'', "10": '', "11":'', "12":'', "13":'', "14":'', 
    "15":'', "16": '', "17":'', "18":'', "19":'', "20":'', "21":'', "22":'', "23":'', "24":'', "25":''}
    //if (mapOption == 'voto'){
    //    console.log('1')
    //    group = {"0": '', "1":'', "2":'', "3":'', "4":''}
    //}
    //else if (mapOption == 'region'){
    //    console.log('2')
    //    group = {"0": '', "1":'', "2":'', "3":'', "4":''}
    //}
    //console.log('group cluster:', nodos[0])
    for (let l=0; l<nodos.length; l++){
        let n = nodos[l]
        if (n.x){
            //if(group[n.voto]){}
            //else group[n.voto] = n
            if (mapOption == 'voto'){
                group[n.voto] = n
            }
            else if(mapOption == 'region'){
                group[regiones[n.region]] = n
            }
            else if(mapOption == 'partido'){
                group[partidos[n.partido]] = n
            }
            else if(mapOption == 'provincia'){
                group[provincias[n.provincia]] = n
            }
        }
    }
    console.log('final: ', group)
    let data = Object.values(group)
    data = data.filter(n=> {
        if(n){
            return n
        }
    })
    labels = labels
        .data(data, d => d.id)
        .join(
          enter => 
            enter.append("text")
                .attr("x", d=> (d.x))
                .attr("y", d=> d.y)
                .text(d => optionMap(mapOption,d))
                //.attr("font-size", 10)
                .attr("font-family", "sans-serif")
                .attr("text-anchor", "middle")
                .attr("font-size", "1rem"),
                //.call( enter => enter.transition().attr("r", 7).attr("fill", function(d) { 
                //    //console.log('color', color(d, mapeo))
                //    return color(d, colorMap) }).transition().duration(500) ),
                //.call(drag(simulation2)),
          update => update.transition().duration(500).text(d => optionMap(mapOption,d)),
          exit => exit.remove().transition().duration(500)
        );
}

optionMap = (option,d) => {
    if (option == 'voto'){
        return codeVotes[d.voto]
    }
    else if(option == 'region'){
        return d.region
        //group[regiones[n.region]] = n
    }
    else if(option == 'partido'){
        return d.partido
        //group[regiones[n.region]] = n
    } else if(option == 'provincia'){
        return d.provincia
    }
}

function tick() {
    nodes.attr("cx", d => d.x)
        .attr("cy", d => d.y)

    g.selectAll("text")
        .attr("x", d=> d.x )
        .attr("y", d=> d.y + 30)
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
        let valueId = partidos[d.partido]
        return colorPartidos(valueId)
    }
    else if (option == "region") {
        let valueId = regiones[d.region]
        return colorRegions(valueId)
    }
    else if ( option == "provincia") {
        //let valueId = provincias[d.provincia.trim()]
        let valueid
        if (provincias[d.provincia]) {
            valueId = provincias[d.provincia]    
        }
        else valueId = 24
        return colorProvincias(valueId)
    }
    else if (option == "voto") {
        let valueId = d.voto
        return colorVotos(valueId)
    }
}

function colorPartidos(d){
    let partidosD = [...new Set(partidosId)]
    const colors = ["#1b70fc", "#158940", "#d50527", "#faff16", "#f898fd", "#24c9d7", "#cb9b64", "#866888", "#22e67a", "#e509ae", "#9dabfa", "#437e8a"]
    let scale = d3.scaleOrdinal().domain(partidosD).range(colors);
    return scale(d)
    //let scale = d3.scaleSequential().domain([1, partidosD.length-1]).interpolator(d3.interpolateRainbow);
    //return scale(d)
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

function colorVotos(d){
    let scale = d3.scaleOrdinal().domain(votesSet).range(d3.schemeCategory10);
    return scale(d)
}

// funcion para los filtros dinamicos
function addFilter () {
    let option = $("#filter-select").val();
    //console.log('Filter select: ', option)
    
    if (selectDict[option]){
      let value = selectDict[option]
      //console.log(value)
      if (value.flag === false){
        createSelect(value)
        selectDict[option].flag = true
      }
    }else console.log('No existe option:', option)
}

function createSelect(el) { 
  let getForm = document.getElementById("show-filters")
  //console.log('form', getForm)
  const divRow = document.createElement("DIV");
  divRow.setAttribute("class", "d-flex flex-row")
  divRow.setAttribute("id", el.id2)
  const div1 = document.createElement("DIV");
  div1.setAttribute("class", "p-2 d-flex flex-column")
  const label = document.createElement("LABEL");
  label.setAttribute("for", el.id);
  const textlabel = document.createTextNode(el.name + ':');
  label.appendChild(textlabel)
  const select = document.createElement("SELECT");
  select.setAttribute("id", el.id);
  select.setAttribute("multiple", "multiple");
  for(var i = 0;i<el.values.length;i++) {
    var item = el.values[i];
    var newOption = document.createElement("option");
    newOption.setAttribute("value", item);
    var textNode = document.createTextNode(item);
    //newOption.setAttribute("selected", "selected")
    newOption.appendChild(textNode);
    select.appendChild(newOption);
  }
  const div2 = document.createElement("DIV");
  div2.setAttribute("class", "p-2")
  const htmlbtn = `<button type="button" id="btn-remove ${el.id2} ${el.idstr}" class="btn btn-outline-primary" onclick="getIdBtn(this.id)">-</button>`;
  div2.innerHTML = htmlbtn
  div1.appendChild(label)
  div1.appendChild(select)
  divRow.appendChild(div1)
  divRow.appendChild(div2)
  getForm.appendChild(divRow)
  iniciarSelect(el.id, el.name)
 }

 function iniciarSelect(idSel, name){
    //console.log('inside multiple selet', idSel)
    let newid = '#'+idSel
    currentid = newid
   $(newid).multiselect({
     //buttonText: function(options, select) {
     //  if (options.length === 0) {
     //    return name;
     //  }
     //},
     buttonWidth: '120px',
     includeSelectAllOption: true,
     selectAllText: 'Todas',
     allSelectedText: "Todas",
     onChange : onChangeSelect,
     onSelectAll: onSelectAll,
     onDeselectAll: onDeselectAll 
   });
  }
  
function onChangeSelect(element, checked){
    //console.log('id select: ', element[0].parentElement.id)
    //console.log('Current value:', element.val())
    let stringid = '#' + element[0].parentElement.id + ' option:selected'
    let values = $(stringid).map(function(a, item){return item.value;});
    console.log(values)
    resetOpacity()
    update(sesiones[sesionid]);
}
  
function onSelectAll(){
    console.log("On select todas")
    resetOpacity()
    update(sesiones[sesionid]);
}

function onDeselectAll(){
    console.log("On Deselect todas")
    update(sesiones[sesionid]);
}

function getIdBtn(id2){
  console.log("Function onclick", id2)
  let splitid = id2.split(" ")
  //console.log(splitid)
  const btn = document.getElementById(splitid[1]);
  //console.log("delete", btn)
  btn.remove()
  selectDict[splitid[2]].flag = false
  resetOpacity()
  update(sesiones[sesionid]);

}
  

function filterFunction(nodos){
    console.log("Funcion de filtrado dinamico")
    let partidos = $("#select-partidos").val();
    //console.log('Partidos select: ', partidos)      
    let regiones = $("#select-regiones").val();
    //console.log('Regiones select: ', regiones)
    let provincias = $("#select-provincias").val();
    //console.log('Prov select: ', provincias)

    if(partidos && !regiones && !provincias) {
        console.log("Solo existen partidos")
        console.log('Partidos select: ', partidos)
        //console.log("nodos", nodos)
        if (partidos.length > 0 ){
            for (let i=0; i<nodos.length; i++){
                let d = nodos[i]
                for (let j= 0; j<partidos.length; j++){
                    if(d.partido != partidos[j]) nodos[i].opacidad = 0.2
                    else{
                        nodos[i].opacidad = 1
                        break;
                    }
                }
            }
        }
        else if (partidos.length == 0){
            for (let i=0; i<nodos.length; i++){
                nodos[i].opacidad = 0.2
            }
        }
    }
    else if(!partidos && regiones && !provincias) {
        console.log("Solo existen regiones")
        console.log('Regiones select: ', regiones)
        //console.log("nodos", nodos)
        if (regiones.length > 0 ){
            for (let i=0; i<nodos.length; i++){
                let d = nodos[i]
                for (let j= 0; j<regiones.length; j++){
                    if(d.region != regiones[j]) nodos[i].opacidad = 0.2
                    else{
                        nodos[i].opacidad = 1
                        break;
                    }
                }
            }
        }
        else if (regiones.length == 0){
            for (let i=0; i<nodos.length; i++){
                nodos[i].opacidad = 0.2
            }
        }
    }
    else if(!partidos && !regiones && provincias) {
        console.log("Solo existen regiones")
        console.log('Regiones select: ', regiones)
        //console.log("nodos", nodos)
        if (provincias.length > 0 ){
            for (let i=0; i<nodos.length; i++){
                let d = nodos[i]
                for (let j= 0; j<provincias.length; j++){
                    if(d.provincia != provincias[j]) nodos[i].opacidad = 0.2
                    else{
                        nodos[i].opacidad = 1
                        break;
                    }
                }
            }
        }
        else if (provincias.length == 0){
            for (let i=0; i<nodos.length; i++){
                nodos[i].opacidad = 0.2
            }
        }
    }
    else if (partidos && regiones && !provincias){
        console.log("Solo existen partidos y regiones")
        console.log('Partidos select: ', partidos)
        console.log('Regiones select: ', regiones)
        //console.log("nodos", nodos)
        if (partidos.length > 0 || regiones.length > 0 ){
            for (let i=0; i<nodos.length; i++){
                let d = nodos[i]
                for (let j= 0; j<partidos.length; j++){
                    if(d.partido == partidos[j]) {
                        nodos[i].opacidad = 1
                        //console.log('nodo F', nodos[i])
                        for (k=0; k<regiones.length; k++){
                            if(d.region == regiones[k]) {
                                nodos[i].opacidad = 1
                                break;
                            }
                            else nodos[i].opacidad = 0.2
                        } 
                        break;
                    }
                    else{
                        nodos[i].opacidad = 0.2
                    }
                }
            }
        }
        else if (regiones.length == 0){
            console.log("No hay regiones")
        }
    }

    return nodos
}

/*
// function para mapeos din
function addFilter2() { 
    let option = $("#mapeo-select").val();  
    console.log('map selec', option)
    if (mapDict[option]){
        let value = mapDict[option]
        //console.log(value)
        if (value.flag === false){
          createSelect2(value)
          mapDict[option].flag = true
        }
      }else console.log('No existe option:', option)
}

function createSelect2(el) { 
    let getForm = document.getElementById("show-maps")
    //console.log('form', getForm)
    const divRow = document.createElement("DIV");
    divRow.setAttribute("class", "d-flex flex-row")
    divRow.setAttribute("id", el.id2)
    const div1 = document.createElement("DIV");
    div1.setAttribute("class", "p-2  d-flex flex-column")
    const select = document.createElement("SELECT");
    select.setAttribute("id", el.id);
    const label = document.createElement("LABEL");
    label.setAttribute("for", el.id);
    const textlabel = document.createTextNode(el.name + ':');
    label.appendChild(textlabel)
    //select.setAttribute("multiple", "multiple");
    for(var i = 0;i<el.values.length;i++) {
      var item = el.values[i];
      var newOption = document.createElement("option");
      newOption.setAttribute("value", item);
      var textNode = document.createTextNode(item);
      newOption.appendChild(textNode);
      select.appendChild(newOption);
    }
    const div2 = document.createElement("DIV");
    div2.setAttribute("class", "p-2")
    const htmlbtn = `<button type="button" id="btn-remove ${el.id2} ${el.idstr}" class="btn btn-outline-info" onclick="getIdBtn2(this.id)">-</button>`;
    div2.innerHTML = htmlbtn
    div1.appendChild(label)
    div1.appendChild(select)
    divRow.appendChild(div1)
    divRow.appendChild(div2)
    getForm.appendChild(divRow)
    iniciarSelect2(el.id)
   }

function iniciarSelect2(idSel){
    //console.log('inside multiple selet', idSel)
    let newid = '#'+idSel
    //$(newid)
    //    .change(function(){
    //        console.log('change color', this.value)
    //        removeLegends()
    //        updateLegends()
    //        update(sesiones[sesionid]);
    //    })
    $(newid).multiselect({
        buttonWidth: '120px',
        includeSelectAllOption: true,
        selectAllText: 'Todas',
        allSelectedText: "Todas",
        onChange : onChangeSelect2
      });
}   

function getIdBtn2(id2){
    console.log("Function onclick", id2)
    let splitid = id2.split(" ")
    //console.log(splitid)
    const btn = document.getElementById(splitid[1]);
    //console.log("delete", btn)
    btn.remove()
    mapDict[splitid[2]].flag = false
    resetOpacity()
    update(sesiones[sesionid]);
  
}*/

function onChangeSelect2(element, checked){
    //console.log('id select: ', element[0].parentElement.id)
    //console.log('Current value:', element.val())
    let stringid = '#' + element[0].parentElement.id + ' option:selected'
    let values = $(stringid).map(function(a, item){return item.value;});
    console.log(values)
    removeLegends()
    updateLegends()
    //resetOpacity()
    update(sesiones[sesionid]);
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

generateLinks = (group) => {

    let links = []
    let nodoPadre;
    const size = group.length
    for (let i=0; i<size; i++){
        let nodosG = group[i][1]
        nodoPadre = nodosG[0]
        for (let j=1; j<nodosG.length; j++){
            let enlace = {
                "source" : nodoPadre,
                "target" : nodosG[j],
                //"id": counter
            }
            links.push(enlace)
        }
    }
    return links
}

dataGroup = (newnodes, groupMap) => {
    let group;
    if (groupMap == 'region')
        group = Array.from(d3.group(newnodes, d=> d.region))
    else if (groupMap == 'partido')
        group = Array.from(d3.group(newnodes, d=> d.partido))
    else if (groupMap == 'provincia')
        group = Array.from(d3.group(newnodes, d=> d.provincia))

    return group;
}


function nodosPrincipales(factor, map){
    
    let pres = w2/2 -25
    let ids = [153, 237, 106, 209, 55, 53, 158]
    const cy = [50, 50, 50, 120, 120, 120, 120]
    const cx = [pres, pres -40, pres+40, pres+40, pres+75, pres-65, pres-30]
    const r = [factor -2, factor -2, factor -2, factor -7, factor -7, factor -7, factor -7]

    let nodos = []
    for (let n=0; n<ids.length; n++){
        let data = asambleistas[ids[n]]
        data.cx = cx[n]
        data.cy = cy[n]
        data.r = r[n]
        nodos.push(data)
    }
    console.log('final: ', nodos)

    return nodos
}

function getNodosEdit (newnodes, curulesPorFila, cx, cy, tcx, tcy, xyfactor){
    
    let group = Array.from(d3.group(newnodes, d=> d.partido))
    console.log('Data group', group)
    let test = []
    group.map( grupo => {
        test = [ ... test, ... grupo[1]]
    })
    console.log('grops', test)
    var contadorGeneral = 0;
    for (var i = 0; i < curulesPorFila.length; i++) {
        var radio = 150 + (27*xyfactor/20) * i;
        var bloques = curulesPorFila[i];
        var deltaAngulo = (25*xyfactor/20) / radio;
        var angulo = Math.PI / 4 - ((10*xyfactor/20) * Math.PI / 180) - bloques[0] * deltaAngulo;
        for (var k = 0; k < bloques[0] && contadorGeneral < test.length; k++) {
            var px = cx + radio * -1 * Math.cos(angulo);
            var py = cy + radio * Math.sin(angulo);
            //console.log('counter:', contadorGeneral)
            test[contadorGeneral].cx = px
            test[contadorGeneral].cy = py
            test[contadorGeneral].r = xyfactor -9
            angulo += deltaAngulo;
            contadorGeneral++;
        }

        angulo += deltaAngulo;
        for (k = 0; k < bloques[1] && contadorGeneral < test.length; k++) {
            px = cx + radio * -1 * Math.cos(angulo);
            py = cy + radio * Math.sin(angulo);
            
            test[contadorGeneral].cx = px
            test[contadorGeneral].cy = py
            test[contadorGeneral].r = xyfactor -9

            angulo += deltaAngulo;
            contadorGeneral++;
        }
    }

    // Segundo grupo de dos bloques.
    var deltaMax3 = 25 / (150 + (27*xyfactor/20) * (curulesPorFila.length - 1));
    var anguloMax = angulo + deltaMax3 * (curulesPorFila[curulesPorFila.length - 1][1] + 1);

    for (i = 0; i < curulesPorFila.length; i++) {

        var radio = 150 + (27*xyfactor/20) * i;
        var bloques = curulesPorFila[i];
        var deltaAngulo = (25*xyfactor/20) / radio;
        var angulo = anguloMax - deltaAngulo * bloques[1];

        for (k = 0; k < bloques[1] && contadorGeneral < test.length; k++) {
            var px = cx - tcx + radio * -1 * Math.cos(angulo);
            var py = cy - tcy + radio * Math.sin(angulo);
            
            test[contadorGeneral].cx = px
            test[contadorGeneral].cy = py
            test[contadorGeneral].r = xyfactor -9
            
            angulo += deltaAngulo;
            contadorGeneral++;
        }

        angulo += deltaAngulo;
        for (k = 0; k < bloques[0] && contadorGeneral < test.length; k++) {
            var px = cx - tcx + radio * -1 * Math.cos(angulo);
            var py = cy - tcy + radio * Math.sin(angulo);

            test[contadorGeneral].cx = px
            test[contadorGeneral].cy = py
            test[contadorGeneral].r = xyfactor -9

            angulo += deltaAngulo;
            contadorGeneral++;
        }
    }
    return test
}


/*
organizeData = (data, option) => {
  
    let bucket;
    let setData = resultData(option)

    data.map( value => {
        bucket = bucketOption(option, value)
        setData.children[bucket].children.push({
            activo : value.activo,
            id: value.id,
            nombre: value.nombre,
            numeroId : value.numeroId,
            opacidad : value.opacidad,
            partido : value.partido,
            provincia : value.provincia,
            region : value.region,
            sesiones : value.sesiones,
            suplente : value.suplente,
            tipo : value.tipo,
            visitado : value.visitado,
            voto : value.voto,
        }) 
    })
    return setData;
}

resultData = (option) => {
    let setByOption = {name: '', children: []};
    if(option == "partido"){
        console.log("opocion PARTIDOS")
        let partidosSet = Object.keys(partidos)
        setByOption.name = 'partidos'
        partidosSet.map( value => { setByOption.children.push({name: value, children: []})})
    }
    else if (option == "region") {
     let regionSet = Object.keys(regiones)
     setByOption.name = 'regiones'
     regionSet.map( value => { setByOption.children.push({name: value, children: []})})
    }
    else if ( option == "provincia") {
        let provSet = Object.keys(provincias)
        setByOption.name = 'provincias'
        provSet.map( value => { setByOption.children.push({name: value, children: []})})   
    }
    console.log(setByOption)
    return setByOption
}

bucketOption = (option, value) => {
    let bucket;
    if(option == "partido"){
        value = value.partido
        bucket = (value === "" || value === null) ? 0 : value == "alianza pais" ? 1 : value == "creo" ? 2 : value == "independiente" ? 3 : value == "izquierda democrática" ? 4 :
            value == "movimientos provinciales" ? 5 : value == "otro movimiento" ? 6 : value == "pachakutik" ? 7 : value == "partido social cristiano" ? 8 : 
            value == "sociedad patriótica" ? 9 : value == "suma" ? 10 : 0; 
    }
    else if (option == "region") {
        value = value.region
        bucket = value == "costa" ? 0 : value == "sierra" ? 1 : value == "oriente" ? 2 : value == "insular" ? 3 : 4;
    }
    else if ( option == "provincia") {
        value = value.provincia
        bucket = value == "esmeraldas" ? 0 : value == "manabí" ? 1 : value == "guayas" ? 2 : value == "santa elena" ? 3 : value == "los ríos" ? 4 : value == "el oro" ? 5 :
            value == "santo domingo de los tsáchilas" ? 6 : value == "carchi" ? 7 : value == "imbabura" ? 8 : value == "pichincha" ? 9 : value == "cotopaxi" ? 10 : 
            value == "tungurahua" ? 11 : value == "chimborazo" ? 12 : value == "bolívar" ? 13 : value == "cañar" ? 14 : value == "azuay" ? 15 : value == "loja" ? 16 :
            value == "sucumbíos" ? 17 : value == "napo" ? 18 : value == "orellana" ? 19 :  value == "pastaza" ? 20 :  value == "morona santiago" ? 21 : 
            value == "zamora chinchipe" ? 22 : value == "galápagos" ? 23  : 24;
    }
    return bucket
}

*/
/*
    //g.selectAll("text").remove()
    //let labels = g.selectAll("g")
    
    //labels = labels
    //    .data(data, d=> d)
    //    .enter()
    //    //.append("g")
    //    //.attr("transform", d => { 
    //    //    console.log(d)
    //    //    //return `translate(${(d.x)-30},${(d.y + d.r)-70})`
    //    //    return `translate(${(d.x)},${(d.y)})`
    //    //})
    //    .append("text")
    //        .attr("x", d=> (d.x))
    //        .attr("y", d=> d.y)
    //        .text(d => codeVotes[d.voto])
    //        .attr("font-size", 15)
    //        .attr("font-family", "sans-serif")
    //        .attr("text-anchor", "middle")
    //        .attr("font-size", "1rem")
    //        //.style("position", "relative")
    //        //style="position: relative;"
    //        //.attr("text-align", "right")
    //        //text-align: right;*/ 