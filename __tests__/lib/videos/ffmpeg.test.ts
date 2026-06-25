import {
    estimateVideoBitrateKbps,
    VIDEO_AUDIO_BITRATE_KBPS,
} from '@/lib/videos/ffmpeg'

describe('estimateVideoBitrateKbps', () => {
    const mb = (n: number) => n * 1024 * 1024

    it('reserves space for audio when included', () => {
        const withAudio = estimateVideoBitrateKbps({
            targetBytes: mb(50),
            durationSec: 90,
            includeAudio: true,
        });
        const withoutAudio = estimateVideoBitrateKbps({
            targetBytes: mb(50),
            durationSec: 90,
            includeAudio: false,
        });

        expect(withAudio).toBeLessThan(withoutAudio);
    });

    it('uses the configured audio bitrate constant', () => {
        expect(VIDEO_AUDIO_BITRATE_KBPS).toBe(128);
    });

    it('allows low bitrates for long clips with audio', () => {
        const kbps = estimateVideoBitrateKbps({
            targetBytes: mb(6),
            durationSec: 100,
            includeAudio: true,
        });

        expect(kbps).toBeLessThan(600);
        expect(kbps).toBeGreaterThanOrEqual(250);
    });
});
