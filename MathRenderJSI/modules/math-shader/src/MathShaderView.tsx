import { requireNativeView } from 'expo';
import * as React from 'react';

import { MathShaderViewProps } from './MathShader.types';

const NativeView: React.ComponentType<MathShaderViewProps> =
  requireNativeView('MathShader');

export default function MathShaderView(props: MathShaderViewProps) {
  return <NativeView {...props} />;
}
