import * as React from 'react';

import { MathShaderViewProps } from './MathShader.types';

export default function MathShaderView(props: MathShaderViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
