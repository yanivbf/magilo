/**
 * 📚 Course Checkout & Video Access System
 * Handles course purchases and unlocks video content
 */

console.log('📚 Course checkout script loaded');

// Get course/page ID from URL
const getCourseId = () => {
    const pathParts = window.location.pathname.split('/');
    return pathParts[pathParts.length - 1];
};

const courseId = getCourseId();
console.log('📚 Course ID:', courseId);

// Check if course is purchased
function isCoursePurchased() {
    const purchased = localStorage.getItem(`course_purchased_${courseId}`);
    console.log('🔍 Course purchased?', purchased === 'true');
    return purchased === 'true';
}

// Purchase course function - SIMPLIFIED DIRECT PURCHASE
window.purchaseCourse = async function(courseName, price) {
    console.log('💳 Starting direct course purchase...');
    
    // Create purchase form modal
    const modal = document.createElement('div');
    modal.id = 'purchase-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;
    
    const formContainer = document.createElement('div');
    formContainer.style.cssText = `
        background: white;
        border-radius: 16px;
        padding: 32px;
        max-width: 500px;
        width: 100%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    `;
    
    formContainer.innerHTML = `
        <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="font-size: 28px; font-weight: bold; color: #1F2937; margin: 0 0 8px 0;">🎓 רכישת קורס</h2>
            <p style="color: #6B7280; font-size: 16px;">${courseName}</p>
            <p style="font-size: 32px; font-weight: bold; color: #10B981; margin: 16px 0;">₪${price}</p>
        </div>
        
        <form id="purchase-form" style="display: flex; flex-direction: column; gap: 16px;">
            <div>
                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">📱 מספר טלפון (לזיהוי)</label>
                <input type="tel" id="phone-input" required 
                       placeholder="050-1234567"
                       style="width: 100%; padding: 12px; border: 2px solid #E5E7EB; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
                <p style="font-size: 12px; color: #6B7280; margin-top: 4px;">⚠️ חשוב! מספר זה ישמש לזיהוי שלך בכניסות הבאות</p>
            </div>
            
            <div>
                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">👤 שם מלא</label>
                <input type="text" id="name-input" required 
                       placeholder="ישראל ישראלי"
                       style="width: 100%; padding: 12px; border: 2px solid #E5E7EB; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
            </div>
            
            <div>
                <label style="display: block; font-weight: 600; color: #374151; margin-bottom: 8px;">📧 אימייל</label>
                <input type="email" id="email-input" required 
                       placeholder="example@gmail.com"
                       style="width: 100%; padding: 12px; border: 2px solid #E5E7EB; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
            </div>
            
            <div style="background: #FEF3C7; padding: 16px; border-radius: 8px; border: 2px solid #FCD34D;">
                <p style="font-size: 14px; color: #92400E; margin: 0; line-height: 1.6;">
                    💡 <strong>הערה:</strong> התשלום יתבצע דרך WhatsApp. לאחר לחיצה על "המשך לתשלום", נפתח WhatsApp עם פרטי הרכישה.
                </p>
            </div>
            
            <div style="display: flex; gap: 12px; margin-top: 8px;">
                <button type="button" onclick="document.getElementById('purchase-modal').remove()" 
                        style="flex: 1; padding: 14px; background: #E5E7EB; color: #374151; border: none; border-radius: 8px; font-weight: 600; font-size: 16px; cursor: pointer;">
                    ביטול
                </button>
                <button type="submit" 
                        style="flex: 2; padding: 14px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; border: none; border-radius: 8px; font-weight: 600; font-size: 16px; cursor: pointer; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                    💳 המשך לתשלום
                </button>
            </div>
        </form>
    `;
    
    modal.appendChild(formContainer);
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('purchase-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const phone = document.getElementById('phone-input').value.trim();
        const name = document.getElementById('name-input').value.trim();
        const email = document.getElementById('email-input').value.trim();
        
        console.log('💳 Processing purchase:', { phone, name, email, courseName, price });
        
        try {
            // Save purchase to server
            const pathParts = window.location.pathname.split('/');
            const storeId = pathParts[pathParts.length - 1].replace('.html', '').replace('_html', '');
            const userId = pathParts[2];
        
        const purchaseData = {
            userId,
                storeId,
                customerPhone: phone,
                customerName: name,
                customerEmail: email,
                items: [{
                    name: courseName,
                    price: parseFloat(price),
                    quantity: 1
                }],
                totalAmount: parseFloat(price),
                purchaseDate: new Date().toISOString(),
                status: 'completed'
            };
            
            const response = await fetch('/api/save-purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(purchaseData)
        });
        
        if (response.ok) {
                console.log('✅ Purchase saved to server');
                
                // Save user phone in localStorage for future identification
                localStorage.setItem('userPhone', phone);
                localStorage.setItem('userName', name);
                
                // Mark course as purchased (by phone number)
                localStorage.setItem(`course_purchased_${storeId}_${phone}`, 'true');
                
                // Close modal
                modal.remove();
                
                // Unlock videos
                if (typeof window.unlockCourseVideos === 'function') {
                    window.unlockCourseVideos();
                } else if (typeof unlockAllVideos === 'function') {
            unlockAllVideos();
                }
                
                // Show success and open WhatsApp
                alert('🎉 רכישה נשמרה! עכשיו נפתח WhatsApp לסיום התשלום.');
                
                // Open WhatsApp with purchase details
                const whatsappPhone = document.querySelector('[href*="wa.me"]')?.href.match(/\d{10,}/)?.[0] || '972504443333';
                const message = `שלום! אני ${name}\n\nאני מעוניין לרכוש: ${courseName}\n\nמחיר: ₪${price}\n\nפרטי ליצירת קשר:\n📱 ${phone}\n📧 ${email}`;
                const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
                
                window.open(whatsappUrl, '_blank');
                
                console.log('✅ Course purchase completed');
        } else {
                throw new Error('Failed to save purchase');
        }
    } catch (error) {
            console.error('❌ Error saving purchase:', error);
            alert('שגיאה בשמירת הרכישה. אנא נסה שנית.');
    }
    });
};

