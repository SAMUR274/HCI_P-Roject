// Initialize map and variables
let map;
let markers = [];
let userMarker;
let pathLine;
let userLocation = [20, 350]; // User starts in the lower-right corner
const exitLocation = [170, 380]; // Exit near checkout area
let remainingDistance = 0;
const storeWidth = 400;
const storeHeight = 300; // Adjusted height to accommodate coordinates

// Obstacles (shelf areas based on the layout image)
// const obstacles = [
//     [[50, 90], [120, 80]],
//     [[50, 50], [120, 35]],
//     [[100, 90], [120, 35]],
//     [[50, 90], [70, 60]],
//     [[155, 50], [220, 35]],
//     [[155, 90], [250, 80]],
//     [[155, 122], [250, 112]],
//     [[155, 160], [250, 150]],
//     [[155, 185], [250, 195]],
//     [[155, 232], [250, 222]],
//     [[50, 120], [115, 135]],
//     [[50, 185], [115, 165]],
//     [[50, 215], [115, 220]],
//     [[45, 215], [115, 220]],
//     [[45, 255], [115, 250]],
// ];
const obstacles = [
    [[50, 80], [120, 90]],
    [[50, 35], [120, 50]],
    [[100, 35], [120, 90]],
    [[50, 60], [70, 90]],
    [[155, 35], [220, 50]],
    [[155, 80], [250, 90]],
    [[155, 112], [250, 122]],
    [[155, 150], [250, 160]],
    [[155, 185], [250, 195]],
    [[155, 222], [250, 232]],
    [[50, 120], [115, 135]],
    [[50, 165], [115, 185]],
    [[50, 215], [115, 220]],
    [[45, 215], [115, 220]],
    [[45, 250], [115, 255]],
];

// Simulated queue data
let queueData = Array(3).fill(0).map(() => Math.floor(Math.random() * 10)); // Reduced to 3 checkouts

// Initialize the map and UI
function initializeMap() {
    map = L.map('storeMap', {
        crs: L.CRS.Simple,
        minZoom: -2
    });

    const bounds = [[0, 0], [storeHeight, storeWidth]];
    L.imageOverlay('store-layout.png', bounds).addTo(map);
    map.fitBounds(bounds);

    // Add user marker
    userMarker = L.marker(userLocation, {
        draggable: true,
        icon: L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/61/61205.png',
            iconSize: [25, 25],
        })
    }).addTo(map).bindPopup('You are here');
    userMarker.on('dragend', () => {
        userLocation = [userMarker.getLatLng().lat, userMarker.getLatLng().lng];
        updatePath();
    });

    // Add exit marker
    L.marker(exitLocation, {
        icon: L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/0/340.png',
            iconSize: [30, 30],
        })
    }).addTo(map).bindPopup('Checkout/Exit');

    const checkoutLocations = [
        { position: [160, 350], label: 'Checkout1' },
        { position: [190, 350], label: 'Checkout2' },
        { position: [220, 350], label: 'Checkout3' },
    ];

    checkoutLocations.forEach((checkout) => {
        L.marker(checkout.position, {
            icon: L.divIcon({
                className: 'checkout-label',
                html: `<span>${checkout.label}</span>`,
                iconSize: [0, 0],
            }),
        }).addTo(map);
    });

    // Add obstacles to the map
    addObstaclesToMap();

    checkItemLocations();

    displayShoppingChecklist();
    displayQueueData();
    updatePath();
}

// Add obstacles as light red polygons on the map
function addObstaclesToMap() {
    obstacles.forEach(obstacle => {
        const [point1, point2] = obstacle;
        const rectangle = L.rectangle([point1, point2], {
            color: 'red',
            weight: 1,
            fillColor: 'lightcoral',
            fillOpacity: 0.5
        }).addTo(map);
    });
}

// Function to determine the optimal visit order using Nearest Neighbor heuristic
function determineOptimalVisitOrder(startPoint, points) {
    const unvisited = points.slice(); // Copy the array of points
    const visitOrder = [startPoint];
    let currentPoint = startPoint;

    while (unvisited.length > 0) {
        // Find the nearest unvisited point
        let nearestPoint = null;
        let minDistance = Infinity;

        for (const point of unvisited) {
            const distance = heuristic({ x: currentPoint[1], y: currentPoint[0] }, { x: point[1], y: point[0] });
            if (distance < minDistance) {
                minDistance = distance;
                nearestPoint = point;
            }
        }

        // Move to the nearest point
        visitOrder.push(nearestPoint);
        currentPoint = nearestPoint;
        // Remove the visited point from the unvisited list
        unvisited.splice(unvisited.indexOf(nearestPoint), 1);
    }

    return visitOrder;
}


