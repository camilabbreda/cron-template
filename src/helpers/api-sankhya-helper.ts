/**
     * Helper: Returns SQL condition for Monday lookback logic
     * If today is Monday, checks today + Saturday + Sunday before
     * Otherwise checks only today
     */
    export default function getMondayLookbackCondition(dateField: string): string {
        return `(
            (DATENAME(WEEKDAY, GETDATE()) = 'Segunda-Feira' AND (
                CAST(${dateField} AS DATE) = CAST(GETDATE() AS DATE) OR
                CAST(${dateField} AS DATE) = CAST(DATEADD(DAY, -2, GETDATE()) AS DATE) OR
                CAST(${dateField} AS DATE) = CAST(DATEADD(DAY, -1, GETDATE()) AS DATE)
            ))
            OR
            (DATENAME(WEEKDAY, GETDATE()) <> 'Segunda-Feira' AND CAST(${dateField} AS DATE) = CAST(GETDATE() AS DATE))
        )`
    }

    /**
     * Helper: Returns SQL condition for Friday lookahead logic
     * If today is Friday, checks today + Saturday + Sunday after
     * Otherwise checks only today
     */
    export function getFridayLookaheadCondition(dateField: string): string {
        return `(
            (DATENAME(WEEKDAY, GETDATE()) = 'Sexta-Feira' AND (
                CAST(${dateField} AS DATE) = CAST(GETDATE() AS DATE) OR
                CAST(${dateField} AS DATE) = CAST(DATEADD(DAY, 1, GETDATE()) AS DATE) OR
                CAST(${dateField} AS DATE) = CAST(DATEADD(DAY, 2, GETDATE()) AS DATE)
            ))
            OR
            (DATENAME(WEEKDAY, GETDATE()) <> 'Sexta-Feira' AND CAST(${dateField} AS DATE) = CAST(GETDATE() AS DATE))
        )`
    }

    /**
     * Helper: Returns SQL condition for Monday lookback logic using DATEDIFF
     * If today is Monday, checks if diff is exactly 60 on today, Saturday, or Sunday before
     * Otherwise checks only if diff is exactly 60 today
     */
    export function getMondayLookbackDatediffCondition(fromDateField: string, daysValue: number): string {
        return `(
            (DATENAME(WEEKDAY, GETDATE()) = 'Segunda-Feira' AND (
                DATEDIFF(DAY, CAST(${fromDateField} AS DATE), CAST(GETDATE() AS DATE)) = ${daysValue} OR
                DATEDIFF(DAY, CAST(${fromDateField} AS DATE), CAST(DATEADD(DAY, -2, GETDATE()) AS DATE)) = ${daysValue} OR
                DATEDIFF(DAY, CAST(${fromDateField} AS DATE), CAST(DATEADD(DAY, -1, GETDATE()) AS DATE)) = ${daysValue}
            ))
            OR
            (DATENAME(WEEKDAY, GETDATE()) <> 'Segunda-Feira' AND DATEDIFF(DAY, CAST(${fromDateField} AS DATE), CAST(GETDATE() AS DATE)) = ${daysValue})
        )`
    }

    /**
     * Helper: Returns SQL condition for Friday lookahead logic using DATEDIFF
     * If today is Friday, checks if diff would be exactly the value on today, Saturday, or Sunday
     * Otherwise checks only if diff is exactly the value today
     */
    export function getFridayLookaheadDatediffCondition(fromDateField: string, daysValue: number): string {
        return `(
            (DATENAME(WEEKDAY, GETDATE()) = 'Sexta-Feira' AND (
                DATEDIFF(DAY, CAST(${fromDateField} AS DATE), CAST(GETDATE() AS DATE)) = ${daysValue} OR
                DATEDIFF(DAY, CAST(${fromDateField} AS DATE), CAST(DATEADD(DAY, 1, GETDATE()) AS DATE)) = ${daysValue} OR
                DATEDIFF(DAY, CAST(${fromDateField} AS DATE), CAST(DATEADD(DAY, 2, GETDATE()) AS DATE)) = ${daysValue}
            ))
            OR
            (DATENAME(WEEKDAY, GETDATE()) <> 'Sexta-Feira' AND DATEDIFF(DAY, CAST(${fromDateField} AS DATE), CAST(GETDATE() AS DATE)) = ${daysValue})
        )`
    }