// Unlock all videos
function unlockAllVideos() {
    console.log('🔓 Unlocking all videos...');
    
    const videoCards = document.querySelectorAll('.video-card, [data-video-id]');
    
    videoCards.forEach(card => {
        card.classList.remove('locked');
        card.classList.add('unlocked');
        
        // Remove lock overlay
        const lockOverlay = card.querySelector('.lock-overlay');
        if (lockOverlay) {
            lockOverlay.remove();
        }
        
        // Make clickable
        card.style.cursor = 'pointer';
        card.onclick = function() {
            const youtubeUrl = this.getAttribute('data-youtube-url');
            const videoId = this.getAttribute('data-video-id');
            
            if (youtubeUrl) {
                openVideo(youtubeUrl, videoId);
            }
        };
    });
    
    console.log(`✅ Unlocked ${videoCards.length} videos`);
}

// Open video in modal
function openVideo(youtubeUrl, videoId) {
    console.log('▶️ Opening video:', videoId, youtubeUrl);
    
    // Create modal overlay
    const modal = document.createElement('div');
    modal.id = 'video-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;
    
    // Create video container
    const container = document.createElement('div');
    container.style.cssText = `
        width: 100%;
        max-width: 1200px;
        background: #000;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    `;
    
    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 20px;
        background: rgba(255, 255, 255, 0.9);
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        font-size: 24px;
        cursor: pointer;
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s;
    `;
    closeBtn.onmouseover = () => closeBtn.style.background = '#fff';
    closeBtn.onmouseout = () => closeBtn.style.background = 'rgba(255, 255, 255, 0.9)';
    closeBtn.onclick = () => modal.remove();
    
    // Extract YouTube video ID
    let embedUrl = youtubeUrl;
    if (youtubeUrl.includes('youtube.com') || youtubeUrl.includes('youtu.be')) {
        const videoIdMatch = youtubeUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        if (videoIdMatch) {
            embedUrl = `https://www.youtube.com/embed/${videoIdMatch[1]}?autoplay=1`;
        }
    }
    
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.style.cssText = `
        width: 100%;
        aspect-ratio: 16/9;
        border: none;
    `;
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    
    container.appendChild(iframe);
    modal.appendChild(closeBtn);
    modal.appendChild(container);
    
    // Close on overlay click
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
    
    document.body.appendChild(modal);
}

