# 🤖 Google Cloud Text-to-Speech - קול רובוטי נשי

## 🎯 **מה זה נותן:**
קול רובוטי נשי איכותי (Neural2 או WaveNet) במקום הקול הרגיל של הדפדפן.

---

## 📋 **שלבי הגדרה:**

### **שלב 1: צור חשבון Google Cloud**
1. לך ל-https://console.cloud.google.com/
2. צור פרויקט חדש (למשל: "AutoPage-TTS")
3. הפעל את **Cloud Text-to-Speech API**

### **שלב 2: קבל API Key**
1. לך ל-**APIs & Services** → **Credentials**
2. **Create Credentials** → **API Key**
3. העתק את ה-API Key
4. **הגבל את ה-Key** ל-Text-to-Speech API בלבד (אבטחה)

### **שלב 3: הוסף את הקוד**

פתח את `marketplace.html` וחפש:
```javascript
function speakText(text) {
```

**החלף את כל הפונקציה** בזו:

```javascript
async function speakText(text) {
    // Remove emojis, asterisks, HTML, parentheses, and clean text for speech
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

    // Cancel any ongoing speech
    if (window.currentAudio) {
        window.currentAudio.pause();
        window.currentAudio = null;
    }

    const micButton = document.getElementById('micButton');
    if (micButton) {
        micButton.style.background = '#10b981';
        micButton.textContent = '🔊';
    }

    try {
        // 🤖 Google Cloud Text-to-Speech API
        const API_KEY = 'YOUR_API_KEY_HERE'; // ← שים את ה-API Key שלך כאן
        
        const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                input: { text: cleanText },
                voice: {
                    languageCode: 'he-IL',
                    name: 'he-IL-Wavenet-A', // קול נשי רובוטי
                    ssmlGender: 'FEMALE'
                },
                audioConfig: {
                    audioEncoding: 'MP3',
                    pitch: -5.0,        // נמוך יותר לאפקט רובוטי
                    speakingRate: 1.1,  // קצת מהיר
                    effectsProfileId: ['handset-class-device'], // אפקט רובוטי
                }
            })
        });

        const data = await response.json();
        
        if (data.audioContent) {
            // Convert base64 to audio and play
            const audio = new Audio('data:audio/mp3;base64,' + data.audioContent);
            window.currentAudio = audio;
            
            audio.onplay = () => {
                isSpeaking = true;
                console.log('🔊 Speaking (Google TTS):', cleanText.substring(0, 50) + '...');
            };
            
            audio.onended = () => {
                isSpeaking = false;
                if (micButton) {
                    micButton.style.background = '#667eea';
                    micButton.textContent = '🎤';
                }
                console.log('✅ Speech finished');
            };
            
            audio.onerror = (e) => {
                console.error('❌ Audio error:', e);
                isSpeaking = false;
                if (micButton) {
                    micButton.style.background = '#667eea';
                    micButton.textContent = '🎤';
                }
            };
            
            await audio.play();
        }
    } catch (error) {
        console.error('❌ Google TTS error:', error);
        // Fallback to browser TTS if Google fails
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'he-IL';
        utterance.rate = 1.1;
        utterance.pitch = 0.6;
        speechSynthesis.speak(utterance);
    }
}
```

### **שלב 4: החלף את ה-API Key**
```javascript
const API_KEY = 'YOUR_API_KEY_HERE'; // ← שים את המפתח שלך כאן
```

### **שלב 5: שמור ורענן**
```
Ctrl + S
Ctrl + Shift + R (בדפדפן)
```

---

## 🎚️ **אפשרויות קול:**

### **קולות נשיים:**
```javascript
name: 'he-IL-Wavenet-A'  // נשי רובוטי (מומלץ!)
name: 'he-IL-Wavenet-B'  // נשי רגיל
name: 'he-IL-Neural2-A'  // נשי איכותי
```

### **קולות גברים:**
```javascript
name: 'he-IL-Wavenet-C'  // גברי רובוטי
name: 'he-IL-Wavenet-D'  // גברי עמוק
```

---

## 🎛️ **שינוי אפקט רובוטי:**

### **רובוטי מאוד:**
```javascript
pitch: -8.0,
speakingRate: 1.2,
effectsProfileId: ['handset-class-device']
```

### **רובוטי בינוני:** (← **זה מה שבקוד**)
```javascript
pitch: -5.0,
speakingRate: 1.1,
effectsProfileId: ['handset-class-device']
```

### **טבעי:**
```javascript
pitch: 0.0,
speakingRate: 1.0,
effectsProfileId: []
```

---

## 💰 **עלויות:**

- **Free Tier:** 1 מליון תווים/חודש (WaveNet)
- **Free Tier:** 4 מיליון תווים/חודש (Standard)
- זה **מספיק לרוב השימושים**!

אחרי זה:
- WaveNet: $16 למיליון תווים
- Neural2: $16 למיליון תווים

---

## 🔒 **אבטחה:**

### **חשוב! הגבל את ה-API Key:**
1. ב-Google Cloud Console → **API Key** → **Edit**
2. **API restrictions** → בחר רק **Cloud Text-to-Speech API**
3. **Application restrictions** → בחר **HTTP referrers** והוסף:
   ```
   http://localhost:3002/*
   https://yoursite.com/*
   ```

זה ימנע משימוש לא מורשה במפתח שלך.

---

## 🧪 **בדיקה:**

1. שמור את הקובץ
2. רענן דפדפן: `Ctrl + Shift + R`
3. לחץ על 🎤
4. דבר: "שלום"
5. תשמע קול רובוטי נשי מ-Google! 🤖

---

## ⚠️ **Troubleshooting:**

### **אם זה לא עובד:**
1. בדוק F12 → Console לשגיאות
2. וודא שה-API Key נכון
3. וודא ש-Text-to-Speech API מופעל בפרויקט
4. בדוק את ההגבלות על המפתח

### **אם יש שגיאת CORS:**
הוסף את הדומיין שלך ל-HTTP referrers ב-API Key settings.

---

## 📚 **מידע נוסף:**

- [Google TTS Voices](https://cloud.google.com/text-to-speech/docs/voices)
- [Google TTS Pricing](https://cloud.google.com/text-to-speech/pricing)
- [Audio Effects](https://cloud.google.com/text-to-speech/docs/audio-profiles)


