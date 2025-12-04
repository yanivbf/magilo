# תוכנית פשוטה לתיקון החנות

## הבעיה
המוצרים לא מוצגים בדף הסופי למרות שהם נשמרים ב-Strapi.

## הפתרון הפשוט
במקום להזריק JavaScript, ניצור את ה-HTML של המוצרים ישירות בשרת.

## שלבים:

### 1. ניצור פונקציה שמייצרת HTML של מוצרים
```javascript
function generateProductsHTML(products) {
  return products.map(product => `
    <div class="product-card bg-white rounded-2xl overflow-hidden shadow-lg">
      <img src="${product.image}" alt="${product.name}" class="w-full h-64 object-cover">
      <div class="p-6">
        <h3 class="text-xl font-bold mb-2">${product.name}</h3>
        <p class="text-gray-600 text-sm mb-4">${product.description}</p>
        <div class="flex justify-between items-center">
          <span class="text-3xl font-bold text-purple-600">₪${product.price}</span>
          <button onclick="addToCart(${product.id})" class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full">
            הוסף לעגלה
          </button>
        </div>
      </div>
    </div>
  `).join('');
}
```

### 2. נזריק את ה-HTML במקום JavaScript
במקום:
```javascript
const products = [...];
```

נשים:
```html
<div id="products-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  <!-- PRODUCTS_HTML -->
</div>
```

### 3. נחליף את ה-placeholder
```javascript
html = html.replace('<!-- PRODUCTS_HTML -->', generateProductsHTML(products));
```

## יתרונות
- ✅ פשוט
- ✅ עובד תמיד
- ✅ אין תלות ב-JavaScript
- ✅ SEO friendly
