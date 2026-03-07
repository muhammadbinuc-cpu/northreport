export async function speak(text: string): Promise<void> {
  try {
    console.log('[TTS Client] Requesting...', text.slice(0, 60));
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    console.log('[TTS Client] Status:', res.status);

    if (!res.ok) {
      const errBody = await res.text();
      console.error('[TTS Client] Error body:', errBody);
      throw new Error(`TTS API error: ${res.status}`);
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('audio/')) {
      console.warn('[TTS Client] Invalid content type:', contentType);
      throw new Error('Invalid audio content type');
    }

    const blob = await res.blob();
    console.log('[TTS Client] Blob size:', blob.size, 'type:', blob.type);

    // Ensure the blob has the correct MIME type for audio playback
    const audioBlob = blob.type === 'audio/mpeg' ? blob : new Blob([blob], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(audioBlob);
    const audio = new Audio(url);
    await new Promise<void>((resolve, reject) => {
      const cleanup = () => {
        audio.onended = null;
        audio.onerror = null;
        audio.oncanplaythrough = null;
        URL.revokeObjectURL(url);
      };

      audio.onended = () => { cleanup(); resolve(); };

      audio.onerror = (e) => {
        console.error('[TTS Client] Audio error event:', e);
        cleanup();
        reject(new Error('Audio element error'));
      };

      audio.oncanplaythrough = () => {
        audio.play().catch((e) => {
          console.error('[TTS Client] Play error:', e.name, e.message);
          cleanup();
          reject(e);
        });
      };

      // Fallback if canplaythrough doesn't fire within timeout
      setTimeout(() => {
        if (audio.readyState >= 3) return; // already playing
        if (audio.readyState === 0) {
          // No data loaded at all - likely format issue
          console.warn('[TTS Client] No audio data loaded, falling back');
          cleanup();
          reject(new Error('Audio not supported'));
          return;
        }
        audio.play().catch((e) => {
          console.error('[TTS Client] Play timeout error:', e.name, e.message);
          cleanup();
          reject(e);
        });
      }, 2000);
    });
  } catch (err) {
    console.warn('[TTS Client] Falling back to browser TTS:', err);
    // Fallback to browser TTS
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      return new Promise<void>((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
      });
    }
  }
}