// Calculate the shortest path using A* algorithm
function updatePath() {
    const selectedItems = JSON.parse(localStorage.getItem('selectedItems') || '[]');
    const uncheckedItems = selectedItems.filter(item => !item.checked).map(item => item.location);

    // Determine the optimal order to visit the items
    const waypoints = determineOptimalVisitOrder(userLocation, uncheckedItems);

    // Add the exit location as the final destination
    waypoints.push(exitLocation);

    console.log("Optimal waypoints to visit:", waypoints);

    const fullPath = [];

    for (let i = 0; i < waypoints.length - 1; i++) {
        const start = waypoints[i];
        const end = waypoints[i + 1];
        console.log(`Finding path segment: ${i} from`, start, "to", end);
        const segment = findPath(start, end);
        if (segment && segment.length > 0) {
            console.log(`Segment ${i} path found:`, segment);
            fullPath.push(...segment);
        } else {
            console.warn(`No path found for segment ${i}.`);
        }
    }

    remainingDistance = calculateDistance(fullPath);

    if (pathLine) map.removeLayer(pathLine);
    if (fullPath.length > 0) {
        console.log("Rendering full path:", fullPath);
        pathLine = L.polyline(fullPath.map(p => [p[0], p[1]]), { color: 'blue', weight: 4 }).addTo(map);
    } else {
        console.warn("No path to render.");
    }

    const remainingTime = Math.round((remainingDistance / 100) * 2);
    document.getElementById('remainingTime').textContent = `Estimated Time: ${remainingTime} minutes`;
}


// A* pathfinding algorithm to find path between two points avoiding obstacles
function findPath(start, end) {
    const gridSize = 5; // Resolution of the grid
    const cols = Math.ceil(storeWidth / gridSize);
    const rows = Math.ceil(storeHeight / gridSize);

    // Initialize grid
    const grid = [];
    for (let row = 0; row < rows; row++) {
        grid[row] = [];
        for (let col = 0; col < cols; col++) {
            const lat = row * gridSize;
            const lng = col * gridSize;
            const cell = {
                x: lng,
                y: lat,
                f: 0,
                g: 0,
                h: 0,
                parent: null,
                walkable: !isObstacle([lat, lng]),
            };
            grid[row][col] = cell;
        }
    }

    function getCell(point) {
        const row = Math.floor(point[0] / gridSize); // Map latitude to grid row
        const col = Math.floor(point[1] / gridSize); // Map longitude to grid column
        if (grid[row] && grid[row][col]) {
            return grid[row][col];
        }
        return null; // Return null if the point is out of bounds
    }

    const openList = [];
    const closedList = [];
    const startCell = getCell(start);
    const endCell = getCell(end);

    if (!startCell || !endCell) {
        console.warn("Start or end point is outside the grid.");
        return [];
    }
    if (!startCell.walkable || !endCell.walkable) {
        console.warn("Start or end point is not walkable.", { start, end });
        return [];
    }

    openList.push(startCell);

    while (openList.length > 0) {
        const current = openList.reduce((a, b) => (a.f < b.f ? a : b));
        openList.splice(openList.indexOf(current), 1);
        closedList.push(current);

        // Found the goal
        if (current === endCell) {
            const path = [];
            let temp = current;
            while (temp.parent) {
                path.push([temp.y, temp.x]);
                temp = temp.parent;
            }
            path.push([startCell.y, startCell.x]);
            return path.reverse();
        }

        // Get neighbors
        const neighbors = getNeighbors(current, grid, rows, cols, gridSize);

        for (const neighbor of neighbors) {
            if (closedList.includes(neighbor) || !neighbor.walkable) continue;

            const gScore = current.g + gridSize;
            if (!openList.includes(neighbor) || gScore < neighbor.g) {
                neighbor.g = gScore;
                neighbor.h = heuristic(neighbor, endCell);
                neighbor.f = neighbor.g + neighbor.h;
                neighbor.parent = current;

                if (!openList.includes(neighbor)) openList.push(neighbor);
            }
        }
    }

    return []; // No path found
}

function calculateDistance(path) {
    let distance = 0;
    for (let i = 1; i < path.length; i++) {
        const [x1, y1] = path[i - 1];
        const [x2, y2] = path[i];
        distance += Math.hypot(x2 - x1, y2 - y1);
    }
    return distance;
}


// Heuristic function for A* (Euclidean distance)
function heuristic(pos0, pos1) {
    const d1 = pos1.x - pos0.x;
    const d2 = pos1.y - pos0.y;
    return Math.sqrt(d1 * d1 + d2 * d2);
}

