// src/__test__/date-utils.test.ts
import {
    getYearMonth,
    getYearMonthAndNext,
    expirationDatePlusDays,
    isTodayOrWeekendBefore,
    isDueTodayOrNextWeekend,
    actualAndPreviousMonth
} from "../utils/date-utils";

describe("Date utility functions", () => {
    afterEach(() => {
        jest.useRealTimers(); // restore after each test
    });


    test("getYearMonth returns correct YYYY-MM format", () => {
        jest.useFakeTimers({ now: new Date("2025-10-15") });
        expect(getYearMonth("2025-10-17")).toBe("2025-10");
        jest.useFakeTimers({ now: new Date("2025-01-14") });
        expect(getYearMonth(new Date("2024-01-05"))).toBe("2024-01");
    });

    test("actualAndPreviousMonth returns two previous and current month", () => {
        jest.useFakeTimers({ now: new Date("2025-01-15") });
        expect(actualAndPreviousMonth()).toEqual(["2024-11", "2024-12", "2025-01"]);

        jest.useFakeTimers({ now: new Date("2025-10-17") });
        expect(actualAndPreviousMonth()).toEqual(["2025-08","2025-09", "2025-10"]);
    });

    test("getYearMonthAndNext returns current month by default", () => {
        jest.useFakeTimers({ now: new Date("2025-10-15 12:21:48.445632") });
        expect(getYearMonthAndNext()).toEqual(["2025-10"]);
    });

    test("getYearMonthAndNext returns next month if Friday before month change", () => {
        jest.useFakeTimers({ now: new Date("2025-10-31 00:00:00") });
        expect(getYearMonthAndNext()).toEqual(["2025-10", "2025-11"]);
    });

    test("expirationDatePlusDays returns true if date + days equals today", () => {
        jest.useFakeTimers({ now: new Date("2025-10-17 00:00:00") });
        expect(expirationDatePlusDays("2025-10-17 00:00:00", 0)).toBe(false);
        expect(expirationDatePlusDays("2025-10-16 00:00:00", 1)).toBe(true);
    });

    test("isTodayOrWeekendBefore works for Monday after weekend", () => {
         jest.useFakeTimers({ now: new Date("2025-10-13 00:00:00") });
        expect(isTodayOrWeekendBefore("2025-10-11 00:00:00")).toBe(true); // Saturday
        expect(isTodayOrWeekendBefore("2025-10-12 00:00:00")).toBe(true); // Sunday
        expect(isTodayOrWeekendBefore("2025-10-13 00:00:00")).toBe(true); // Today
        expect(isTodayOrWeekendBefore("2025-10-10 00:00:00")).toBe(false); // Today
    });

    test("isDueTodayOrNextWeekend works for Friday", () => {
         jest.useFakeTimers({ now: new Date("2025-10-17 00:00:00") });
        expect(isDueTodayOrNextWeekend("2025-10-18 00:00:00")).toBe(true); // Saturday
        expect(isDueTodayOrNextWeekend("2025-10-19 00:00:00")).toBe(true); // Sunday
        expect(isDueTodayOrNextWeekend("2025-10-17 00:00:00")).toBe(true); // Today
        expect(isDueTodayOrNextWeekend("2025-10-20 00:00:00")).toBe(false); // Monday
    });
});
