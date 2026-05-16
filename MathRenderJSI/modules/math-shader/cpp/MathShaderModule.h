#pragma once

#include <jsi/jsi.h>
#include <vector>
#include <string>
#include <memory>
#include "tinyexpr.h"

namespace facebook {
namespace jsi {

class MathShaderModule : public HostObject {
public:
  MathShaderModule();
  ~MathShaderModule();

  // JSI boilerplate
  Value get(Runtime &runtime, const PropNameID &name) override;
  std::vector<PropNameID> getPropertyNames(Runtime &runtime) override;

  static void install(Runtime &runtime);

private:
  // Core methods
  Value compileShader(Runtime &runtime, const Value &thisValue, const Value *arguments, size_t count);
  Value renderFrame(Runtime &runtime, const Value &thisValue, const Value *arguments, size_t count);
  Value getPixelBuffer(Runtime &runtime, const Value &thisValue, const Value *arguments, size_t count);

  // Shader state
  te_expr *expr = nullptr;
  te_expr *expr2 = nullptr;
  std::string formula;
  double x = 0, y = 0, t = 0;
  double x2 = 0, y2 = 0, t2 = 0;
  
  static constexpr int WIDTH = 800;
  static constexpr int HEIGHT = 800;
  std::vector<uint32_t> pixelBuffer;

  // Persistent ArrayBuffer holder — allocated once, reused every frame
  std::shared_ptr<MutableBuffer> pixelBufferHolder;

  void cleanup();
};

} // namespace jsi
} // namespace facebook
