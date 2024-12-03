const myMap = L.map('map').setView([43.8971, -78.8658], 12);
const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const attribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Coded by coder\'s gyan with ❤️';
const tileLayer = L.tileLayer(tileUrl, { attribution });
tileLayer.addTo(myMap);
const crowdLevelMapping = { "Low": 2, "Medium": 4, "High": 6, "Too High": 7 };

function generateList() {
    const ul = document.querySelector('.list');
    ul.innerHTML = ''; // Clear existing content

    // Clear existing layers from the map
    if (window.shopsLayer) {
        myMap.removeLayer(shopsLayer);
    }

    // Marker and Popup Logic
    const markers = [];
    const crowdLevelMapping = { "Low": 2, "Medium": 4, "High": 6, "Too High": 7 };
    const crowdColors = {
        "Low": "green",
        "Medium": "orange",
        "High": "red",
        "Too High": "darkred",
        "Unknown": "gray",
    };

    storeList.forEach((store) => {
        const crowdLevel = store.properties.crowd || 'Unknown';

        // Create list items
        const li = document.createElement('li');
        const div = document.createElement('div');
        const a = document.createElement('a');
        const p = document.createElement('p');
        const customizeButton = document.createElement('button');

        // Store name and address
        a.innerText = store.properties.name;
        a.href = '#';
        p.innerText = store.properties.address;

        // Add click event to store name
        a.addEventListener('click', () => {
            selectedStoreName = store.properties.name;
            flyToStore(store);
        });

        // Configure button
        customizeButton.innerText = "Start Customizing List";
        customizeButton.classList.add('customize-btn');
        customizeButton.addEventListener('click', () => {
            onStoreClick(store.properties.name); // Launch onStoreClick function
        });

        // Add crowd indicator
        const crowdIndicator = document.createElement('div');
        crowdIndicator.classList.add('crowd-indicator');
        crowdIndicator.innerHTML = `
            <span class="crowd-circle" style="background-color: ${crowdColors[crowdLevel]}"></span>
            <span class="crowd-label">${crowdLevel}</span>
        `;

        // Add crowd meter
        const meter = document.createElement('div');
        meter.classList.add('meter');
        meter.innerHTML = Array.from({ length: 7 }, (_, i) => `
            <div class="bar ${i < crowdLevelMapping[store.properties.crowd] ? 'active' : ''}"></div>
        `).join('');

        // Assemble the list item
        div.classList.add('shop-item');
        div.appendChild(a);
        div.appendChild(p);
        div.appendChild(customizeButton); // Add "Start Customizing List" button
        div.appendChild(crowdIndicator);
        div.appendChild(meter);
        li.appendChild(div);
        ul.appendChild(li);

        // Add markers to the map
        const marker = L.marker([store.geometry.coordinates[1], store.geometry.coordinates[0]], {
            icon: L.icon({
                iconUrl: 'marker.png', // Replace with your marker icon URL
                iconSize: [30, 40],
            }),
        }).addTo(myMap);

        // Bind popup to marker
        marker.bindPopup(`
            <h4>${store.properties.name}</h4>
            <p>${store.properties.address}</p>
            <p><strong>Crowd Level:</strong> ${crowdLevel}</p>
        `);

        markers.push(marker);
    });

    // Show fallback message if no stores are available
    const fallbackMessage = document.getElementById('fallback');
    if (storeList.length === 0) {
        fallbackMessage.style.display = 'block';
    } else {
        fallbackMessage.style.display = 'none';
    }

    // Group markers for better map view
    if (markers.length > 0) {
        const group = L.featureGroup(markers);
        myMap.fitBounds(group.getBounds());
    }

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

function onStoreClick(storeName) {
    console.log(`Crowd meter updated for ${storeName}`);

    // Add a timeout before redirecting to simulate loading
    setTimeout(() => {
        alert(`Heading over to the store website for ${storeName}`);
        // Redirect to the shopping cart page
        window.location.href = '../Shopping-Cart/shopping-cart.html';
    }, 1000); // 1-second delay
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
}



