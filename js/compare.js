let map;

// Cria Elementos
const app = document.getElementById('residence')
const container = document.createElement('div')
const city = document.getElementById("city").value;

// Cria botão de carregar mais TODO: implementar paginação com números
const loadMore = document.createElement('a')

init();

// Funções
function init() {
  container.setAttribute('class', 'container')
  loadMore.setAttribute('id', 'loadMore')
  loadMore.setAttribute('data-index', 10)
  loadMore.textContent = 'Carregar Mais'

  app.appendChild(container)
  app.appendChild(loadMore)
}

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 41.38189293967732, lng: 2.172397386530445},
    zoom: 5
  });
}

function loadResidence(dataIndex, city, guests) {
  // Atribui um novo objeto XMLHttpRequest pra variável.
  guests = (typeof guests !== 'undefined') ? guests : 1;
  let request = new XMLHttpRequest();
  
  // Abre uma nova conexão usando GET
  request.open(
    "GET",
    `https://public.opendatasoft.com/api/records/1.0/search/?dataset=airbnb-listings&q=accommodates=${guests}&rows=10&start=${dataIndex}&sort=last_scraped&facet=host_response_time&facet=host_response_rate&facet=host_verifications&facet=city&facet=country&facet=property_type&facet=room_type&facet=bed_type&facet=amenities&facet=availability_365&facet=cancellation_policy&facet=features&refine.city=${city}`,
    true
  );
  
  request.onload = function () {
    // Tratar o objeto JSON
    let data = JSON.parse(this.response);
    console.log(data);
  
    if (request.status >= 200 && request.status < 400) {
      data.records.forEach((residence) => {
        // console.log(residence.fields);
        const item = residence.fields
  
        if (typeof item.price !== 'undefined' ) {
          const card = document.createElement('section')
          card.setAttribute('class', 'card')
    
          const h3 = document.createElement('h3')
          h3.textContent = item.name
    
          const property_type = document.createElement('p')
          property_type.textContent = `Tipo: ${item.property_type}`
    
          const imgResidence = document.createElement('div')
          imgResidence.setAttribute('class', 'img-residence')
  
          const img = document.createElement('img')
          if (typeof item.medium_url !== 'undefined') {
            img.setAttribute('src', item.medium_url)
          } else {
            img.setAttribute('src', 'https://ichef.bbci.co.uk/news/1024/cpsprodpb/3E5D/production/_109556951_airbnb.png')
          }
  
          const precoDiv = document.createElement('div')
          precoDiv.setAttribute('class', 'preco')
  
          const preco = document.createElement('span')
          preco.textContent = item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  
          let latLng = new google.maps.LatLng(item.latitude, item.longitude);
          let marker = new google.maps.Marker({
            position: latLng,
            map: map,
            label: item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            animation: google.maps.Animation.DROP,
            title: item.name
          });
  
          container.appendChild(card)
          card.appendChild(h3)
          card.appendChild(imgResidence)
          imgResidence.appendChild(img)
          card.appendChild(property_type)
          card.appendChild(precoDiv)
          precoDiv.appendChild(preco)
        }
  
      });
    } else {
      const errorMessage = document.createElement('marquee')
      errorMessage.textContent = `Deu ruim!`
      app.appendChild(errorMessage)
    }
  };
  
  // Envia o request
  request.send();
}

// Eventos
window.addEventListener('load', loadResidence(0, city, 1))

document.getElementById('loadMore').addEventListener('click', function (e){
  const dataIndex = this.getAttribute('data-index')
  loadResidence(dataIndex, city, 1)
  loadMore.setAttribute('data-index', parseInt(dataIndex, 10) + 10)
})

document.getElementById('form-search').addEventListener('submit', function(e) {
  e.preventDefault();

  const city = document.getElementById("city").value;
  const guests = document.getElementById("guests").value;
  const checkin = document.getElementById("checkin").value;
  const checkout = document.getElementById("checkout").value;

  const oneDay = 24 * 60 * 60 * 1000;
  const dateCheckin = new Date(checkin);
  const dateCheckout = new Date(checkout);

  const diffDays = Math.round(Math.abs((dateCheckin.getTime() - dateCheckout.getTime()) / (oneDay)));

  console.log(diffDays);

  loadResidence(0, city, guests)
});


GET | 302 | 267 ms | GitHub.com
GET | 200 | 420 ms