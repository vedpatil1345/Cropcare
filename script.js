document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.getElementById('send-btn');
    const textarea = document.getElementById('chat-textarea');
    const previewImg = document.getElementById('image-preview');
    const messages = document.getElementById('messages');
    const uploadBtn = document.getElementById('upload-btn');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const uploadFromDeviceBtn = document.getElementById('upload-from-device');
    const captureFromCameraBtn = document.getElementById('capture-from-camera');
    const cameraModal = document.querySelector('.camera-modal');
    const closeCameraModal = document.querySelector('.close-camera-modal');
    const cameraPreview = document.getElementById('camera-preview');
    const captureBtn = document.getElementById('capture-btn');

    let stream = null; // To hold the media stream

    // Toggle dropdown menu visibility
    uploadBtn.addEventListener('click', () => {
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    });

    // Handle closing the modals
    document.addEventListener('click', (event) => {
        if (!uploadBtn.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.style.display = 'none';
        }
    });

    closeCameraModal.addEventListener('click', () => {
        cameraModal.style.display = 'none'; // Hide the camera modal
        if (stream) {
            stream.getTracks().forEach(track => track.stop()); // Stop camera stream
        }
    });

    // Handle uploading from device
    uploadFromDeviceBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    previewImg.src = event.target.result;
                    previewImg.style.display = 'block'; // Show image preview
                    dropdownMenu.style.display = 'none'; // Hide the dropdown menu
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    });

    // Handle capturing from camera
    captureFromCameraBtn.addEventListener('click', async () => {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraPreview.srcObject = stream;
            cameraModal.style.display = 'block'; // Show the camera modal
        } catch (error) {
            console.error('Error accessing camera:', error);
        }
    });

    // Capture the image from the camera
    captureBtn.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const video = cameraPreview;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        previewImg.src = canvas.toDataURL('image/png');
        previewImg.style.display = 'block'; // Show image preview
        cameraModal.style.display = 'none'; // Hide the camera modal
        if (stream) {
            stream.getTracks().forEach(track => track.stop()); // Stop camera stream
        }
    });

    // Handle the send button click
    sendBtn.addEventListener('click', () => {
        const text = textarea.value.trim();
        const imageSrc = previewImg.src;

        if (text || imageSrc) {
            const messageElem = document.createElement('div');
            messageElem.classList.add('message', 'user');

            if (imageSrc) {
                const imgElem = document.createElement('img');
                imgElem.src = imageSrc;
                messageElem.appendChild(imgElem);
                previewImg.src = ''; // Clear preview after sending
                previewImg.style.display = 'none'; // Hide image preview
            } 

            if (text) {
                const textElem = document.createElement('span');
                textElem.classList.add('message-content');
                textElem.textContent = text;
                messageElem.appendChild(textElem);
            }

            messages.appendChild(messageElem);
            textarea.value = '';
            messages.scrollTop = messages.scrollHeight;

            // Reset image preview state
            previewImg.src = '';
            previewImg.style.display = 'none';
        }
    });
});
