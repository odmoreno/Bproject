
let itemsPartidos = ['p1', 'p2', 'p3', 'p4', 'p5']
let itemsRegiones = ['costa', 'sierra', 'oriente', 'insular']
let itemsProvincias = ['pv1', 'pv2', 'pv3', 'pv4', 'pv5']

let selectDict ={
  "0": { "id": 'select-partidos', "values": itemsPartidos, "name": "Partidos", "flag": false, "id2": "div-partidos", "idstr": "0"},
  "1": { "id": 'select-regiones', "values": itemsRegiones, "name": "Regiones", "flag": false, "id2": "div-regiones", "idstr": "1"},
  "2": { "id": 'select-provincias', "values": itemsProvincias, "name": "Provincias", "flag": false, "id2": "div-provincias", "idstr": "1"}
}


$('#example-select').multiselect({
  onChange : onChangeSelect
});

let options = []
let currentid;

$('#example-button').click( function () { 
  console.log('on click')
  //  get all option element values
  let values = $('#example-select option:selected').map(function(a, item){return item.value;});
  console.log('valores:' , values)
  console.log('valores 0:' , values[0])
})

$('#btn-add').click(addFilter)

function addFilter () {
  let option = $("#filter-select").val();
  console.log('Filter select: ', option)
  
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
  console.log('form', getForm)
  const divRow = document.createElement("DIV");
  divRow.setAttribute("class", "d-flex flex-row")
  divRow.setAttribute("id", el.id2)
  const div1 = document.createElement("DIV");
  div1.setAttribute("class", "p-2")
  const select = document.createElement("SELECT");
  select.setAttribute("id", el.id);
  select.setAttribute("multiple", "multiple");
  const htmlSelect = el.values.map(option => 
    `
    <option value = ${option}>${option}</option>
    `).
    join('')
  select.innerHTML = htmlSelect
  const div2 = document.createElement("DIV");
  div2.setAttribute("class", "p-2")
  const htmlbtn = `<button type="button" id="btn-remove ${el.id2} ${el.idstr}" class="btn btn-outline-primary" onclick="getId(this.id)">-</button>`;
  div2.innerHTML = htmlbtn
  div1.appendChild(select)
  divRow.appendChild(div1)
  divRow.appendChild(div2)
  getForm.appendChild(divRow)
  iniciarSelect(el.id, el.name)
 }


 function iniciarSelect(idSel, name){
   console.log('inside multiple selet', idSel)
   let newid = '#'+idSel
   currentid = newid
  $(newid).multiselect({
    buttonText: function(options, select) {
      if (options.length === 0) {
        return name;
      }
    },
    buttonWidth: '120px',
    onChange : onChangeSelect
  });
 }

function onChangeSelect(element, checked){
  console.log('id select: ', element[0].parentElement.id)
  console.log('Current value:', element.val())
  let stringid = '#' + element[0].parentElement.id + ' option:selected'
  let values = $(stringid).map(function(a, item){return item.value;});
  console.log('valores:' , values)
  console.log(values.length)
  //if (checked === true) {
  //  //action taken here if true
  //  console.log('item', element.val())
  //  options.push(element.val())
  //  let values = $('#example-select option:selected').map(function(a, item){return item.value;});
  //  console.log('valores:' , values)
  //}
  //else if (checked === false) {
  //    console.log('desconfirmo')
  //}
}

function getId(id2){
  console.log("Function onclick", id2)
  let splitid = id2.split(" ")
  console.log(splitid)
  const btn = document.getElementById(splitid[1]);
  console.log("delete", btn)
  btn.remove()
  selectDict[splitid[2]].flag = false
}
