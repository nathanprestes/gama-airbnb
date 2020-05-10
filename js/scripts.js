let map;

//Elementos
const app = document.getElementById('residence');
const container = document.createElement('div');
const country = document.getElementById("country");
const loadMore = document.createElement('a');

//____Funções____
function init() {
  container.setAttribute('class', 'container')
  loadMore.setAttribute('id', 'loadMore')
  loadMore.setAttribute('data-index', 10)
  loadMore.textContent = 'Carregar Mais'

  app.appendChild(container)
  app.appendChild(loadMore)
}

//Inicia mapa api google
function initMap(latitude, longitude) {
  latitude = (typeof latitude !== 'undefined') ? latitude : 55.70074897777983;
  longitude = (typeof longitude !== 'undefined') ? longitude : 12.500224174892924;

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: latitude, lng: longitude},
    zoom: 5
  });
}

function loadResidence(dataIndex, country, guests, diffDays, destroy) {
  if(destroy == true){
    container.innerHTML="";
  }

  let latitude
  let longitude
  if(country == "United States"){
    latitude = 34.88593094;
    longitude = -81.5625;
  }else if(country == "Spain"){
    latitude = 39.3262345;
    longitude = -4.8380649;
  }else if(country == "Italy"){
    latitude = 42.6384261;
    longitude = 12.674297;
  }else{
    latitude = 55.70074897777983;
    longitude = 12.500224174892924;
  }

  initMap(latitude,longitude)

  // Atribui um novo objeto XMLHttpRequest pra variável.
  country = (country === "") ? "" : "&refine.country="+country;
  guests = (typeof guests !== 'undefined') ? guests : 1;
  var request = new XMLHttpRequest();
  
  // Abre uma nova conexão usando GET
  //api modelo: https://public.opendatasoft.com/explore/dataset/airbnb-listings/api/?disjunctive.host_verifications&disjunctive.amenities&disjunctive.features&rows=10&sort=last_scraped&q=accommodates%3D4&refine.country=Italy
  request.open(
    "GET",
    // "https://api.sheety.co/30b6e400-9023-4a15-8e6c-16aa4e3b1e72",
    // "https://public.opendatasoft.com/api/records/1.0/search/?dataset=airbnb-listings&q=&rows=10&start=0&sort=last_scraped&facet=host_response_time&facet=host_response_rate&facet=host_verifications&facet=city&facet=country&facet=property_type&facet=room_type&facet=bed_type&facet=amenities&facet=availability_365&facet=cancellation_policy&facet=features",
    `https://public.opendatasoft.com/api/records/1.0/search/?dataset=airbnb-listings&q=&rows=10&start=${dataIndex}&sort=last_scraped${country}`,
    true
  );
  
  request.onload = function () {
    // Tratar o objeto JSON
    var data = JSON.parse(this.response);
    // console.log(data);
  
    if (request.status >= 200 && request.status < 400) {
      data.records.forEach((residence) => {
        // console.log(residence.fields);
        const item = residence.fields
  
        if (typeof item.price !== 'undefined' ) {
          const card = document.createElement('section')
          card.setAttribute('class', 'card')
    
          const h3 = document.createElement('h3')
          h3.textContent = item.name

          const wrap_info = document.createElement('div')
          wrap_info.className = 'wrap_info'
    
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
  
          const totalDays = diffDays*guests;
          const preco = document.createElement('span')
          preco.textContent = (item.price*totalDays).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
          // console.log("preco.textContent")
          // console.log(diffDays)
          // console.log(guests)
          // console.log(item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))
          // console.log(preco.textContent)
          // console.log("/preco.textContent")
  
          var latLng = new google.maps.LatLng(item.latitude, item.longitude);
          var marker = new google.maps.Marker({
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
          card.appendChild(wrap_info)
          wrap_info.appendChild(property_type)
          wrap_info.appendChild(precoDiv)
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

function loadMoreBtn(){
  document.getElementById('loadMore').addEventListener('click', function (e){
    const dataIndex = this.getAttribute('data-index')
    loadResidence(dataIndex, country.value, 1, 1, false)
    loadMore.setAttribute('data-index', parseInt(dataIndex, 10) + 10)
  })
}

function submitFilter(){
  const dataAtual = new Date().toISOString().substr(0, 10);
  const oneDay = 24 * 60 * 60 * 1000;
  const checkin = document.getElementById('checkin');
  const checkout = document.getElementById('checkout');
  
  checkin.value = dataAtual
  checkin.setAttribute('min', dataAtual)
  checkout.setAttribute('min', dataAtual)

  const guests = document.getElementById('guests')

  const searchBtn = document.getElementById('search');
  searchBtn.addEventListener('click', function(e){
    e.preventDefault();
    
    const dayCompare = compareDates();
    const dateCheckin = new Date(checkin.value);
    const dateCheckout = new Date(checkout.value);
    const diffDays = Math.round(Math.abs((dateCheckin.getTime() - dateCheckout.getTime()) / (oneDay)));

    if(dayCompare){
      if(diffDays >= 1){
        if(guests.value >= 1){
          loadResidence(0, country.value, guests.value, diffDays, true);
        }else{
          swal('Selecione pelo menos 1 hóspede');
        }
      }else{
        swal('Selecione uma data maior que a do check-in');
      }
    }else{
      swal('Selecione uma data maior que a do check-in');
    }
  });
}

function compareDates() {
  //Get the text in the elements
  const from = document.getElementById('checkin').value;
  const to = document.getElementById('checkout').value;

  //Generate an array where the first element is the year, second is month and third is day
  const splitFrom = from.split('/');
  const splitTo = to.split('/');

  //Create a date object from the arrays
  const fromDate = Date.parse(splitFrom[0], splitFrom[1] - 1, splitFrom[2]);
  const toDate = Date.parse(splitTo[0], splitTo[1] - 1, splitTo[2]);

  //Return the result of the comparison
  return fromDate < toDate;
}

window.addEventListener('load', function(){
  init();

  submitFilter();
  
  loadResidence(0, country.value, 1, 1, true);

  loadMoreBtn();
});