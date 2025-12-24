import z from "zod";

export const DateTimeTz = z.coerce.date<Date | string>();
export type DateTimeTz = Date;

export function createListSchemas<T extends z.ZodType>(
  itemSchema: T,
  options?: {
    limitMin?: number;
    limitMax?: number;
    limitDefault?: number;
  },
) {
  const { limitMin = 1, limitMax = 20, limitDefault = 20 } = options ?? {};

  const list = z.object({
    limit: z.number().int().min(limitMin).max(limitMax).default(limitDefault),
    cursor: z.string().nullable().default(null),
  });

  const listOutput = z.object({
    get items() {
      return itemSchema.array();
    },
    nextCursor: z.string().nullable().default(null),
  });

  return {
    list,
    listOutput,
  };
}
