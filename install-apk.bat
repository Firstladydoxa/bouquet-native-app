@echo off
echo Installing TNI Bouquet Apps Development Build...
echo.
echo Make sure your Android device is connected via USB and has USB Debugging enabled.
echo.
pause

echo Checking if device is connected...
adb devices

echo.
echo Installing APK...
adb install -r "tni-bouquetapps-development.apk"

echo.
echo Installation complete! You can now launch the app on your device.
pause