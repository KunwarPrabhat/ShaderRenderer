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
  c++_shared ^
  --ndk-version ^
  27 ^
  --output ^
  "C:\\Users\\rkpra\\AppData\\Local\\Temp\\agp-prefab-staging3213876120404815225\\staged-cli-output" ^
  "C:\\Users\\rkpra\\.gradle\\caches\\9.0.0\\transforms\\220ef51be82857c4646d42d3f11b952c\\transformed\\react-android-0.83.6-release\\prefab" ^
  "C:\\Users\\rkpra\\.gradle\\caches\\9.0.0\\transforms\\83198c47a1c402754cadaa99718025d1\\transformed\\fbjni-0.7.0\\prefab"
