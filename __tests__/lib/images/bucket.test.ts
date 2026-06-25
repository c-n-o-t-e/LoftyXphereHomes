import {
    resolveBucketFileSizeLimitBytes,
    SUPABASE_STORAGE_MAX_FILE_BYTES,
} from '@/lib/images/constants'

describe('resolveBucketFileSizeLimitBytes', () => {
    const mb = (n: number) => n * 1024 * 1024

    it('uses the largest configured upload limit under the Supabase plan cap', () => {
        expect(
            resolveBucketFileSizeLimitBytes({
                apartmentImageMaxBytes: mb(10),
                heroVideoMaxBytes: mb(50),
                apartmentVideoMaxBytes: mb(50),
                supabasePlanMaxBytes: mb(50),
            }),
        ).toBe(mb(50))
    })

    it('caps bucket limit when env exceeds the Supabase free-tier max', () => {
        expect(
            resolveBucketFileSizeLimitBytes({
                apartmentImageMaxBytes: mb(10),
                heroVideoMaxBytes: mb(80),
                apartmentVideoMaxBytes: mb(80),
                supabasePlanMaxBytes: mb(50),
            }),
        ).toBe(mb(50))
    })

    it('defaults Supabase plan cap to 50 MB', () => {
        expect(SUPABASE_STORAGE_MAX_FILE_BYTES).toBe(50 * 1024 * 1024)
    })
})