// Get neighbors for A* algorithm
function getNeighbors(node, grid, rows, cols, gridSize) {
    const neighbors = [];
    const row = node.y / gridSize;
    const col = node.x / gridSize;

    const moves = [
        [row - 1, col], // Up
        [row + 1, col], // Down
        [row, col - 1], // Left
        [row, col + 1], // Right
    ];

    for (const [nRow, nCol] of moves) {
        if (nRow >= 0 && nRow < rows && nCol >= 0 && nCol < cols) {
            const neighbor = grid[nRow][nCol];
            if (neighbor.walkable && !neighbor.closed) {
                neighbors.push(neighbor);
            }
        }
    }
    return neighbors;
}

// Check if a point is within any obstacle
function isObstacle(point) {
    const buffer = 0; // Adjust buffer if necessary
    const x = point[1]; // longitude
    const y = point[0]; // latitude

    const result = obstacles.some(obstacle => {
        const [pointA, pointB] = obstacle;
        const xMin = Math.min(pointA[1], pointB[1]);
        const xMax = Math.max(pointA[1], pointB[1]);
        const yMin = Math.min(pointA[0], pointB[0]);
        const yMax = Math.max(pointA[0], pointB[0]);

        return (
            x >= xMin - buffer &&
            x <= xMax + buffer &&
            y >= yMin - buffer &&
            y <= yMax + buffer
        );
    });

    return result;
}

// Function to check item locations
function checkItemLocations() {
    const selectedItems = JSON.parse(localStorage.getItem('selectedItems') || '[]');
    selectedItems.forEach(item => {
        if (isObstacle(item.location)) {
            console.warn(`Item "${item.name}" is located inside an obstacle.`);
            // Adjust item location slightly
            item.location[0] += 5; // Move latitude slightly
            item.location[1] += 5; // Move longitude slightly
        }
    });
    localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
}

// Calculate total distance of the path
function calculateDistance(path) {
    let distance = 0;
    for (let i = 1; i < path.length; i++) {
        const [x1, y1] = path[i - 1];
        const [x2, y2] = path[i];
        distance += Math.hypot(x2 - x1, y2 - y1);
    }
    return distance;
}

// Display the shopping checklist (unchanged)
function displayShoppingChecklist() {
    const selectedItems = JSON.parse(localStorage.getItem('selectedItems') || '[]');
    const checklist = document.getElementById('checklist');

    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Populate checklist and map markers
    checklist.innerHTML = selectedItems.map((item, index) => `
        <li>
            <input type="checkbox" id="item-${index}" ${item.checked ? 'checked' : ''} onchange="toggleItem(${index})">
            <img src="https://via.placeholder.com/50" onclick="viewImage('${item.name}')">
            <span ${item.checked ? 'style="text-decoration: line-through;"' : ''}>${item.name}</span>
        </li>
    `).join('');

    selectedItems.forEach((item, index) => {
        if (!item.checked) {
            const marker = L.marker(item.location, {
                icon: L.icon({
                    iconUrl: 'https://via.placeholder.com/30',
                    iconSize: [30, 30],
                })
            }).addTo(map).bindPopup(`
                <div>
                    <strong>${item.name}</strong>
                    <img src="https://via.placeholder.com/100" alt="${item.name}" style="width: 100px; height: auto;">
                </div>
            `);
            markers[index] = marker;
        }
    });

    localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
}

// Toggle item completion (unchanged)
function toggleItem(index) {
    const selectedItems = JSON.parse(localStorage.getItem('selectedItems') || '[]');
    selectedItems[index].checked = !selectedItems[index].checked;

    if (selectedItems[index].checked) {
        map.removeLayer(markers[index]);
    } else {
        const item = selectedItems[index];
        const marker = L.marker(item.location).addTo(map).bindPopup(item.name);
        markers[index] = marker;
    }

    localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
    displayShoppingChecklist();
    updatePath();
}

// Simulate queue data (unchanged)
function displayQueueData() {
    const queueContainer = document.getElementById('queueData');
    setInterval(() => {
        queueData = queueData.map(q => Math.max(0, q + Math.floor(Math.random() * 7 - 3)));
        queueContainer.innerHTML = queueData.map((count, index) => `
            <div>Checkout ${index + 1}: ${count} people</div>
        `).join('');
    }, 60000); // Refresh every minute
}

// View a larger image of the item (unchanged)
function viewImage(name) {
    alert(`Viewing image for: ${name}`);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', initializeMap);
