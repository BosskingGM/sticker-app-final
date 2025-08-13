document.addEventListener('DOMContentLoaded', () => {
    const statusText = document.getElementById('status');
    const imageUpload = document.getElementById('imageUpload');
    const imagePreview = document.getElementById('imagePreview');
    const canvas = document.getElementById('outputCanvas');
    const ctx = canvas.getContext('2d');
    const controls = document.getElementById('controls');
    const downloadBtn = document.getElementById('downloadBtn');
    const thicknessSlider = document.getElementById('thicknessSlider');
    const thicknessValue = document.getElementById('thicknessValue');

    let imageWithoutBg = null;

    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        controls.classList.add('hidden');
        downloadBtn.classList.add('hidden');
        imagePreview.src = '';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        removeBackground(file);
    });
    
    async function removeBackground(file) {
        statusText.textContent = 'Procesando imagen, por favor espera...';
        const formData = new FormData();
        formData.append('image_file', file);
        try {
            const response = await fetch('/.netlify/functions/remove-background', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error(`Error del servidor: ${response.statusText}`);
            const imageBlob = await response.blob();
            const imageUrl = URL.createObjectURL(imageBlob);
            imageWithoutBg = new Image();
            imageWithoutBg.src = imageUrl;
            imageWithoutBg.onload = () => {
                imagePreview.src = imageWithoutBg.src;
                processImage();
                statusText.textContent = '¡Listo! Ajusta el contorno.';
                controls.classList.remove('hidden');
                downloadBtn.classList.remove('hidden');
            };
        } catch (error) {
            console.error('Error:', error);
            statusText.textContent = `Error: ${error.message}`;
        }
    }

    function processImage() {
        if (!imageWithoutBg) return;
        canvas.width = imageWithoutBg.width;
        canvas.height = imageWithoutBg.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const thickness = parseInt(thicknessSlider.value, 10);
        if (thickness > 0) {
            ctx.shadowColor = 'white';
            ctx.shadowBlur = thickness;
            for (let i = 0; i < 10; i++) ctx.drawImage(imageWithoutBg, 0, 0);
        }
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.drawImage(imageWithoutBg, 0, 0);
    }
    
    thicknessSlider.addEventListener('input', (e) => {
        thicknessValue.textContent = e.target.value;
        processImage();
    });

    downloadBtn.addEventListener('click', () => {
        let filename = prompt("Ingresa el nombre del archivo:", "sticker");
        if (filename) {
            const link = document.createElement('a');
            link.download = `${filename}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    });
});