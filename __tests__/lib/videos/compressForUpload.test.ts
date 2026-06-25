import {
    HERO_VIDEO_MAX_BYTES,
    VIDEO_COMPRESS_TOOL_TARGET_BYTES,
} from '@/lib/videos/constants'

describe('video compress tool constants', () => {
    it('targets output slightly below the upload cap', () => {
        expect(VIDEO_COMPRESS_TOOL_TARGET_BYTES).toBeLessThan(HERO_VIDEO_MAX_BYTES)
        expect(VIDEO_COMPRESS_TOOL_TARGET_BYTES).toBeGreaterThan(
            HERO_VIDEO_MAX_BYTES * 0.85,
        )
    })
})
