document.addEventListener('DOMContentLoaded', () => {
    function handleSplashScreen() {
        setTimeout(() => {
            document.getElementById('splash-screen').style.display = 'none';
            document.getElementById('app').style.display = 'flex';
            document.getElementById('app').style.opacity = 1;
            initHologram();
            initTiles();
        }, 4000);
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
        }
    });

    document.getElementById('create-magic-button').addEventListener('click', async () => {
        try {
            const response = await fetch('/create-magic', { method: 'POST' });
            const data = await response.json();
            alert(data.message);
        } catch (error) {
            console.error('Create Magic Error:', error);
        }
    });
});

// Ensure Three.js Hologram and Tiles are initialized properly
let scene, camera, renderer, mainMesh;
let points = 0;

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
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
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
        cube.position.x = i * 4 - 8;
        tileScene.add(cube);
        tiles.push(cube);
    }

    animateTiles();
}

function animateTiles() {
    requestAnimationFrame(animateTiles);
    tiles.forEach((tile, index) => {
        tile.rotation.x += 0.01 + index * 0.002;
        tile.rotation.y += 0.01 + index * 0.002;
        tile.position.y = Math.sin(Date.now() * 0.001 + index) * 1.5;
    });
    tileRenderer.render(tileScene, tileCamera);
}
