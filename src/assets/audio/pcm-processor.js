class PCMWorklet extends AudioWorkletProcessor {

    process(inputs) {

        const input = inputs[0];

        if (!input.length) {
            return true;
        }

        const samples = input[0];

        const pcm = new Int16Array(samples.length);

        for (let i = 0; i < samples.length; i++) {

            const s = Math.max(-1, Math.min(1, samples[i]));

            pcm[i] = s < 0
                ? s * 0x8000
                : s * 0x7FFF;
        }

        this.port.postMessage(pcm.buffer);

        return true;
    }
}

registerProcessor('pcm-worklet', PCMWorklet);