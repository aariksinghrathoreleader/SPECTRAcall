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

    document.getElementById('upload-button').addEventListener('click', async () => {
        const fileInput = document.getElementById('file-input');
        if (!fileInput.files.length) return alert('Please select an image to upload');

        const formData = new FormData();
        formData.append('image', fileInput.files[0]);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.url) {
                const processResponse = await fetch('/process-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageUrl: data.url })
                });
                const processData = await processResponse.json();
                if (processData.modelUrl) {
                    alert('Image uploaded and 3D hologram generated');
                    loadHologram(processData.modelUrl);
                }
            }
        } catch (error) {
            console.error('Upload Error:', error);
            alert('An error occurred while uploading the image.');
        }
    });

    document.getElementById('create-magic-button').addEventListener('click', async () => {
        try {
            const response = await fetch('/create-magic', { method: 'POST' });
            const data = await response.json();
            alert(data.message);
        } catch (error) {
            console.error('Create Magic Error:', error);
            alert('An error occurred while creating magic.');
        }
    });

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

    document.getElementById('feedback').addEventListener('click', (event) => {
        event.preventDefault();
        document.getElementById('feedback-modal').style.display = 'block';
    });

    // Close feedback modal functionality
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
        const feedbackModal = document.getElementById('feedback-modal');
        const savedHistoryModal = document.getElementById('saved-history-modal');
        if (event.target === feedbackModal) {
            feedbackModal.style.display = 'none';
        }
        if (event.target === savedHistoryModal) {
            savedHistoryModal.style.display = 'none';
        }
    });

    // Write feedback functionality
    document.getElementById('write-feedback-button').addEventListener('click', () => {
        document.getElementById('write-feedback-container').style.display = 'block';
        document.getElementById('read-feedback-container').style.display = 'none';
    });

    // Read feedback functionality
    document.getElementById('read-feedback-button').addEventListener('click', () => {
        document.getElementById('write-feedback-container').style.display = 'none';
        document.getElementById('read-feedback-container').style.display = 'block';
    });

    // Save feedback functionality with typing effect
    document.getElementById('save-feedback-button').addEventListener('click', () => {
        const name = document.getElementById('feedback-name').value;
        const description = document.getElementById('feedback-description').value;

        if (name && description) {
            const feedbackList = document.getElementById('feedback-list');
            const feedbackItem = document.createElement('div');
            feedbackItem.className = 'feedback-item';

            // Start typing effect
            typeFeedback(feedbackItem, `<strong>${name}:</strong> ${description}`);
            feedbackList.appendChild(feedbackItem);

            // Clear the input fields
            document.getElementById('feedback-name').value = '';
            document.getElementById('feedback-description').value = '';
        } else {
            alert('Please fill in both fields.');
        }
    });

    // Function to simulate typing effect
    function typeFeedback(element, text, index = 0) {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
            setTimeout(() => typeFeedback(element, text, index), 100); // Adjust typing speed here
        }
    }

    // Function to toggle quote details
    function toggleQuoteDetails(quoteDetails) {
        const allDetails = document.querySelectorAll('.quote-details');
        allDetails.forEach(detail => {
            if (detail !== quoteDetails) {
                detail.style.display = 'none';
            }
        });
        quoteDetails.style.display = quoteDetails.style.display === 'none' ? 'block' : 'none';
    }

    // Add click event to the quotes
    document.querySelectorAll('.quote').forEach(quote => {
        quote.addEventListener('click', () => {
            const detailsId = quote.dataset.details;
            const details = document.getElementById(detailsId);
            toggleQuoteDetails(details);
            details.scrollIntoView({ behavior: 'smooth' });
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
