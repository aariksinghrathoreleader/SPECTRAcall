document.addEventListener('DOMContentLoaded', () => {
    function handleSplashScreen() {
        setTimeout(() => {
            document.getElementById('splash-screen').style.display = 'none';
            document.getElementById('app').style.display = 'flex';
            document.getElementById('app').style.opacity = '1';
            initHologram();
            initTiles();
        }, 4000); // Duration of the splash screen
    }

    handleSplashScreen();

    // Dropdown functionality
    const dropdownContent = document.querySelector('.dropdown-content');
    document.querySelector('.menu-button').addEventListener('click', (event) => {
        event.preventDefault();
        dropdownContent.style.display = dropdownContent.style.display === 'none' || dropdownContent.style.display === '' ? 'block' : 'none';
    });

    // Close dropdown when clicking outside of it
    window.addEventListener('click', (event) => {
        if (!event.target.matches('.menu-button') && !event.target.closest('.dropdown-content')) {
            dropdownContent.style.display = 'none';
        }
    });

    document.getElementById('saved-files').addEventListener('click', (event) => {
        event.preventDefault();
        document.getElementById('saved-history-modal').style.display = 'block';
    });

    // Close modal functionality
    document.querySelectorAll('.close-button').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        const savedHistoryModal = document.getElementById('saved-history-modal');
        if (event.target === savedHistoryModal) {
            savedHistoryModal.style.display = 'none';
        }
    });

    // Function to show quote details in full screen
    function showQuoteDetails(quoteDetails) {
        const allDetails = document.querySelectorAll('.quote-details');
        const allQuotes = document.querySelectorAll('.quote');

        // Hide all other details and quotes
        allDetails.forEach(detail => {
            detail.style.display = 'none';
        });
        allQuotes.forEach(quote => {
            quote.style.display = 'none';
        });

        // Show the selected detail
        quoteDetails.style.display = 'block';
        quoteDetails.classList.add('active'); // Add active class for animation

        // Request full screen
        if (quoteDetails.requestFullscreen) {
            quoteDetails.requestFullscreen();
        } else if (quoteDetails.mozRequestFullScreen) { // Firefox
            quoteDetails.mozRequestFullScreen();
        } else if (quoteDetails.webkitRequestFullscreen) { // Chrome, Safari and Opera
            quoteDetails.webkitRequestFullscreen();
        } else if (quoteDetails.msRequestFullscreen) { // IE/Edge
            quoteDetails.msRequestFullscreen();
        }
    }

    // Add click event to the quotes
    document.querySelectorAll('.quote').forEach(quote => {
        quote.addEventListener('click', () => {
            const detailsId = quote.dataset.details;
            const details = document.getElementById(detailsId);
            showQuoteDetails(details);
            details.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Close quote details functionality
    document.querySelectorAll('.close-quote-details').forEach(button => {
        button.addEventListener('click', () => {
            const details = button.closest('.quote-details');
            details.style.display = 'none'; // Hide the quote details
            details.classList.remove('active'); // Remove active class
            const allQuotes = document.querySelectorAll('.quote');
            allQuotes.forEach(quote => {
                quote.style.display = 'block'; // Show all quotes again
            });
            // Exit full screen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        });
    });
});

// Ensure Three.js Hologram and Tiles are initialized properly
let scene, camera, renderer, mainMesh;

function initHologram() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, 400);
    document.getElementById('hologram-container').appendChild(renderer.domElement);

    animateHologram();
}

function loadHologram(modelUrl) {
    const loader = new THREE.PLYLoader();
    loader.load(modelUrl, (geometry) => {
        const material = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });
        mainMesh = new THREE.Mesh(geometry, material);
        scene.add(mainMesh);
    }, undefined, (error) => {
        console.error('An error occurred while loading the model:', error);
    });
}

function animateHologram() {
    requestAnimationFrame(animateHologram);
    if (mainMesh) {
        mainMesh.rotation.x += 0.01;
        mainMesh.rotation.y += 0.01;
    }
    renderer.render(scene, camera);
}

// Tiles Initialization
let tileScene, tileCamera, tileRenderer;
let tiles = [];

function initTiles() {
    tileScene = new THREE.Scene();
    tileCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    tileCamera.position.z = 10;

    tileRenderer = new THREE.WebGLRenderer({ alpha: true });
    tileRenderer.setSize(window.innerWidth, 150);
    document.getElementById('tile-container').appendChild(tileRenderer.domElement);

    const geometry = new THREE.BoxGeometry(2, 2, 2);
    for (let i = 0; i < 5; i++) {
        const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff, wireframe: true });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.x = i * 4 - 8; // Position cubes in a row
        tileScene.add(cube);
        tiles.push(cube);
    }

    animateTiles();
}

function animateTiles() {
    requestAnimationFrame(animateTiles);
    tiles.forEach((tile, index) => {
        tile.rotation.x += 0.01 + index * 0.002; // Different rotation speeds
        tile.rotation.y += 0.01 + index * 0.002;
        tile.position.y = Math.sin(Date.now() * 0.001 + index) * 1.5; // Bounce effect
    });
    tileRenderer.render(tileScene, tileCamera);
}
