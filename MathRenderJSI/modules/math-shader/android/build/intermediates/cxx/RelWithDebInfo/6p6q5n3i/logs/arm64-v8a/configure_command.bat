@echo off
"C:\\Users\\rkpra\\AppData\\Local\\Android\\Sdk\\cmake\\3.22.1\\bin\\cmake.exe" ^
  "-HE:\\projects\\ShaderRenderer\\MathRenderJSI\\modules\\math-shader\\android" ^
  "-DCMAKE_SYSTEM_NAME=Android" ^
  "-DCMAKE_EXPORT_COMPILE_COMMANDS=ON" ^
  "-DCMAKE_SYSTEM_VERSION=24" ^
  "-DANDROID_PLATFORM=android-24" ^
  "-DANDROID_ABI=arm64-v8a" ^
  "-DCMAKE_ANDROID_ARCH_ABI=arm64-v8a" ^
  "-DANDROID_NDK=C:\\Users\\rkpra\\AppData\\Local\\Android\\Sdk\\ndk\\27.0.12077973" ^
  "-DCMAKE_ANDROID_NDK=C:\\Users\\rkpra\\AppData\\Local\\Android\\Sdk\\ndk\\27.0.12077973" ^
  "-DCMAKE_TOOLCHAIN_FILE=C:\\Users\\rkpra\\AppData\\Local\\Android\\Sdk\\ndk\\27.0.12077973\\build\\cmake\\android.toolchain.cmake" ^
  "-DCMAKE_MAKE_PROGRAM=C:\\Users\\rkpra\\AppData\\Local\\Android\\Sdk\\cmake\\3.22.1\\bin\\ninja.exe" ^
  "-DCMAKE_CXX_FLAGS=-O2 -frtti -fexceptions -Wall -fstack-protector-all" ^
  "-DCMAKE_LIBRARY_OUTPUT_DIRECTORY=E:\\projects\\ShaderRenderer\\MathRenderJSI\\modules\\math-shader\\android\\build\\intermediates\\cxx\\RelWithDebInfo\\6p6q5n3i\\obj\\arm64-v8a" ^
  "-DCMAKE_RUNTIME_OUTPUT_DIRECTORY=E:\\projects\\ShaderRenderer\\MathRenderJSI\\modules\\math-shader\\android\\build\\intermediates\\cxx\\RelWithDebInfo\\6p6q5n3i\\obj\\arm64-v8a" ^
  "-DCMAKE_BUILD_TYPE=RelWithDebInfo" ^
  "-DCMAKE_FIND_ROOT_PATH=E:\\projects\\ShaderRenderer\\MathRenderJSI\\modules\\math-shader\\android\\.cxx\\RelWithDebInfo\\6p6q5n3i\\prefab\\arm64-v8a\\prefab" ^
  "-BE:\\projects\\ShaderRenderer\\MathRenderJSI\\modules\\math-shader\\android\\.cxx\\RelWithDebInfo\\6p6q5n3i\\arm64-v8a" ^
  -GNinja ^
  "-DANDROID_STL=c++_shared"