// Check if user has purchased (by phone number)
async function checkUserPurchase() {
    console.log('🔍 Checking if user purchased this course...');
    
    // Get user's phone from localStorage
    const userPhone = localStorage.getItem('userPhone');
    
    if (!userPhone) {
        console.log('📱 No phone number found in localStorage');
        return false;
    }
    
    // Check localStorage first (fast)
    const pathParts = window.location.pathname.split('/');
    const storeId = pathParts[pathParts.length - 1].replace('.html', '').replace('_html', '');
    const localCheck = localStorage.getItem(`course_purchased_${storeId}_${userPhone}`);
    
    if (localCheck === 'true') {
        console.log('✅ Purchase found in localStorage');
        return true;
    }
    
    // Check server (slower but more reliable)
    try {
        const userId = pathParts[2];
        const response = await fetch(`/api/check-purchase?userId=${userId}&storeId=${storeId}&phone=${userPhone}`);
        
        if (response.ok) {
            const data = await response.json();
            if (data.purchased) {
                console.log('✅ Purchase confirmed by server');
                // Save to localStorage for faster future checks
                localStorage.setItem(`course_purchased_${storeId}_${userPhone}`, 'true');
                return true;
            }
        }
    } catch (error) {
        console.error('❌ Error checking server:', error);
    }
    
    console.log('🔒 No purchase found');
    return false;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎓 Initializing course system...');
    
    // Check if user purchased
    const purchased = await checkUserPurchase();
    
    if (purchased) {
        console.log('✅ Course already purchased, unlocking videos');
        unlockAllVideos();
        
        // Show welcome message
        const userName = localStorage.getItem('userName') || 'חבר';
        const welcomeDiv = document.createElement('div');
        welcomeDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
            z-index: 9999;
            font-weight: 600;
            animation: slideDown 0.5s ease;
        `;
        welcomeDiv.textContent = `🎉 ברוך הבא ${userName}! הקורס שלך פתוח לצפייה`;
        document.body.appendChild(welcomeDiv);
        
        setTimeout(() => {
            welcomeDiv.style.transition = 'opacity 0.5s';
            welcomeDiv.style.opacity = '0';
            setTimeout(() => welcomeDiv.remove(), 500);
        }, 3000);
    } else {
        console.log('🔒 Course not purchased, videos are locked');
        
        // Add click handler to locked videos to show purchase prompt
        const videoCards = document.querySelectorAll('.video-card.locked, [data-video-id].locked');
        videoCards.forEach(card => {
            card.style.cursor = 'not-allowed';
            card.onclick = function() {
                alert('🔒 תוכן זה נעול. יש לרכוש את הקורס על מנת לצפות בשיעורים.');
            };
        });
        
        // Check if user needs to identify themselves
        const userPhone = localStorage.getItem('userPhone');
        if (!userPhone) {
            // Show identification prompt
            setTimeout(() => {
                const identify = confirm('👋 שלום! כדי לבדוק אם רכשת את הקורס, נצטרך את מספר הטלפון שלך.\n\nהאם תרצה להזדהות עכשיו?');
                if (identify) {
                    showIdentificationForm();
                }
            }, 2000);
        }
    }
    
    console.log('✅ Course system ready!');
});

// Show identification form for returning users
function showIdentificationForm() {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 16px; padding: 32px; max-width: 400px; width: 100%;">
            <h2 style="font-size: 24px; font-weight: bold; margin: 0 0 16px 0; text-align: center;">🔐 זיהוי משתמש</h2>
            <p style="color: #6B7280; text-align: center; margin-bottom: 24px;">הזן את מספר הטלפון שבו רכשת את הקורס</p>
            
            <form id="identify-form" style="display: flex; flex-direction: column; gap: 16px;">
                <input type="tel" id="identify-phone" required 
                       placeholder="050-1234567"
                       style="width: 100%; padding: 12px; border: 2px solid #E5E7EB; border-radius: 8px; font-size: 16px; box-sizing: border-box;">
                
                <div style="display: flex; gap: 12px;">
                    <button type="button" onclick="this.closest('div').parentElement.parentElement.parentElement.remove()" 
                            style="flex: 1; padding: 12px; background: #E5E7EB; color: #374151; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        ביטול
                    </button>
                    <button type="submit" 
                            style="flex: 1; padding: 12px; background: #10B981; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        אמת
                    </button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('identify-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const phone = document.getElementById('identify-phone').value.trim();
        
        localStorage.setItem('userPhone', phone);
        modal.remove();
        
        // Reload to check purchase
        location.reload();
    });
}


