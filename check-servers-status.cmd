@echo off
echo.
echo ========================================
echo   בדיקת סטטוס שרתים
echo ========================================
echo.

echo [*] בודק SvelteKit על פורט 5174...
netstat -ano | findstr ":5174" >nul
if %errorlevel% equ 0 (
    echo [✓] SvelteKit רץ על פורט 5174
) else (
    echo [✗] SvelteKit לא רץ על פורט 5174
)

echo.
echo [*] בודק Strapi על פורט 1337...
netstat -ano | findstr ":1337" >nul
if %errorlevel% equ 0 (
    echo [✓] Strapi רץ על פורט 1337
) else (
    echo [✗] Strapi לא רץ על פורט 1337
)

echo.
echo ========================================
pause
