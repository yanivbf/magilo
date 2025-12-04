@echo off
echo.
echo ========================================
echo   Restarting Strapi Backend
echo ========================================
echo.
echo Stopping any running Strapi instances...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Strapi*" 2>nul
timeout /t 2 /nobreak >nul
echo.
echo Starting Strapi...
cd strapi-backend
start "Strapi Backend" cmd /k "npm run develop"
echo.
echo ========================================
echo   Strapi is starting...
echo   Wait for "Server started" message
echo ========================================
echo.
pause
