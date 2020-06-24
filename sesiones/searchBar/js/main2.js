
const searchBar = document.getElementById('search');
const matchList = document.getElementById('match-list');

let hpCharacters = [];

let dict = {
  "36": {"id": "collaguazo pilco rodrigo", "data": ["sesion 240", "sesion 241","sesion 242"]},
  "50": {"id": "diaz velasco laura yesenia" , "data": ["sesion 340", "sesion 341","sesion 342"] },
}

let invDict = {}

for (let key in dict) {
    data = dict[key]
    invDict[data.id] = key
}

let dictarry = Object.values(dict)

console.log(dictarry)

const searchPers = async searchText => {
  const res = await fetch('data/nodos.json')
  const pers = await res.json()
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

const outputHtml = matches => {
  if (matches.length > 0){
    const html = matches.map(match => `
      <a href="#" 
      class="list-group-item list-group-item-action mb-1" data-toggle="list" role="tab">
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

const out2 = matches => {
  
}

searchBar.addEventListener('input', () => searchPers(searchBar.value))

