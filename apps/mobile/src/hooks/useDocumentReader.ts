import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { setAudioModeAsync } from 'expo-audio';
import * as Speech from 'expo-speech';
import { buildDocumentSpeechText } from '@/utils/documentToPlainText';

type ReaderState = 'idle' | 'reading';

const MAX_SPEECH_CHUNK_LENGTH = 1800;

interface UseDocumentReaderOptions {
  title?: string | null;
  content: string | null;
  onDone?: () => void;
  onError?: (error: Error) => void;
}

function splitSpeechText(text: string): string[] {
  const normalizedText = text.replace(/\s+/g, ' ').trim();

  if (!normalizedText) {
    return [];
  }

  const chunks: string[] = [];
  const sentences = normalizedText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [normalizedText];
  let currentChunk = '';

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();

    if (!trimmedSentence) {
      continue;
    }

    if (trimmedSentence.length > MAX_SPEECH_CHUNK_LENGTH) {
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = '';
      }

      for (let index = 0; index < trimmedSentence.length; index += MAX_SPEECH_CHUNK_LENGTH) {
        chunks.push(trimmedSentence.slice(index, index + MAX_SPEECH_CHUNK_LENGTH));
      }

      continue;
    }

    const nextChunk = currentChunk ? `${currentChunk} ${trimmedSentence}` : trimmedSentence;

    if (nextChunk.length > MAX_SPEECH_CHUNK_LENGTH) {
      chunks.push(currentChunk);
      currentChunk = trimmedSentence;
    } else {
      currentChunk = nextChunk;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

async function prepareSpeechAudio() {
  if (Platform.OS !== 'ios') {
    return;
  }

  await setAudioModeAsync({
    playsInSilentMode: true,
  });
}

export function useDocumentReader({
  title,
  content,
  onDone,
  onError,
}: UseDocumentReaderOptions) {
  const [state, setState] = useState<ReaderState>('idle');
  const shouldStopRef = useRef(false);
  const sequenceRef = useRef(0);

  const speechText = useMemo(
    () => buildDocumentSpeechText({ title, content }),
    [title, content],
  );
  const speechChunks = useMemo(() => splitSpeechText(speechText), [speechText]);

  const canRead = speechChunks.length > 0;
  const isReading = state === 'reading';

  const stop = useCallback(() => {
    shouldStopRef.current = true;
    sequenceRef.current += 1;
    Speech.stop();
    setState('idle');
  }, []);

  const start = useCallback(async () => {
    if (!canRead) {
      return;
    }

    const sequence = sequenceRef.current + 1;
    sequenceRef.current = sequence;
    shouldStopRef.current = false;
    Speech.stop();
    setState('reading');

    try {
      await prepareSpeechAudio();
    } catch (error) {
      if (sequenceRef.current === sequence) {
        setState('idle');
        onError?.(error instanceof Error ? error : new Error('Unable to prepare audio'));
      }

      return;
    }

    const speakChunk = (chunkIndex: number) => {
      if (shouldStopRef.current || sequenceRef.current !== sequence) {
        setState('idle');
        return;
      }

      const chunk = speechChunks[chunkIndex];

      if (!chunk) {
        setState('idle');
        onDone?.();
        return;
      }

      Speech.speak(chunk, {
        onDone: () => speakChunk(chunkIndex + 1),
        onStopped: () => {
          if (sequenceRef.current === sequence) {
            setState('idle');
          }
        },
        onError: (error) => {
          if (sequenceRef.current === sequence) {
            setState('idle');
            onError?.(error instanceof Error ? error : new Error('Unknown speech error'));
          }
        },
      });
    };

    speakChunk(0);
  }, [canRead, onDone, onError, speechChunks]);

  const toggle = useCallback(() => {
    if (isReading) {
      stop();
      return;
    }

    start();
  }, [isReading, start, stop]);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  return {
    state,
    isReading,
    canRead,
    start,
    stop,
    toggle,
  };
}
