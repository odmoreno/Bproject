/*
*    main.js
*    Ejemplo de autocompletar con Jquery
*/

let source = [
    {"id": 1, "name": "red"},
    {"id": 2, "name": "green"},
    {"id": 3, "name": "white"},
    {"id": 4, "name": "blue"},
]

let dict = {
    0 : "ana paola",
    1 : "carla maria",
    2 : "Mana paola",
    3 : "Mariana paola",
    4 : "Suzana paola",
    5 : "Shikana paola",
}

let dict2 = {
    "36": {"id": "collaguazo pilco rodrigo", "data": ["sesion 240", "sesion 241","sesion 242"]},
    "50": {"id": "diaz velasco laura yesenia" , "data": ["sesion 340", "sesion 341","sesion 342"] },
    "51": {"id": "diaz velez maria daniela" , "data": ["sesion 440", "sesion 441","sesion 442"] },
}

let invDict = {}

for (let key in dict2) {
    data = dict2[key]
    invDict[data.id] = key
}

let dictarry = Object.keys(invDict)

console.log(dict2)
console.log(invDict)
console.log(dictarry)

$( "#search" ).autocomplete({
    source: dictarry,
    autoFocus: true,
    delay: 200,
    autocomplete: true,
    select : handleSelect
});
  
function handleSelect(event, ui) {
    console.log("event", event)
    console.log("ui :", ui)
    console.log("value :", ui.item.value)
    let pers = ui.item.value
    let id = invDict[pers]
    console.log("id: ", id)
    let nodoSes = dict2[id]
    console.log("final: ", nodoSes)
    updateElements2(nodoSes.data)
}


var $dropdown = $("#list").empty().hide();

$('#search').blur(function(){   
    if( !$(this).val() ) {
        console.log("hello")
    }
});

function updateElements(list){
    var $dropdown = $("list").empty();

    $.each(list, function() {
        //console.log("this", this)
        $dropdown.append($('<a class="list-group-item list-group-item-action" data-toggle="list" role="tab" />').val(this).text(this));
    });
}

function updateElements2(list){
    var $dropdown = $("#list").empty();
    $dropdown.show();
    let flag = true;
    $.each(list, function() {
        console.log("this", this)
        if (flag) {
            $dropdown.append($("<option selected/>").val(this).text(this))
            flag = false
        }
        else {
            $dropdown.append($("<option />").val(this).text(this))
        }
    });
}