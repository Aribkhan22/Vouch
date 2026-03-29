@echo off
echo ============================================
echo VOUCH ANDROID BUILD - JAVA 17
echo ============================================

REM Set Java 17
set JAVA_HOME=C:\Java\jdk-17.0.9+9
set PATH=%JAVA_HOME%\bin;%PATH%

echo Java: %JAVA_HOME%
%JAVA_HOME%\bin\java.exe -version

REM Change to android directory
cd /d d:\Project\CodeBase\VouchFrontend\android

echo.
echo Cleaning caches...
if exist .gradle rmdir /s /q .gradle
if exist build rmdir /s /q build

echo.
echo Starting Gradle build...
call gradlew.bat clean assembleDebug --no-daemon

if errorlevel 1 (
    echo.
    echo BUILD FAILED
    exit /b 1
) else (
    echo.
    echo ============================================
    echo BUILD SUCCEEDED!
    echo ============================================
    dir /s app\build\outputs\apk\debug\app-debug.apk
)
