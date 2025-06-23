
    // Text-to-speech and audio recording variables
    let isSpeaking = false;
    let speechSynthesis = window.speechSynthesis;
    let speechUtterance = null;
    const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    let audioContext;
    let mediaRecorder;
    let audioChunks = [];
    let audioBlob;

    // Function to speak the translated text
    async function speakTranslation() {
        let translatedText = document.getElementById('translatedNotes').value.trim();
        const speakBtn = document.getElementById('speakBtn');
        const targetLang = document.getElementById('targetLanguage').value;
        
        if (!translatedText) {
            showError('No translated text to speak.', 'translationError');
            return;
        }
        
        if (isSpeaking) {
            stopSpeaking();
            return;
        }
        
        // Clean the text
        translatedText = cleanTextForSpeech(translatedText);
        
        if (!translatedText) {
            showError('No clean text to speak after removing time intervals.', 'translationError');
            return;
        }
        
        // Initialize audio recording
        try {
            await initAudioRecording();
        } catch (error) {
            console.error('Audio recording initialization failed:', error);
            showError('Audio recording not available. You can still listen.', 'translationError');
            // Continue without recording capability
        }
        
        // Start recording if initialized
        if (mediaRecorder) {
            audioChunks = [];
            mediaRecorder.start();
        }
        
        // Setup speaking UI
        setupSpeakingUI();
        
        // Create and configure speech
        speechUtterance = new SpeechSynthesisUtterance(translatedText);
        configureSpeech(targetLang);
        
        // Event handlers
        speechUtterance.onend = function() {
            onSpeechEnd();
        };
        
        speechUtterance.onerror = function(event) {
            onSpeechError(event);
        };
        
        // Speak the text
        speechSynthesis.speak(speechUtterance);
    }
    
    async function initAudioRecording() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create audio source from speech synthesis
            const dest = audioContext.createMediaStreamDestination();
            mediaRecorder = new MediaRecorder(dest.stream);
            
            mediaRecorder.ondataavailable = function(e) {
                audioChunks.push(e.data);
            };
            
            mediaRecorder.onstop = function() {
                audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            };
        }
    }
    
    function setupSpeakingUI() {
        isSpeaking = true;
        const speakBtn = document.getElementById('speakBtn');
        speakBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Speaking';
        speakBtn.classList.add('active-speaking');
        
        // Create speaking indicator
        const speakingIndicator = document.createElement('span');
        speakingIndicator.id = 'speakingIndicator';
        speakingIndicator.className = 'speaking-indicator speaking';
        speakingIndicator.textContent = 'Speaking...';
        speakBtn.parentNode.appendChild(speakingIndicator);
    }
    
    function configureSpeech(targetLang) {
        // Set language and voice
        speechUtterance.lang = targetLang === 'sw' ? 'sw-TZ' : getSpeechLangCode(targetLang);
        setOptimalVoice(targetLang);
        
        // Set speech parameters
        if (targetLang === 'sw') {
            speechUtterance.rate = isMobileDevice ? 0.9 : 0.8;
            speechUtterance.pitch = 1.0;
            speechUtterance.volume = 1.2;
        } else {
            speechUtterance.rate = isMobileDevice ? 1.0 : 0.9;
            speechUtterance.pitch = 1.0;
            speechUtterance.volume = 1.0;
        }
    }
    
    function onSpeechEnd() {
        stopSpeaking();
        
        // Stop recording if it was active
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            
            // Show download prompt if we have audio
            setTimeout(() => {
                if (audioBlob && audioBlob.size > 0) {
                    showDownloadPrompt();
                }
            }, 500);
        }
    }
    
    function onSpeechError(event) {
        console.error('SpeechSynthesis error:', event);
        stopSpeaking();
        showError('Text-to-speech failed. Please try again.', 'translationError');
    }
    
    function stopSpeaking() {
        isSpeaking = false;
        speechSynthesis.cancel();
        
        const speakBtn = document.getElementById('speakBtn');
        speakBtn.innerHTML = '<i class="fas fa-volume-up"></i> Speak Translation';
        speakBtn.classList.remove('active-speaking');
        document.getElementById('speakingIndicator')?.remove();
        
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
        }
    }
    
    function showDownloadPrompt() {
        const modal = document.createElement('div');
        modal.className = 'download-modal';
        modal.innerHTML = `
            <div class="download-modal-content">
                <p>Would you like to download the audio?</p>
                <div class="download-options">
                    <button class="btn btn-success" onclick="downloadAudio()">
                        <i class="fas fa-download"></i> Download
                    </button>
                    <button class="btn btn-outline" onclick="this.parentElement.parentElement.parentElement.remove()">
                        <i class="fas fa-times"></i> No Thanks
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-close after 30 seconds
        setTimeout(() => {
            if (document.body.contains(modal)) {
                modal.remove();
            }
        }, 30000);
    }
    
    function downloadAudio() {
        if (!audioBlob) return;
        
        const url = URL.createObjectURL(audioBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `translation_${new Date().toISOString().slice(0, 19)}.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Close the modal
        document.querySelector('.download-modal')?.remove();
    }
    
    // ... [keep all your existing helper functions like cleanTextForSpeech, getSpeechLangCode, etc.] ...
      
    // Set the best available voice for the target language
    function setOptimalVoice(targetLang) {
        const voices = speechSynthesis.getVoices();
        const langCode = targetLang === 'sw' ? 'sw-TZ' : getSpeechLangCode(targetLang);
        
        // Try to find exact match first
        const exactVoice = voices.find(v => v.lang === langCode);
        if (exactVoice) {
            speechUtterance.voice = exactVoice;
            return;
        }
        
        // Fallback to language-only match
        const langOnlyVoice = voices.find(v => v.lang.startsWith(targetLang));
        if (langOnlyVoice) {
            speechUtterance.voice = langOnlyVoice;
            return;
        }
        
        // Final fallback to default voice
        speechUtterance.lang = langCode;
    }
    
    // Configure speech parameters based on language and device
    function configureSpeechParameters(targetLang) {
        if (targetLang === 'sw') {
            // Special settings for Swahili
            speechUtterance.rate = isMobileDevice ? 0.9 : 0.8;  // Slower on PC
            speechUtterance.pitch = 1.0;  // Neutral pitch
            speechUtterance.volume = 1.2;  // Slightly louder
        } else {
            // Default settings for other languages
            speechUtterance.rate = isMobileDevice ? 1.0 : 0.9;
            speechUtterance.pitch = 1.0;
            speechUtterance.volume = 1.0;
        }
    }
    
    // Enhanced text cleaning function
    function cleanTextForSpeech(text) {
        // Remove time intervals and metadata
        text = text
            .replace(/\[\d{2}:\d{2}:\d{2}(?:\s*\|\s*\d{2}:\d{2}:\d{2})?\]/g, '')  // Timestamps
            .replace(/Note\s*#\d+/gi, '')  // Note numbers
            .replace(/Timestamp:\s*\d{2}:\d{2}:\d{2}/gi, '')  // Timestamp labels
            .replace(/Video\s*Time:\s*\d{2}:\d{2}:\d{2}/gi, '')  // Video time labels
            .replace(/\s*-\s*/g, ' ')  // Hyphens
            .replace(/\s*\[\s*\]\s*/g, ' ')  // Empty brackets
            .replace(/\s+/g, ' ')  // Multiple spaces
            .trim();
        
        // Add pauses between sentences
        return text.replace(/([.!?])\s*/g, '$1 ').trim();
    }
    
    // Language code mapping with sw-TZ as standard Swahili
    function getSpeechLangCode(targetLang) {
        const langMap = {
            'es': 'es-ES', // Spanish
            'fr': 'fr-FR', // French
            'de': 'de-DE', // German
            'it': 'it-IT', // Italian
            'pt': 'pt-PT', // Portuguese
            'ru': 'ru-RU', // Russian
            'zh': 'zh-CN', // Chinese
            'ja': 'ja-JP', // Japanese
            'ko': 'ko-KR', // Korean
            'hi': 'hi-IN', // Hindi
            'ar': 'ar-SA', // Arabic
            'tr': 'tr-TR', // Turkish
            'th': 'th-TH', // Thai
            'vi': 'vi-VN', // Vietnamese
            'sw': 'sw-TZ'  // Swahili (Tanzania - standard)
        };
        
        return langMap[targetLang] || 'en-US';
    }
    
    // Initialize speech synthesis
    function initSpeech() {
        if (!('speechSynthesis' in window)) {
            document.getElementById('speakBtn').disabled = true;
            document.getElementById('speakBtn').title = 'Text-to-speech not supported in your browser';
            return;
        }
        
        // Load voices and retry if not immediately available
        let voices = speechSynthesis.getVoices();
        if (voices.length === 0) {
            speechSynthesis.onvoiceschanged = function() {
                voices = speechSynthesis.getVoices();
                speechSynthesis.onvoiceschanged = null;
            };
        }
    }
    
    
    // Initialize with audio context permission request
    function init() {
        // ... your existing init code ...
              // Check for speech synthesis support
        if (!('speechSynthesis' in window)) {
            document.getElementById('speakBtn').disabled = true;
            document.getElementById('speakBtn').title = 'Text-to-speech not supported in your browser';
        } else {
            // Preload voices for better performance
            speechSynthesis.onvoiceschanged = function() {
                console.log('Voices loaded:', speechSynthesis.getVoices());
            };
        }
        
        // Request audio context permission on user interaction
        document.getElementById('speakBtn').addEventListener('click', async () => {
            if (!audioContext && 'AudioContext' in window) {
                try {
                    audioContext = new AudioContext();
                    await audioContext.resume(); // Required for Chrome autoplay policy
                } catch (error) {
                    console.error('AudioContext initialization failed:', error);
                }
            }
        });
        
        initSpeech();
    }
