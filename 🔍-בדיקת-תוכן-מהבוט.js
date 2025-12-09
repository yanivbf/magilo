// סקריפט בדיקה - האם הבוט מחזיר תוכן?
// הרץ את זה בקונסול של הדפדפן אחרי שיצרת דף

console.log('🔍 בודק אם הבוט החזיר תוכן...');

// שלח בקשה לבוט
fetch('/api/n8n-webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'generate_content',
    businessName: 'מספרת דני',
    serviceType: 'service',
    description: 'מספרה מקצועית',
    sections: 'about, services, faq, testimonials, gallery'
  })
})
.then(res => res.json())
.then(data => {
  console.log('📥 תשובה מהבוט:', data);
  
  if (data.faq) {
    console.log('✅ FAQ:', data.faq.length, 'פריטים');
    console.log('📋 דוגמה:', data.faq[0]);
  } else {
    console.log('❌ אין FAQ');
  }
  
  if (data.gallery) {
    console.log('✅ Gallery:', data.gallery.length, 'תמונות');
  } else {
    console.log('❌ אין Gallery');
  }
  
  if (data.testimonials) {
    console.log('✅ Testimonials:', data.testimonials.length, 'פריטים');
  } else {
    console.log('❌ אין Testimonials');
  }
  
  if (data.aboutText) {
    console.log('✅ About:', data.aboutText.substring(0, 50) + '...');
  } else {
    console.log('❌ אין About');
  }
  
  if (data.services) {
    console.log('✅ Services:', data.services.length, 'פריטים');
  } else {
    console.log('❌ אין Services');
  }
})
.catch(err => {
  console.error('❌ שגיאה:', err);
});
