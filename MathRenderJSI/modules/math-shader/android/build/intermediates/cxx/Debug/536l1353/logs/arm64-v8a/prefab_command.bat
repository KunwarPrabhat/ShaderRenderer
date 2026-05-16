@echo off
"C:\\Program Files\\Android\\Android Studio\\jbr\\bin\\java" ^
  --class-path ^
  "C:\\Users\\rkpra\\.gradle\\caches\\modules-2\\files-2.1\\com.google.prefab\\cli\\2.1.0\\aa32fec809c44fa531f01dcfb739b5b3304d3050\\cli-2.1.0-all.jar" ^
  com.google.prefab.cli.AppKt ^
  --build-system ^
  cmake ^
  --platform ^
  android ^
  --abi ^
  arm64-v8a ^
  --os-version ^
  24 ^
  --stl ^
  c++_static ^
  --ndk-version ^
  27 ^
  --output ^
  "C:\\Users\\rkpra\\AppData\\Local\\Temp\\agp-prefab-staging6712602995646551331\\staged-cli-output" ^
  "C:\\Users\\rkpra\\.gradle\\caches\\9.0.0\\transforms\\aa939ccfc4a10d6af5eda985525bd898\\transformed\\react-android-0.83.6-debug\\prefab" ^
  "C:\\Users\\rkpra\\.gradle\\caches\\9.0.0\\transforms\\83198c47a1c402754cadaa99718025d1\\transformed\\fbjni-0.7.0\\prefab"
