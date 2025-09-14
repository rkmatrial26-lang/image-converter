document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selection ---
    const uploaderArea = document.getElementById('uploader');
    const fileInput = document.getElementById('fileInput');
    const previewArea = document.getElementById('previewArea');
    const imagePreview = document.getElementById('imagePreview');
    const removeBtn = document.getElementById('removeBtn');
    const formatBtns = document.querySelectorAll('.format-btn');
    const downloadBtn = document.getElementById('downloadBtn');
    const processingOverlay = document.getElementById('processingOverlay');

    // --- State Management ---
    let originalFile = null;
    let originalFileName = '';
    let selectedFormat = 'jpeg'; // Default format

    // --- Event Listeners ---

    // Trigger file input when the uploader area is clicked
    uploaderArea.addEventListener('click', () => fileInput.click());

    // Handle file selection
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    });

    // Drag and Drop functionality
    uploaderArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploaderArea.classList.add('drag-over');
    });

    uploaderArea.addEventListener('dragleave', () => {
        uploaderArea.classList.remove('drag-over');
    });

    uploaderArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploaderArea.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    });

    // Handle format selection
    formatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            formatBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedFormat = btn.dataset.format;
        });
    });

    // Handle image removal
    removeBtn.addEventListener('click', resetInterface);

    // Handle download button click
    downloadBtn.addEventListener('click', convertAndDownload);


    // --- Core Functions ---

    /**
     * Handles the selected or dropped file.
     * @param {File} file - The image file.
     */
    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }

        originalFile = file;
        originalFileName = file.name.split('.').slice(0, -1).join('.'); // Get name without extension

        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            showPreview();
        };
        reader.readAsDataURL(file);
    }

    /**
     * Switches the UI to show the image preview and conversion controls.
     */
    function showPreview() {
        uploaderArea.classList.add('hidden');
        previewArea.classList.remove('hidden');
    }

    /**
     * Resets the UI to its initial state.
     */
    function resetInterface() {
        previewArea.classList.add('hidden');
        uploaderArea.classList.remove('hidden');
        fileInput.value = ''; // Clear the file input
        originalFile = null;
        imagePreview.src = '#';
    }

    /**
     * Converts the uploaded image to the selected format and triggers a download.
     */
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
                
                // For PNGs with transparency, fill background with white if converting to JPG
                if (selectedFormat === 'jpeg') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                ctx.drawImage(img, 0, 0);

                const mimeType = `image/${selectedFormat}`;
                // For JPG, quality can be specified (0.0 to 1.0)
                const dataUrl = canvas.toDataURL(mimeType, 0.95);

                // Create a temporary link to trigger download
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = `${originalFileName}.${selectedFormat === 'jpeg' ? 'jpg' : 'png'}`;
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                showProcessing(false);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(originalFile);
    }

    /**
     * Shows or hides the processing overlay.
     * @param {boolean} isProcessing - True to show, false to hide.
     */
    function showProcessing(isProcessing) {
        if (isProcessing) {
            processingOverlay.classList.remove('hidden');
        } else {
            processingOverlay.classList.add('hidden');
        }
    }
});