export interface MathShaderInterface {
  compileShader(formula: string): boolean;
  renderFrame(time: number): ArrayBuffer | null;
}

// Access the global JSI object attached by C++
// @ts-ignore
const NativeMathShader = global.MathShader as MathShaderInterface | undefined;

const MathShader: MathShaderInterface = NativeMathShader || {
  compileShader: () => {
    console.warn('MathShader native module not found. compileShader is a no-op.');
    return false;
  },
  renderFrame: () => {
    console.warn('MathShader native module not found. renderFrame is a no-op.');
    return null;
  }
};

export default MathShader;
