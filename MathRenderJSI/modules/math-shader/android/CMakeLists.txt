cmake_minimum_required(VERSION 3.22.1)
project(math-shader)

# 1. Locate the native headers exposed by the React Native Android Gradle plugin
find_package(ReactAndroid REQUIRED)
find_package(fbjni REQUIRED)

# 2. Define our shared library compilation target
add_library(math-shader SHARED
        ../cpp/MathShaderModule.cpp
        ../cpp/tinyexpr.c
)

# 3. Set include paths for our custom C++ code
target_include_directories(math-shader PRIVATE
        ../cpp
)

# 4. Link against React Native's JSI library, fbjni, and the Android logging system
target_link_libraries(math-shader
        ReactAndroid::jsi
        fbjni::fbjni
        log
)
