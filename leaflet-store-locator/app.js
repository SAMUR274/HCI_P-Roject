const myMap = L.map('map').setView([43.8971, -78.8658], 12);
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const attribution =
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Coded by coder\'s gyan with ❤️';
const tileLayer = L.tileLayer(tileUrl, { attribution });
tileLayer.addTo(myMap);

const crowdDensityLevels = {
    "Smart Shop 1": 3, // Low
    "Smart Shop 2": 5, // Medium
    "Smart Shop 3": 7, // High
    // Add more stores here
};
function updateCrowdMeter(storeName) {
    const bars = document.querySelectorAll('.meter .bar');
    const crowdLevel = crowdDensityLevels[storeName] || 0;

    bars.forEach((bar, index) => {
        if (index < crowdLevel) {
            bar.classList.add('active');
        } else {
            bar.classList.remove('active');
        }
    });
}
function onStoreClick(storeName) {
    updateCrowdMeter(storeName);
    console.log(`Crowd meter updated for ${storeName}`);
}

function generateList() {
  const ul = document.querySelector('.list');
  storeList.forEach((shop) => {
    const li = document.createElement('li');
    const div = document.createElement('div');
    const a = document.createElement('a');
    const p = document.createElement('p');
    a.addEventListener('click', () => {
        flyToStore(shop);
    });
    div.classList.add('shop-item');
    a.innerText = shop.properties.name;
    a.href = '#';
    p.innerText = shop.properties.address;

    div.appendChild(a);
    div.appendChild(p);
    li.appendChild(div);
    ul.appendChild(li);
  });
}

generateList();

function makePopupContent(shop) {
  return `
    <div>
        <h4>${shop.properties.name}</h4>
        <p>${shop.properties.address}</p>
        <div class="phone-number">
            <a href="tel:${shop.properties.phone}">${shop.properties.phone}</a>
        </div>
    </div>
  `;
}
function onEachFeature(feature, layer) {
    layer.bindPopup(makePopupContent(feature), { closeButton: false, offset: L.point(0, -8) });
}

var myIcon = L.icon({
    iconUrl: 'marker.png',
    iconSize: [30, 40]
});

const shopsLayer = L.geoJSON(storeList, {
    onEachFeature: onEachFeature,
    pointToLayer: function(feature, latlng) {
        return L.marker(latlng, { icon: myIcon });
    }
});
shopsLayer.addTo(myMap);

function flyToStore(store) {
    const lat = store.geometry.coordinates[1];
    const lng = store.geometry.coordinates[0];
    myMap.flyTo([lat, lng], 14, {
        duration: 3
    });
    setTimeout(() => {
        L.popup({closeButton: false, offset: L.point(0, -8)})
        .setLatLng([lat, lng])
        .setContent(makePopupContent(store))
        .openOn(myMap);
    }, 3000);
}



