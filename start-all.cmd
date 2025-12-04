@echo off
echo Starting Strapi Backend...
start cmd /k "cd strapi-backend && npm run develop"

timeout /t 5

echo Starting SvelteKit Frontend...
start cmd /k "cd new-app && npm run dev"

echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo Strapi: http://localhost:1337
echo SvelteKit: http://localhost:3000
echo ========================================
echo Press any key to exit this window...
pause > nul
