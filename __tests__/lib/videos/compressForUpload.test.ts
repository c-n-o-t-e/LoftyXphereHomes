import {
    resolveCompressToolTargetBytes,
    VIDEO_COMPRESS_TOOL_UPLOAD_CAP_BYTES,
} from '@/lib/videos/constants'

describe('resolveCompressToolTargetBytes', () => {
    const mb = (n: number) => n * 1024 * 1024

    it('targets ~4 MB for short hero-style clips', () => {
        expect(
            resolveCompressToolTargetBytes({ durationSec: 8, hasAudio: true }),
        ).toBe(4 * mb(1))
    })

    it('targets ~6 MB for medium clips', () => {
        expect(
            resolveCompressToolTargetBytes({ durationSec: 30, hasAudio: true }),
        ).toBe(6 * mb(1))
    })

    it('targets ~10 MB for long tours with audio', () => {
        const target = resolveCompressToolTargetBytes({
            durationSec: 100,
            hasAudio: true,
        })
        expect(target).toBeGreaterThanOrEqual(8 * mb(1))
        expect(target).toBeLessThanOrEqual(12 * mb(1))
    })

    it('never exceeds the upload cap', () => {
        expect(
            resolveCompressToolTargetBytes({ durationSec: 100, hasAudio: true }),
        ).toBeLessThanOrEqual(VIDEO_COMPRESS_TOOL_UPLOAD_CAP_BYTES)
    })
})
