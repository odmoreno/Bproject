
/*
*    main.2js
*    Ejemplo de autocompletar con Jquery
*/

const searchBar = document.getElementById('search');
const matchList = document.getElementById('match-list');

let pers = []
let sesiones = []

const searchPers = async searchText => {
  const res = await fetch('data/nodos.json')
  pers = await res.json()
  const asamb = Object.values(pers)
  //console.log(pers)

  let matches = asamb.filter(per => {
    const regex =  new RegExp(`^${searchText}`, 'gi')
    return per.id.match(regex) || per.nombre.match(regex)
    //const regex =  new RegExp(`\\b.*${searchText}.*?\\b`, 'gi')
    //return per.id.match(regex) || per.partido.match(regex)
  }); 

  if (searchText.length === 0 ){
    matches = []
    matchList.innerHTML = '';
  }

  console.log(matches)
  outputHtml(matches)
}

const searchSesiones = async searchText => {
  const res = await fetch('data/data.json')
  sesiones = await res.json()
  const ses = Object.values(sesiones)
  //console.log(pers)

  let matches = ses.filter(sess => {
    const regex =  new RegExp(`^${searchText}`, 'gi')
    //const regNumber = new RegExp('^\\d+$');
    const regex2 =  new RegExp(`\\b.*${searchText}.*?\\b`, 'gi')
    let sesionN = sess.sesion.toString();
    //return sesionN.match(regNumber)
    return sesionN.match(regex) || sess.asunto.match(regex2)
  }); 

  if (searchText.length === 0 ){
    matches = []
    matchList.innerHTML = '';
  }

  console.log(matches)
  outputSesiones(matches)
}

const outputSesiones = matches => {
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

const outputHtml = matches => {
  if (matches.length > 0){
    const html = matches.map(match => `
      <a href="#"  id=${match.numeroId}
      class="list-group-item list-group-item-action mb-1" data-toggle="list" role="tab" onclick="getId(this.id)">
        <h4>${match.nombre} 
          <span class="text-primary">${match.partido}</span>
        </h4>
        <small>${match.provincia} - ${match.region}</small>
        </a>
    `).join('');

    console.log(html)
    matchList.innerHTML = html 
  }

}

const getId = id => {
  //let id = obj.getAttribute("href")
  
  let sesion = sesiones[id]
  console.log("id", id)
  console.log("sesion: ", sesion)
  searchBar.value = sesion.name
  matchList.innerHTML = '';
}


searchBar.addEventListener('input', () => searchSesiones(searchBar.value))

