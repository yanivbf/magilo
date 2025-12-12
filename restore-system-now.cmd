@echo off
echo 🔄 מחזיר את המערכת למצב יציב...

echo 🛑 עוצר שרתים...
taskkill /f /im node.exe 2>nul

echo 🧹 מנקה cache...
cd new-app
if exist node_modules rmdir /s /q node_modules
if exist .svelte-kit rmdir /s /q .svelte-kit
npm install

cd ..\strapi-backend
if exist node_modules rmdir /s /q node_modules
npm install

echo 🚀 מתחיל שרתים...
start "Strapi" cmd /k "cd strapi-backend && npm run develop"
timeout /t 10
start "SvelteKit" cmd /k "cd new-app && npm run dev"

echo ✅ המערכת הוחזרה למצב יציב!
echo 📱 פתח: http://localhost:5173
pause