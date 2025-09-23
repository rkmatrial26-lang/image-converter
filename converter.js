// This function runs only if we are on the converter page
function initConverter() {
    // --- Smartlink Ad URL from original file ---
    const smartlinkUrl = 'https://www.revenuecpmgate.com/fcr44zjbxx?key=7c75a467eacaf805dcde7cb877f03180';

    // --- DOM Element Selection ---
    const uploaderArea = document.getElementById('uploader');
    const fileInput = document.getElementById('fileInput');
    const previewArea = document.getElementById('previewArea');
    const imagePreview = document.getElementById('imagePreview');
    const removeBtn = document.getElementById('removeBtn');
    const formatBtns = document.querySelectorAll('.format-btn');
    const downloadBtn = document.getElementById('downloadBtn');
    const processingOverlay = document.getElementById('processingOverlay');

    // Make sure elements exist before adding listeners
    if (!uploaderArea) return;

    // --- State Management ---
    let originalFile = null;
    let originalFileName = '';
    let selectedFormat = 'jpeg'; // Default format

    // --- Event Listeners ---
    uploaderArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    });

    // Drag and Drop
    uploaderArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploaderArea.classList.add('drag-over');
    });
    uploaderArea.addEventListener('dragleave', () => uploaderArea.classList.remove('drag-over'));
    uploaderArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploaderArea.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    });

    formatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            formatBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedFormat = btn.dataset.format;
        });
    });

    removeBtn.addEventListener('click', resetInterface);

    // Download button click with smartlink ad
    downloadBtn.addEventListener('click', () => {
        window.open(smartlinkUrl, '_blank');
        convertAndDownload();
    });

    // --- Core Functions ---
    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }
        originalFile = file;
        originalFileName = file.name.split('.').slice(0, -1).join('.');
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            showPreview();
        };
        reader.readAsDataURL(file);
    }

    function showPreview() {
        uploaderArea.classList.add('hidden');
        previewArea.classList.remove('hidden');
    }

    function resetInterface() {
        previewArea.classList.add('hidden');
        uploaderArea.classList.remove('hidden');
        fileInput.value = '';
        originalFile = null;
        imagePreview.src = '#';
    }

    function convertAndDownload() {
        if (!originalFile) return;
        showProcessing(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                if (selectedFormat === 'jpeg') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                ctx.drawImage(img, 0, 0);
                const mimeType = `image/${selectedFormat}`;
                const dataUrl = canvas.toDataURL(mimeType, 0.95);
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = `${originalFileName}.${selectedFormat === 'jpeg' ? 'jpg' : selectedFormat}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                showProcessing(false);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(originalFile);
    }

    function showProcessing(isProcessing) {
        if (isProcessing) {
            processingOverlay.classList.remove('hidden');
        } else {
            processingOverlay.classList.add('hidden');
        }
    }
}

// Run the converter logic
initConverter();
