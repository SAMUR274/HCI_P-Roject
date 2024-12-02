// Initialize map and variables
let map;
let markers = [];
let heatmapLayer;
const storeWidth = 400;  // Store dimensions in pixels
const storeHeight = 300;

// Simulated crowd density data (in a real app, this would come from sensors/backend)
const crowdData = [
    [145, 350, 0.8],  // [x, y, intensity]
    [180, 350, 0.5],
    [215, 350, 0.3],
    [250, 350, 0.6],
    // Add more points as needed
];

function initializeMap() {
    // Create map centered on store
    map = L.map('storeMap', {
        crs: L.CRS.Simple,
        minZoom: -2
    });

    // Set map bounds based on store dimensions
    const bounds = [[0, 0], [storeHeight, storeWidth]];
    const image = L.imageOverlay('store-layout.png', bounds).addTo(map);
    map.fitBounds(bounds);

    // Initialize heatmap
    initializeHeatmap();
    
    // Load and display selected items
    displaySelectedItems();
}

function initializeHeatmap() {
    // Convert crowd data to heatmap format
    const heatData = crowdData.map(point => {
        return [point[0], point[1], point[2] * 1000]; // Scale intensity for better visualization
    });

    const randomizedCrowdData = crowdData.map((point, index) => {
        // Randomly adjust intensity
        const randomIntensity = Math.random();  // Generate random value between 0 and 1
        const checkoutName = `Checkout ${index + 1}`; // Assign checkout names dynamically
        const intensity = randomIntensity * 1000;  // Scale intensity for better visualization
        const density = randomIntensity.toFixed(1); // Convert to percentage for crowd density
        
        // Add the data to the table
        addRowToTable(checkoutName, density, randomIntensity.toFixed(2));
        
        return [point[0], point[1], intensity];  // Return the modified crowd data
    });

    // Create and add heatmap layer
    heatmapLayer = L.heatLayer(randomizedCrowdData, {
        radius: 30,
        blur: 20,
        maxZoom: 1,
        gradient: {
            0.2: '#2ecc71',  // Low density - green
            0.5: '#f1c40f',  // Medium density - yellow
            0.8: '#e74c3c'   // High density - red
        }
    }).addTo(map);
}

function displaySelectedItems() {
    // Get selected items from localStorage
    let selectedItems = JSON.parse(localStorage.getItem('selectedItems') || '[]');
    const itemsList = document.getElementById('selectedItems');

    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    selectedItems = selectedItems.filter(item => !item.checked); // Remove checked items

    // Update the localStorage to remove checked items
    localStorage.setItem('selectedItems', JSON.stringify(selectedItems));

    // Add items to the list and map
    itemsList.innerHTML = selectedItems.map((item, index) => {
        // Create marker for item
        const marker = L.marker(item.location)
            .addTo(map)
            .bindPopup(item.name);
        markers.push(marker);

        // Return list item HTML
        return `
            <li class="item-entry">
                <input type="checkbox" id="item-check-${index}" class="item-check" ${item.checked ? 'checked' : ''} onclick="toggleCheck(${index})" />
                <span>${item.name}</span>
                <button class="locate-btn" onclick="locateItem(${index})">
                    Locate
                </button>
            </li>
        `;
    }).join('');
}

function locateItem(index) {
    const marker = markers[index];
    if (marker) {
        // Pan to marker location
        map.setView(marker.getLatLng(), 0);
        // Open popup
        marker.openPopup();
        // Highlight marker temporarily
        marker._icon.classList.add('highlight');
        setTimeout(() => {
            marker._icon.classList.remove('highlight');
        }, 2000);
    }
}

// Add hover effect to show crowd density
function onMapHover(e) {
    const point = e.latlng;
    // Find nearest crowd density point and show tooltip
    const nearest = findNearestCrowdPoint(point);
    if (nearest) {
        L.popup()
            .setLatLng(point)
            .setContent(`Crowd Density: ${Math.round(nearest[2] * 100)}%`)
            .openOn(map);
    }
}

function findNearestCrowdPoint(point) {
    // Simple nearest neighbor implementation
    return crowdData.reduce((nearest, current) => {
        const distance = Math.hypot(current[0] - point.lat, current[1] - point.lng);
        return distance < nearest.distance ? { point: current, distance } : nearest;
    }, { point: null, distance: Infinity }).point;
}

function addRowToTable(checkoutName, density) {
    const tableBody = document.querySelector('#checkoutTable tbody');
    const row = document.createElement('tr');

    if(density == 1){
        row.innerHTML = `
            <td>${checkoutName}: +20 minutes</td>
        `;
    }else{
        row.innerHTML = `
            <td>${checkoutName}: ${(density * 10) * 2} minutes</td>
            `;
    }
        
    tableBody.appendChild(row);
}

function toggleCheck(index) {
    const selectedItems = JSON.parse(localStorage.getItem('selectedItems') || '[]');
    
    // Toggle the "checked" state of the selected item
    selectedItems[index].checked = true;  // Set item as checked (mark as completed)

    // Remove the item from the map
    removeItemFromMap(index);

    // Update the selected items in localStorage
    localStorage.setItem('selectedItems', JSON.stringify(selectedItems));

    // Re-render the list of selected items to reflect the change
    displaySelectedItems();
}

function removeItemFromMap(index) {
    // Remove the marker from the map
    const marker = markers[index];
    if (marker) {
        map.removeLayer(marker);
    }

    // Optionally remove the marker from the markers array to clean up
    markers.splice(index, 1);
}

// Initialize map when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeMap);
map.on('mousemove', onMapHover); 