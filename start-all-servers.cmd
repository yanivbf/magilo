@echo off
echo.
echo ========================================
echo   מפעיל את כל השרתים
echo ========================================
echo.

REM Check if already running
netstat -ano | findstr ":5174" >nul
if %errorlevel% equ 0 (
    echo [!] SvelteKit כבר רץ בפורט 5174
) else (
    echo [*] מפעיל SvelteKit...
    start "SvelteKit Server" cmd /k "cd new-app && npm run dev"
    timeout /t 3 >nul
)

netstat -ano | findstr ":1337" >nul
if %errorlevel% equ 0 (
    echo [!] Strapi כבר רץ בפורט 1337
) else (
    echo [*] מפעיל Strapi...
    start "Strapi Server" cmd /k "cd strapi-backend && npm run develop"
    timeout /t 3 >nul
)

echo.
echo ========================================
echo   השרתים מופעלים!
echo ========================================
echo.
echo SvelteKit: http://localhost:5174
echo Strapi:    http://localhost:1337/admin
echo.
echo לחץ על מקש כלשהו לסגירה...
pause >nul
