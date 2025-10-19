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

// Purchase course function
window.purchaseCourse = async function() {
    console.log('💳 Starting course purchase...');
    
    // Get course details
    const courseTitle = document.querySelector('h1')?.textContent || 'קורס';
    const priceElement = document.querySelector('[data-price], .price, .course-price');
    const price = priceElement?.textContent.match(/\d+/)?.[0] || '999';
    
    // Show purchase modal/confirmation
    const confirmed = confirm(`האם אתה בטוח שברצונך לרכוש את "${courseTitle}" ב-₪${price}?`);
    
    if (!confirmed) {
        console.log('❌ Purchase cancelled by user');
        return;
    }
    
    // In production, this would process payment via payment gateway
    // For now, we'll simulate successful purchase
    
    try {
        // Save purchase to backend
        const userId = localStorage.getItem('userId') || 'guest';
        
        const purchaseData = {
            userId,
            courseId,
            courseName: courseTitle,
            price: parseInt(price),
            paymentMethod: 'credit_card',
            purchaseDate: new Date().toISOString()
        };
        
        const response = await fetch('/api/purchase-course', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(purchaseData)
        });
        
        if (response.ok) {
            // Mark course as purchased locally
            localStorage.setItem(`course_purchased_${courseId}`, 'true');
            
            // Unlock all videos
            unlockAllVideos();
            
            // Show success message
            alert('🎉 רכישה בוצעה בהצלחה! כעת תוכל לצפות בכל שיעורי הקורס.');
            
            console.log('✅ Course purchased successfully');
        } else {
            throw new Error('Purchase failed');
        }
    } catch (error) {
        console.error('❌ Error purchasing course:', error);
        alert('אירעה שגיאה בעת הרכישה. אנא נסה שוב מאוחר יותר.');
    }
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎓 Initializing course system...');
    
    // Check if course is already purchased
    if (isCoursePurchased()) {
        console.log('✅ Course already purchased, unlocking videos');
        unlockAllVideos();
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
    }
    
    console.log('✅ Course system ready!');
});


