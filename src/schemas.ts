import { z } from "zod";

const ResultSchema = z.object({
  name: z.string(),
  profileUrl: z.string(),
  profileImage: z.string(),
});

export const ResultsSchema = z.array(ResultSchema);

export const PayloadSchema = z.object({
  agentId: z.string(),
  agentName: z.string(),
  containerId: z.string(),
  script: z.string(),
  branch: z.string(),
  launchDuration: z.number(),
  runDuration: z.number(),
  exitCode: z.number(),
  exitMessage: z.enum([
    "finished",
    "killed",
    "global timeout",
    "org timeout",
    "agent timeout",
    "unknown",
  ]),
  resultObject: z.string().optional(),
});
