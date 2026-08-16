import { splitAmenityLabelLines } from "@/lib/post-generator/amenityLabel";

describe("splitAmenityLabelLines", () => {
    it("stacks two-word labels", () => {
        expect(splitAmenityLabelLines("Starlink Internet")).toEqual([
            "STARLINK",
            "INTERNET",
        ]);
        expect(splitAmenityLabelLines("24/7 Power")).toEqual(["24/7", "POWER"]);
        expect(splitAmenityLabelLines("Swimming Pool")).toEqual([
            "SWIMMING",
            "POOL",
        ]);
        expect(splitAmenityLabelLines("Daily Cleaning")).toEqual([
            "DAILY",
            "CLEANING",
        ]);
        expect(splitAmenityLabelLines("Washing Machine")).toEqual([
            "WASHING",
            "MACHINE",
        ]);
    });

    it("keeps compound phrases readable on line one", () => {
        expect(splitAmenityLabelLines("Fully Equipped Kitchen")).toEqual([
            "FULLY EQUIPPED",
            "KITCHEN",
        ]);
        expect(splitAmenityLabelLines("Smart TV & PS5")).toEqual([
            "SMART TV",
            "& PS5",
        ]);
        expect(splitAmenityLabelLines("Gym & Fitness")).toEqual([
            "GYM &",
            "FITNESS",
        ]);
    });

    it("handles single words and empty", () => {
        expect(splitAmenityLabelLines("Pool")).toEqual(["POOL"]);
        expect(splitAmenityLabelLines("   ")).toEqual([""]);
    });
});
