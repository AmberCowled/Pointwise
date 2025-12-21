import { z } from "zod";

const XP_DELTA_SCHEMA = z
  .number()
  .int("XP delta must be an integer")
  .min(1, `XP delta must be at least ${1}`)
  .max(1000000, `XP delta must be at most ${1000000}`);

const XP_VALUE_SCHEMA = z
  .number()
  .int("XP value must be an integer")
  .min(0, `XP value must be at least ${0}`)
  .max(1000000000, `XP value must be at most ${1000000000}`);

const LV_SCHEMA = z
  .number()
  .int("LV must be an integer")
  .min(1, `LV must be at least ${1}`)
  .max(100, `LV must be at most ${100}`);

const TO_NEXT_LV_SCHEMA = z
  .number()
  .int("To next LV must be an integer")
  .min(0, `To next LV must be at least ${0}`)
  .max(1000000000, `To next LV must be at most ${1000000000}`);

const NEXT_LV_AT_SCHEMA = z
  .number()
  .int("Next LV at must be an integer")
  .min(0, `Next LV at must be at least ${0}`)
  .max(1000000000, `Next LV at must be at most ${1000000000}`);

const LV_START_XP_SCHEMA = z
  .number()
  .int("LV start XP must be an integer")
  .min(0, `LV start XP must be at least ${0}`)
  .max(1000000000, `LV start XP must be at most ${1000000000}`);

const PROGRESS_SCHEMA = z
  .number()
  .int("Progress must be an integer")
  .min(0, `Progress must be at least ${0}`)
  .max(100, `Progress must be at most ${100}`);

export const XP_SCHEMA = z
  .object({
    value: XP_VALUE_SCHEMA,
    lv: LV_SCHEMA,
    toNextLv: TO_NEXT_LV_SCHEMA,
    nextLvAt: NEXT_LV_AT_SCHEMA,
    lvStartXP: LV_START_XP_SCHEMA,
    progress: PROGRESS_SCHEMA,
  })
  .refine((data) => data.value !== undefined, {
    message: "XP value must be provided",
  });

export const GetXPResponseSchema = z.object({
  xp: XP_SCHEMA,
});

export const UpdateXPRequestSchema = z
  .object({
    delta: XP_DELTA_SCHEMA.optional(),
    value: XP_VALUE_SCHEMA.optional(),
  })
  .refine((data) => data.delta !== undefined || data.value !== undefined, {
    message: "Either 'delta' or 'value' must be provided",
  });

export const UpdateXPResponseSchema = z.object({
  xp: XP_SCHEMA,
});

export type XP = z.infer<typeof XP_SCHEMA>;
export type GetXPResponse = z.infer<typeof GetXPResponseSchema>;
export type UpdateXPRequest = z.infer<typeof UpdateXPRequestSchema>;
export type UpdateXPResponse = z.infer<typeof UpdateXPResponseSchema>;
