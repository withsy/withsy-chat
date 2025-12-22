import z from "zod";

export const DateTimeTz = z.coerce.date<Date | string>();
export type DateTimeTz = Date;
