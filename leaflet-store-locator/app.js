const myMap = L.map('map').setView([43.8971, -78.8658], 12);
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const attribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Coded by coder\'s gyan with ❤️';
const tileLayer = L.tileLayer(tileUrl, { attribution });
tileLayer.addTo(myMap);
let selectedStoreName = null;

const crowdDensityLevels = {};
storeList.forEach(store => {
    const crowdLevelMapping = { "Low": 2, "Medium": 4, "High": 6, "Too High": 7 }; // Map levels to bar count
    crowdDensityLevels[store.properties.name] = crowdLevelMapping[store.properties.crowd] || 0;
});
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

    // Add a timeout before redirecting to simulate loading
    setTimeout(() => {
        alert(`Heading over to the store website for ${storeName}`);
        // Redirect to the shopping cart page at the correct port
        window.location.href = '../Shopping-Cart/shopping-cart.html';
    }, 1000); // 1-second delay
}
const dummyLocation = {
    latitude: 43.8971,
    longitude: -78.8658,
};
function showSuggestions() {
    const suggestionList = document.getElementById('suggestionList');
    suggestionList.innerHTML = ''; // Clear previous suggestions

    storeList.forEach((store) => {
        const li = document.createElement('li');
        li.innerText = store.properties.name;
        li.addEventListener('click', () => {
            onStoreClick(store.properties.name);
        });
        suggestionList.appendChild(li);
    });

    suggestionList.style.display = 'block'; // Show dropdown
}

function filterShops() {
    const input = document.getElementById("searchBox").value.toLowerCase();
    const suggestionList = document.getElementById("suggestionList");
    suggestionList.innerHTML = storeList
        .filter((store) =>
            store.properties.name.toLowerCase().includes(input)
        )
        .map(
            (store) =>
                `<li onclick="selectStore('${store.properties.name}')">${store.properties.name}</li>`
        )
        .join("");
    suggestionList.style.display = input ? "block" : "none"; // Show dropdown only if input exists
}
function selectStore(storeName) {
    const suggestionList = document.getElementById("suggestionList");
    suggestionList.style.display = "none"; // Hide dropdown
    selectedStoreName = storeName;
    alert(`You selected ${selectedStoreName}`);
    // Additional logic for handling store selection can go here
}
function getUserLocation() {
    alert("Getting your location...");

    // Simulating a dummy location (Oshawa, Ontario)
    setTimeout(() => {
        const dummyStore = storeList[0]; // Assume Smart Shop 1 as the nearest
        alert(`We found a store near you: ${dummyStore.properties.name}`);
    }, 1000); // Simulate a delay for getting location
}

function checkIn(){
    if (selectedStoreName) {
        setTimeout(() => {
            alert(`You have successfully checked into ${selectedStoreName}!`);
            window.location.href = '../Shopping-Cart/shopping-cart.html';
        }, 1000); // 1-second delay
    } else {
        alert("Please select a store before checking in.");
    }
}

function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

// function onStoreClick(storeName) {
//     updateCrowdMeter(storeName);
//     console.log(`Crowd meter updated for ${storeName}`);

//     // Add a timeout before redirecting to simulate loading
//     setTimeout(() => {
//         alert(`Heading over to the store website for ${storeName}`);
//         // Redirect to the shopping cart page
//         window.location.href = '../Shopping-Cart-JavaScript/index.html';
//     }, 1000); // 1-second delay
// }

function generateList() {
    const ul = document.querySelector('.list');
    storeList.forEach((shop) => {
        const li = document.createElement('li');
        const div = document.createElement('div');
        const a = document.createElement('a');
        const p = document.createElement('p');
        a.addEventListener('click', () => {
            selectedStoreName = shop.properties.name;
            flyToStore(shop);
            updateCrowdMeter(shop.properties.name); // Update crowd meter on click
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
        <p><strong>Crowd Level:</strong> ${shop.properties.crowd || 'Unknown'}</p>
    </div>
  `;
}
function onEachFeature(feature, layer) {
    layer.bindPopup(makePopupContent(feature), { closeButton: false, offset: L.point(0, -8) });
    layer.on('click', () => {
        selectedStoreName = feature.properties.name;
        flyToStore(feature);
        updateCrowdMeter(selectedStoreName); // Update crowd meter
    });
}

var myIcon = L.icon({
    iconUrl: 'marker.png',
    iconSize: [30, 40]
});

const shopsLayer = L.geoJSON(storeList, {
    onEachFeature: onEachFeature,
    pointToLayer: function (feature, latlng) {
        return L.marker(latlng, { icon: myIcon });
    }
});
shopsLayer.addTo(myMap);

function flyToStore(store) {
    const lat = store.geometry.coordinates[1];
    const lng = store.geometry.coordinates[0];
    myMap.flyTo([lat, lng], 14, {
        duration: 1
    });
    setTimeout(() => {
        L.popup({ closeButton: false, offset: L.point(0, -8) })
            .setLatLng([lat, lng])
            .setContent(makePopupContent(store))
            .openOn(myMap);
    }, 1000);

    // Update the crowd meter
    updateCrowdMeter(store.properties.name);
}



