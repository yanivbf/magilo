// Restaurant Menu Management Script
(function() {
    console.log('🍽️ Restaurant menu script loaded');
    
    // Wait for DOM to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        console.log('🔍 Restaurant menu init() called');
        
        // Check if this is a restaurant menu page
        const hasMenuItems = document.querySelector('.menu-item, [class*="menu"], [class*="dish"]');
        
        if (!hasMenuItems) {
            console.log('⚠️ Not a restaurant menu page, skipping');
            return;
        }
        
        console.log('✅ Restaurant menu page detected, initializing image upload system...');
        
        // Add image upload buttons to menu items
        addImageUploadButtons();
        
        // Add management panel
        addManagementPanel();
    }
    
    function addImageUploadButtons() {
        // Find all menu items
        const menuItems = document.querySelectorAll('.menu-item, [class*="menu"], [class*="dish"], [class*="product"]');
        
        menuItems.forEach((item, index) => {
            // Skip if already has upload button
            if (item.querySelector('.upload-image-btn')) return;
            
            // Create upload button
            const uploadBtn = document.createElement('button');
            uploadBtn.className = 'upload-image-btn';
            uploadBtn.innerHTML = '📷 הוסף תמונה';
            uploadBtn.style.cssText = `
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                margin: 8px 0;
                transition: transform 0.2s;
                box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
            `;
            
            // Add hover effect
            uploadBtn.addEventListener('mouseenter', () => {
                uploadBtn.style.transform = 'translateY(-2px)';
            });
            
            uploadBtn.addEventListener('mouseleave', () => {
                uploadBtn.style.transform = 'translateY(0)';
            });
            
            // Add click handler
            uploadBtn.addEventListener('click', () => {
                uploadImage(item, index);
            });
            
            // Insert button after the item
            item.appendChild(uploadBtn);
        });
    }
    
    function uploadImage(menuItem, index) {
        // Create file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Show loading
            const uploadBtn = menuItem.querySelector('.upload-image-btn');
            const originalText = uploadBtn.innerHTML;
            uploadBtn.innerHTML = '⏳ מעלה...';
            uploadBtn.disabled = true;
            
            try {
                // Upload to server
                const formData = new FormData();
                formData.append('image', file);
                formData.append('menuItemIndex', index);
                formData.append('userId', getUserId());
                formData.append('pageId', getPageId());
                
                const response = await fetch('/api/upload-menu-image', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    const result = await response.json();
                    
                    // Update menu item with image
                    updateMenuItemWithImage(menuItem, result.imageUrl);
                    
                    // Show success
                    uploadBtn.innerHTML = '✅ הועלה!';
                    uploadBtn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
                    
                    setTimeout(() => {
                        uploadBtn.innerHTML = originalText;
                        uploadBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                        uploadBtn.disabled = false;
                    }, 2000);
                    
                } else {
                    throw new Error('Upload failed');
                }
                
            } catch (error) {
                console.error('❌ Upload error:', error);
                uploadBtn.innerHTML = '❌ שגיאה';
                uploadBtn.style.background = 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)';
                
                setTimeout(() => {
                    uploadBtn.innerHTML = originalText;
                    uploadBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    uploadBtn.disabled = false;
                }, 2000);
            }
            
            // Clean up
            document.body.removeChild(fileInput);
        });
        
        // Trigger file selection
        document.body.appendChild(fileInput);
        fileInput.click();
    }
    
    function updateMenuItemWithImage(menuItem, imageUrl) {
        // Remove existing image if any
        const existingImg = menuItem.querySelector('.menu-item-image');
        if (existingImg) {
            existingImg.remove();
        }
        
        // Create new image
        const img = document.createElement('img');
        img.src = imageUrl;
        img.className = 'menu-item-image';
        img.style.cssText = `
            width: 100%;
            max-width: 200px;
            height: 150px;
            object-fit: cover;
            border-radius: 8px;
            margin: 10px 0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transition: transform 0.3s;
        `;
        
        // Add hover effect
        img.addEventListener('mouseenter', () => {
            img.style.transform = 'scale(1.05)';
        });
        
        img.addEventListener('mouseleave', () => {
            img.style.transform = 'scale(1)';
        });
        
        // Insert image at the beginning of the menu item
        menuItem.insertBefore(img, menuItem.firstChild);
    }
    
    function addManagementPanel() {
        // Create management panel
        const panel = document.createElement('div');
        panel.id = 'restaurant-management-panel';
        panel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border: 2px solid #667eea;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            z-index: 10000;
            max-width: 300px;
            display: none;
        `;
        
        panel.innerHTML = `
            <div style="text-align: center; margin-bottom: 20px;">
                <h3 style="color: #667eea; margin: 0;">🍽️ ניהול תפריט</h3>
                <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">העלאת תמונות למוצרים</p>
            </div>
            
            <div style="margin-bottom: 15px;">
                <button onclick="addImageToAllItems()" style="
                    width: 100%;
                    padding: 12px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: bold;
                    margin-bottom: 10px;
                ">📷 הוסף תמונות לכל המוצרים</button>
            </div>
            
            <div style="text-align: center;">
                <button onclick="closeManagementPanel()" style="
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                ">סגור</button>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Add toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.innerHTML = '🍽️ ניהול תפריט';
        toggleBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            cursor: pointer;
            font-weight: bold;
            z-index: 10001;
            box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
            transition: transform 0.2s;
        `;
        
        toggleBtn.addEventListener('mouseenter', () => {
            toggleBtn.style.transform = 'translateY(-2px)';
        });
        
        toggleBtn.addEventListener('mouseleave', () => {
            toggleBtn.style.transform = 'translateY(0)';
        });
        
        toggleBtn.addEventListener('click', () => {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        });
        
        document.body.appendChild(toggleBtn);
    }
    
    // Global functions
    window.addImageToAllItems = function() {
        const menuItems = document.querySelectorAll('.menu-item, [class*="menu"], [class*="dish"], [class*="product"]');
        menuItems.forEach((item, index) => {
            const uploadBtn = item.querySelector('.upload-image-btn');
            if (uploadBtn && !item.querySelector('.menu-item-image')) {
                uploadBtn.click();
            }
        });
    };
    
    window.closeManagementPanel = function() {
        const panel = document.getElementById('restaurant-management-panel');
        if (panel) {
            panel.style.display = 'none';
        }
    };
    
    function getUserId() {
        // Extract userId from URL
        const pathParts = window.location.pathname.split('/');
        return pathParts[2] || 'anonymous';
    }
    
    function getPageId() {
        // Extract pageId from URL
        const pathParts = window.location.pathname.split('/');
        const fileName = pathParts[pathParts.length - 1];
        return fileName.replace('.html', '').replace('_html', '');
    }
    
})();
