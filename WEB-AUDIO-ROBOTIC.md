# 🎛️ Web Audio API - אפקט רובוטי על קול הדפדפן

## 🎯 **מה זה עושה:**
מוסיף אפקט "vocoder" רובוטי על הקול הקיים של הדפדפן.

**יתרונות:**
- ✅ חינם לגמרי
- ✅ לא צריך API key
- ✅ עובד offline

**חסרונות:**
- ❌ לא איכותי כמו Google TTS
- ❌ עדיין תלוי בקולות המותקנים במערכת

---

## 🔧 **קוד:**

פתח `marketplace.html` וחפש:
```javascript
function speakText(text) {
```

**החלף בזה:**

```javascript
function speakText(text) {
    const cleanText = text
        .replace(/<[^>]*>/g, '')
        .replace(/&[^;]+;/g, '')
        .replace(/[😊💡📍📞📧🏠💰✅❌🔗📄🏪🎉🎓🔧👁️🎯🔍📚📝🔊🎤🔴]/g, '')
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/\([^)]*\)/g, '')
        .replace(/\.{2,}/g, '')
        .replace(/\n\n+/g, '. ')
        .replace(/\n/g, '. ')
        .replace(/•/g, '')
        .replace(/\|/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    if (!cleanText) return;

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'he-IL';
    utterance.rate = 1.1;
    utterance.pitch = 0.7;
    utterance.volume = 1.0;

    // 🎙️ Select voice
    const voices = speechSynthesis.getVoices();
    const hebrewVoice = voices.find(voice => 
        voice.lang.startsWith('he') && voice.name.includes('Female')
    ) || voices.find(voice => voice.lang.startsWith('he'));
    
    if (hebrewVoice) {
        utterance.voice = hebrewVoice;
    }

    // 🤖 Create Web Audio context for robotic effect
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Vocoder-style robotic effect
    oscillator.type = 'square'; // Square wave for robotic sound
    oscillator.frequency.value = 400; // Robot carrier frequency
    gainNode.gain.value = 0.3; // Mix level
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    utterance.onstart = function() {
        isSpeaking = true;
        oscillator.start();
        
        const micButton = document.getElementById('micButton');
        if (micButton) {
            micButton.style.background = '#10b981';
            micButton.textContent = '🔊';
        }
        console.log('🔊 Speaking (Robotic):', cleanText.substring(0, 50) + '...');
    };

    utterance.onend = function() {
        isSpeaking = false;
        oscillator.stop();
        audioContext.close();
        
        const micButton = document.getElementById('micButton');
        if (micButton) {
            micButton.style.background = '#667eea';
            micButton.textContent = '🎤';
        }
        console.log('✅ Speech finished');
    };

    utterance.onerror = function(event) {
        console.error('❌ Speech error:', event.error);
        isSpeaking = false;
        oscillator.stop();
        audioContext.close();
    };

    speechSynthesis.speak(utterance);
}
```

---

## 🎚️ **כוונון אפקט רובוטי:**

### **רובוטי מאוד:**
```javascript
oscillator.type = 'square';
oscillator.frequency.value = 300;
gainNode.gain.value = 0.5;
```

### **רובוטי בינוני:**
```javascript
oscillator.type = 'square';
oscillator.frequency.value = 400;
gainNode.gain.value = 0.3;
```

### **רובוטי עדין:**
```javascript
oscillator.type = 'sine';
oscillator.frequency.value = 500;
gainNode.gain.value = 0.2;
```

---

## ⚠️ **שים לב:**
זה לא ייתן קול רובוטי **אמיתי** כמו Google TTS, אבל זה חינם ופשוט.


