document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.getElementById('send-btn');
    const textarea = document.getElementById('chat-textarea');
    const previewImg = document.getElementById('image-preview');
    const messages = document.getElementById('messages');
    const readBtn = document.getElementById('read-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadModal = document.getElementById('upload-options-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const cameraContainer = document.getElementById('camera-container');
    const cameraPreview = document.getElementById('camera-preview');
    const captureBtn = document.getElementById('capture-btn');
    const cancelCameraBtn = document.getElementById('cancel-camera-btn');
    const uploadDeviceBtn = document.getElementById('upload-device-btn');
    const uploadCameraBtn = document.getElementById('upload-camera-btn');
    const micBtn = document.getElementById('mic-btn'); // Mic button
    let videoStream;
    let lastBotMessage; // Variable to store the last bot message
    let recognition; // For speech recognition
    let isListening = false; // Flag to track the listening state

    // Initialize speech recognition if available
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            textarea.value = transcript;
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event);
        };

        recognition.onend = () => {
            isListening = false; // Update flag when recognition ends
        };
    } else {
        console.error('Speech recognition not supported.');
    }

    // Show the modal when the upload button is clicked
    uploadBtn.addEventListener('click', () => {
        uploadModal.style.display = 'block';
    });

    // Close the modal when the "Cancel" button or close button is clicked
    closeModalBtn.addEventListener('click', () => {
        uploadModal.style.display = 'none';
    });

    // Handle the upload from device option
    uploadDeviceBtn.addEventListener('click', () => {
        uploadModal.style.display = 'none';
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                // Check file type and size (example: limit size to 2MB)
                if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) {
                    alert('Please upload a valid image file under 2MB.');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (event) => {
                    previewImg.src = event.target.result;
                    previewImg.style.display = 'block'; // Show image preview
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    });

    // Handle the use camera option
    uploadCameraBtn.addEventListener('click', async () => {
        uploadModal.style.display = 'none';
        cameraContainer.style.display = 'flex';

        try {
            videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
            cameraPreview.srcObject = videoStream;
        } catch (err) {
            console.error('Error accessing the camera', err);
            cameraContainer.style.display = 'none';
        }
    });

    // Capture the image from the video feed
    captureBtn.addEventListener('click', () => {
        const canvas = document.createElement('canvas');
        canvas.width = cameraPreview.videoWidth;
        canvas.height = cameraPreview.videoHeight;
        const context = canvas.getContext('2d');
        context.drawImage(cameraPreview, 0, 0, canvas.width, canvas.height);
        const imageUrl = canvas.toDataURL('image/png');
        previewImg.src = imageUrl;
        previewImg.style.display = 'block'; // Show image preview
        cameraContainer.style.display = 'none';

        // Stop the camera
        videoStream.getTracks().forEach(track => track.stop());
    });

    // Cancel the camera preview
    cancelCameraBtn.addEventListener('click', () => {
        cameraContainer.style.display = 'none';
        if (videoStream) {
            videoStream.getTracks().forEach(track => track.stop());
        }
    });

    // Handle the mic button click
    micBtn.addEventListener('click', () => {
        if (recognition) {
            if (!isListening) {
                recognition.start();
                isListening = true; // Update flag to indicate listening state
            } else {
                recognition.stop();
                isListening = false; // Update flag to indicate stopped state
            }
        }
    });

    // Handle the send button click
    sendBtn.addEventListener('click', handleSend);

    function handleSend() {
        const text = getTextValue();
        const imageSrc = getImageSrc();
    
        if (text || imageSrc) {
            const messageElem = createMessageElement();
            
            if (imageSrc) {
                appendImage(messageElem, imageSrc);
            }
    
            if (text) {
                appendText(messageElem, text);
            }
    
            addMessageToChat(messageElem);
            resetInputFields();
            
            // Simulate bot response
            simulateBotResponse(text);
        }
    }
    
    function getTextValue() {
        return textarea.value.trim();
    }
    
    function getImageSrc() {
        return previewImg.src || ''; // Return empty string if there's no image source
    }
    
    function createMessageElement() {
        const messageElem = document.createElement('div');
        messageElem.classList.add('message', 'user');
        return messageElem;
    }
    
    function appendImage(messageElem, imageSrc) {
        const imgElem = document.createElement('img');
        imgElem.src = imageSrc;

        // Handle image load error
        imgElem.onerror = () => {
            messageElem.removeChild(imgElem); // Remove the broken image element
        };

        messageElem.appendChild(imgElem);
    }
    
    function appendText(messageElem, text) {
        const textElem = document.createElement('span');
        textElem.classList.add('message-content');
        textElem.textContent = text;
        messageElem.appendChild(textElem);
    }
    
    function addMessageToChat(messageElem) {
        messages.appendChild(messageElem);
        messages.scrollTop = messages.scrollHeight;
    }
    
    function resetInputFields() {
        textarea.value = '';
        resetImagePreview();
    }
    
    function resetImagePreview() {
        previewImg.src = '';
        previewImg.style.display = 'none';
    }

    // Handle the read button click
    readBtn.addEventListener('click', () => {
        if (lastBotMessage) {
            const utterance = new SpeechSynthesisUtterance(lastBotMessage);
            speechSynthesis.speak(utterance);
        } else {
            alert('No message to read.');
        }
    });

    // Simulate a bot response (for demonstration purposes)
    function simulateBotResponse(userMessage) {
        const botMessage = `You said: ${userMessage}. This is the bot response.`;
        const botMessageElem = document.createElement('div');
        botMessageElem.classList.add('message', 'bot');
        appendText(botMessageElem, botMessage);
        addMessageToChat(botMessageElem);
        
        // Store the last bot message for reading
        lastBotMessage = botMessage;
    }
});
