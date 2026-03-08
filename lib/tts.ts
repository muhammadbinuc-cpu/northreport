export async function speak(text: string): Promise<void> {
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) throw new Error(`TTS API error: ${res.status}`);

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('audio/')) throw new Error('Invalid content type');

    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength < 100) throw new Error('Audio too small');

    // Use AudioContext to decode — works regardless of MIME type quirks
    const audioCtx = new AudioContext();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);

    await new Promise<void>((resolve) => {
      source.onended = () => {
        audioCtx.close().catch(() => {});
        resolve();
      };
      source.start();
      // Safety timeout
      setTimeout(() => {
        audioCtx.close().catch(() => {});
        resolve();
      }, 15000);
    });
  } catch {
    // Fallback to browser TTS
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      return new Promise<void>((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        const timeout = setTimeout(() => resolve(), 10000);
        utterance.onend = () => { clearTimeout(timeout); resolve(); };
        utterance.onerror = () => { clearTimeout(timeout); resolve(); };
        window.speechSynthesis.speak(utterance);
      });
    }
  }
}
