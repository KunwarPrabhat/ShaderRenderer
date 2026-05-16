#include "MathShaderModule.h"
#include <future>
#include <algorithm>
#include <cmath>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

namespace facebook {
namespace jsi {

// Persistent buffer holder — allocated once, wraps pixelBuffer.data() forever
class PixelBufferHolder : public MutableBuffer {
public:
  PixelBufferHolder(uint8_t* data, size_t size) : data_(data), size_(size) {}
  size_t size() const override { return size_; }
  uint8_t* data() override { return data_; }
private:
  uint8_t* data_;
  size_t size_;
};

MathShaderModule::MathShaderModule() {
  pixelBuffer.resize(WIDTH * HEIGHT);
  // Allocate the holder once — JS will reuse this same ArrayBuffer every frame
  size_t bufferSize = pixelBuffer.size() * sizeof(uint32_t);
  pixelBufferHolder = std::make_shared<PixelBufferHolder>(
    (uint8_t*)pixelBuffer.data(), bufferSize
  );
}

MathShaderModule::~MathShaderModule() {
  cleanup();
}

void MathShaderModule::cleanup() {
  if (expr) { te_free(expr); expr = nullptr; }
  if (expr2) { te_free(expr2); expr2 = nullptr; }
}

void MathShaderModule::install(Runtime &runtime) {
  auto module = std::make_shared<MathShaderModule>();
  auto object = Object::createFromHostObject(runtime, module);
  runtime.global().setProperty(runtime, "MathShader", std::move(object));
}

std::vector<PropNameID> MathShaderModule::getPropertyNames(Runtime &runtime) {
  std::vector<PropNameID> names;
  names.push_back(PropNameID::forAscii(runtime, "compileShader"));
  names.push_back(PropNameID::forAscii(runtime, "renderFrame"));
  names.push_back(PropNameID::forAscii(runtime, "getPixelBuffer"));
  return names;
}

Value MathShaderModule::get(Runtime &runtime, const PropNameID &name) {
  auto nameStr = name.utf8(runtime);

  if (nameStr == "compileShader") {
    return Function::createFromHostFunction(
        runtime, name, 1,
        [this](Runtime &rt, const Value &thisVal, const Value *args, size_t count) {
          return compileShader(rt, thisVal, args, count);
        });
  }

  if (nameStr == "renderFrame") {
    return Function::createFromHostFunction(
        runtime, name, 1,
        [this](Runtime &rt, const Value &thisVal, const Value *args, size_t count) {
          return renderFrame(rt, thisVal, args, count);
        });
  }

  if (nameStr == "getPixelBuffer") {
    return Function::createFromHostFunction(
        runtime, name, 0,
        [this](Runtime &rt, const Value &thisVal, const Value *args, size_t count) {
          return getPixelBuffer(rt, thisVal, args, count);
        });
  }

  return Value::undefined();
}

Value MathShaderModule::compileShader(Runtime &runtime, const Value &thisValue, const Value *arguments, size_t count) {
  if (count < 1 || !arguments[0].isString()) {
    return Value(false);
  }

  cleanup();

  formula = arguments[0].asString(runtime).utf8(runtime);
  
  te_variable vars1[] = { {"x", &x}, {"y", &y}, {"t", &t} };
  te_variable vars2[] = { {"x", &x2}, {"y", &y2}, {"t", &t2} };

  int err1, err2;
  expr = te_compile(formula.c_str(), vars1, 3, &err1);
  expr2 = te_compile(formula.c_str(), vars2, 3, &err2);

  return Value(expr != nullptr && expr2 != nullptr);
}

// Returns the SAME ArrayBuffer every call — no allocation
Value MathShaderModule::getPixelBuffer(Runtime &runtime, const Value &thisValue, const Value *arguments, size_t count) {
  return ArrayBuffer(runtime, pixelBufferHolder);
}

// Mutates pixelBuffer in-place, returns undefined — no allocation
Value MathShaderModule::renderFrame(Runtime &runtime, const Value &thisValue, const Value *arguments, size_t count) {
  if (count > 0 && arguments[0].isNumber()) {
    double time = arguments[0].asNumber();
    t = time;
    t2 = time;
  }

  if (!expr || !expr2) {
    return Value::undefined();
  }

  auto renderPart = [this](te_expr* e, double& px_var, double& py_var, int startY, int endY) {
    for (int py = startY; py < endY; ++py) {
      py_var = (double)py / (HEIGHT - 1);
      for (int px = 0; px < WIDTH; ++px) {
        px_var = (double)px / (WIDTH - 1);
        
        // Procedural cosine palette — no color banding
        double raw_val = te_eval(e);
        uint8_t r = (uint8_t)(std::max(0.0, std::min(1.0, 0.5 + 0.5 * std::cos(3.14159 * (raw_val + 0.0)))) * 255);
        uint8_t g = (uint8_t)(std::max(0.0, std::min(1.0, 0.5 + 0.5 * std::cos(3.14159 * (raw_val + 0.33)))) * 255);
        uint8_t b = (uint8_t)(std::max(0.0, std::min(1.0, 0.5 + 0.5 * std::cos(3.14159 * (raw_val + 0.67)))) * 255);
        uint8_t a = 255;

        // RGBA in memory (little-endian Android/iOS)
        pixelBuffer[py * WIDTH + px] = (a << 24) | (b << 16) | (g << 8) | r;
      }
    }
  };

  int midY = HEIGHT / 2;
  
  auto fut1 = std::async(std::launch::async, [&]() {
    renderPart(expr, x, y, 0, midY);
  });
  
  auto fut2 = std::async(std::launch::async, [&]() {
    renderPart(expr2, x2, y2, midY, HEIGHT);
  });

  fut1.get();
  fut2.get();

  return Value::undefined(); // No allocation — buffer mutated in place
}

} // namespace jsi
} // namespace facebook

#include <jni.h>

extern "C" JNIEXPORT void JNICALL
Java_expo_modules_mathshader_MathShaderModule_nativeInstall(JNIEnv *env, jobject thiz, jlong jsiPtr) {
  auto runtime = reinterpret_cast<facebook::jsi::Runtime *>(jsiPtr);
  if (runtime) {
    facebook::jsi::MathShaderModule::install(*runtime);
  }
}
