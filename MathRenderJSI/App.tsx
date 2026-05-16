import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import {
  Canvas,
  Image,
  Skia,
  SkImage,
  AlphaType,
  ColorType,
  FilterMode,
} from '@shopify/react-native-skia';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  useAnimatedKeyboard,
} from 'react-native-reanimated';
import MathShader from './modules/math-shader';

const { width } = Dimensions.get('window');
const RENDER_SIZE = 800;

const PRESETS = {
  'Cosmic Nebula': 'sin(sqrt((x-0.5)*(x-0.5) + (y-0.5)*(y-0.5)) * 15.0 - t * 2.0)',
  'Psychedelic Mist': 'sin(x * 4.0 + sin(y * 3.0 + t)) * cos(y * 4.0 + t)',
  'Liquid Chrome': 'sin(x * 5.0 + t) * cos(y * 5.0 - t * 0.5)',
};

const DEFAULT_PRESET = PRESETS['Cosmic Nebula'];

// Bounce-on-press animated button
function AnimatedButton({ onPress, text, style, textStyle }: {
  onPress: () => void;
  text: string;
  style: object;
  textStyle: object;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.95, { damping: 12, stiffness: 200 }); }}
      onPressOut={() => { scale.value = withSpring(1.0, { damping: 12, stiffness: 200 }); }}
      onPress={onPress}
    >
      <Animated.View style={[style, animStyle]}>
        <Text style={textStyle}>{text}</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function App() {
  const [equationInput, setEquationInput] = useState(DEFAULT_PRESET);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Skia image lives in a SharedValue — never bridges to React thread
  const skImage = useSharedValue<SkImage | null>(null);

  // Persistent buffer ref — fetched once on mount
  const sharedBuffer = useRef<ArrayBuffer | null>(null);

  const errorOpacity = useSharedValue(0);

  // Keyboard-aware sliding
  const keyboard = useAnimatedKeyboard();
  const editorSlide = useAnimatedStyle(() => ({
    transform: [{ translateY: -keyboard.height.value }],
  }));

  // Ref for rAF cancellation
  const rafRef = useRef<number>(0);

  // Mount: compile default, grab persistent buffer, start JS-thread render loop
  useEffect(() => {
    MathShader.compileShader(DEFAULT_PRESET);
    sharedBuffer.current = MathShader.getPixelBuffer();

    const startTime = Date.now();

    const tick = () => {
      if (!sharedBuffer.current) return;

      const currentTime = (Date.now() - startTime) / 1000;

      // Mutates C++ pixel buffer in-place on JS thread
      MathShader.renderFrame(currentTime);

      const data = Skia.Data.fromBytes(new Uint8Array(sharedBuffer.current));
      const image = Skia.Image.MakeImage(
        {
          width: RENDER_SIZE,
          height: RENDER_SIZE,
          colorType: ColorType.RGBA_8888,
          alphaType: AlphaType.Premul,
        },
        data,
        RENDER_SIZE * 4
      );

      if (image) {
        skImage.value = image;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleApplyShader = () => {
    try {
      const success = MathShader.compileShader(equationInput);
      if (success) {
        setError(null);
        errorOpacity.value = withTiming(0, { duration: 200 });
      } else {
        setError('⚠️ Syntax Error in Formula');
        errorOpacity.value = withTiming(1, { duration: 300 });
      }
    } catch {
      setError('⚠️ Syntax Error in Formula');
      errorOpacity.value = withTiming(1, { duration: 300 });
    }
  };

  const applyPreset = (code: string) => {
    setEquationInput(code);
    try {
      const ok = MathShader.compileShader(code);
      if (ok) {
        setError(null);
        errorOpacity.value = withTiming(0);
      }
    } catch { /* keep last valid */ }
  };

  const errorStyle = useAnimatedStyle(() => ({
    opacity: errorOpacity.value,
    transform: [{ translateY: withSpring(errorOpacity.value === 1 ? 0 : -8) }],
  }));



  return (
    <SafeAreaView style={styles.root}>
      {/* Top 50% — Skia canvas */}
      <View style={styles.topContainer}>
        <Canvas style={styles.canvas}>
          <Image
            image={skImage}
            x={0}
            y={0}
            width={width}
            height={width}
            fit="cover"
            sampling={{ filter: FilterMode.Linear }}
          />
        </Canvas>
      </View>

      {/* Bottom 50% — keyboard-aware editor */}
      <Animated.View style={[styles.bottomContainer, editorSlide]}>
        <View style={styles.editorHeader}>
          <Text style={styles.title}>Math Shader Editor</Text>
        </View>

        <TextInput
          style={[styles.input, isFocused && styles.inputFocused]}
          multiline
          value={equationInput}
          onChangeText={setEquationInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Enter formula (x, y, t)..."
          placeholderTextColor="#555"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Animated.View style={[styles.errorContainer, errorStyle]}>
          <Text style={styles.errorText}>{error}</Text>
        </Animated.View>

        <AnimatedButton
          text="Apply Shader"
          style={styles.applyButton}
          textStyle={styles.applyButtonText}
          onPress={handleApplyShader}
        />

        <Text style={styles.label}>Fluid Presets</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.presetsScroll}
          contentContainerStyle={styles.presetsScrollContent}
        >
          {Object.entries(PRESETS).map(([name, code]) => (
            <AnimatedButton
              key={name}
              text={name}
              style={styles.presetButton}
              textStyle={styles.presetButtonText}
              onPress={() => applyPreset(code)}
            />
          ))}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  topContainer: {
    flex: 1,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  bottomContainer: {
    flex: 1,
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  editorHeader: {
    marginBottom: 14,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  errorContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  errorText: {
    color: '#ff4b4b',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#00ffcc',
    fontFamily: 'monospace',
    padding: 16,
    borderRadius: 12,
    fontSize: 15,
    minHeight: 90,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputFocused: {
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 4,
  },
  applyButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  applyButtonText: {
    color: '#0B0F19',
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  label: {
    color: '#777',
    marginTop: 22,
    marginBottom: 12,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.6,
  },
  presetsScroll: { flexGrow: 0 },
  presetsScrollContent: { paddingRight: 24 },
  presetButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  presetButtonText: {
    color: '#ddd',
    fontSize: 14,
    fontWeight: '600',
  },
});
