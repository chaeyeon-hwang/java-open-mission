
const sejongCenter = [37.5505, 127.0749];

const map = L.map('map', {
    center: sejongCenter,
    zoom: 17,       
    minZoom: 16,     
    maxZoom: 19,
    maxBounds: [     
        [37.546, 127.070], 
        [37.555, 127.080]  
    ],
    maxBoundsViscosity: 1.0  
});


L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);


const picker = document.getElementById('emotion-picker');
const memoInput = document.getElementById('memo-input');
const emotionButtons = document.querySelectorAll('.emotions button');
const downloadBtn = document.getElementById('download-btn');
const uploadInput = document.getElementById('upload-json');  

let clickedLatLng = null;

const spots = [];


map.on('click', (e) => {
    clickedLatLng = e.latlng;
    picker.classList.remove('hidden');
    memoInput.value = '';   
    memoInput.focus();
});


emotionButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (!clickedLatLng) return;

        const emotion = btn.textContent;
        const memo = memoInput.value.trim();

        
        const spot = {
            id: Date.now(),
            lat: clickedLatLng.lat,
            lng: clickedLatLng.lng,
            emotion,
            memo
        };

     
        spots.push(spot);

        
        createMarker(spot, true);

        
        picker.classList.add('hidden');
        clickedLatLng = null;
        memoInput.value = '';
    });
});


function createMarker(spot, openPopup) {
    const popupHtml = `
        <div>
            <div style="font-size:20px;">${spot.emotion}</div>
            ${spot.memo ? `<div style="margin-top:4px; font-size:13px;">${spot.memo}</div>` : ''}
        </div>
    `;

    const marker = L.marker([spot.lat, spot.lng])
        .addTo(map)
        .bindPopup(popupHtml);

    if (openPopup) {
        marker.openPopup();
    }
}


downloadBtn.addEventListener('click', () => {
    if (spots.length === 0) {
        alert('감정을 기록해주세요');
        return;
    }

    const dataStr = JSON.stringify(spots, null, 2);

    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'emoMap-spots.json'; 
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
});


uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        try {
            const loaded = JSON.parse(reader.result);

            spots.length = 0;

            loaded.forEach(spot => {
                spots.push(spot);
                createMarker(spot, false);
            });
        } catch (err) {
            alert('JSON 형식이 잘못되었습니다.');
        }
    };
    reader.readAsText(file);
});