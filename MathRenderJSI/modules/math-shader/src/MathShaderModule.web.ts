import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './MathShader.types';

type MathShaderModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class MathShaderModule extends NativeModule<MathShaderModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(MathShaderModule, 'MathShaderModule');
