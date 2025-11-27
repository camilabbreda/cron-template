import { tFieldMetadata } from "../types/sankhya-types";

export function mapResponseToJson<T = unknown>(fields: tFieldMetadata[], rows: unknown[][]): T[] {
    if (!rows || !fields || fields.length === 0 || rows.length === 0) {
        return [];
    }
    return rows.map(row =>
        fields.reduce((acc, f, i) => {
            acc[f.name] = row[i];
            return acc;
        }, {} as Record<string, unknown>) as T
    );
}
