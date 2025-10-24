/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError } from "axios";
import { ServiceError } from "../types/error-types";

export function handleServiceError(error: any, context: string): ServiceError {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status;
        const data = axiosError.response?.data;
        const url = axiosError.config?.url;
        const method = axiosError.config?.method;

        return {
            type: "AxiosError",
            context,
            message: axiosError.message,
            status,
            url,
            method,
            data,
        };
    }

    return {
        type: "GeneralError",
        context,
        message: error?.message as string|| "Unknown error",
        stack: error?.stack,
    };
}
