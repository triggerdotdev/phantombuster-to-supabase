import { secureString, Trigger, webhookEvent } from "@trigger.dev/sdk";
import { PayloadSchema, ResultsSchema } from "./schemas";

new Trigger({
  id: "phantombuster-to-supabase",
  name: "Phantombuster to Supabase",
  on: webhookEvent({
    service: "phantombuster", // this is the service name
    eventName: "newData", // this is arbitrary, you can name it whatever you want
    schema: PayloadSchema, // this is the schema for the event payload
  }),
  run: async (event, ctx) => {
    // Sometimes Phantombuster will send an empty resultObject
    if (!event.resultObject) {
      return;
    }
    // The resultObject is a stringified JSON array of results
    const results = ResultsSchema.parse(JSON.parse(event.resultObject));

    await ctx.logger.info(`Received ${results.length} results`);

    // Set your Supabase URL to the full path to the table, e.g. https://<project id>.supabase.co/rest/v1/github_stargazers
    if (!process.env.SUPABASE_URL) {
      throw new Error("Missing SUPABASE_URL environment variable");
    }

    // This is the service role API key for your project
    if (!process.env.SUPABASE_API_KEY) {
      throw new Error("Missing SUPABASE_API_KEY environment variable");
    }

    for (const result of results) {
      const response = await ctx.fetch(
        `upsert ${result.name}`,
        process.env.SUPABASE_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Prefer: "resolution=merge-duplicates",
            Authorization: secureString`Bearer ${process.env.SUPABASE_API_KEY}`,
            apikey: secureString`${process.env.SUPABASE_API_KEY}`,
          },
          body: {
            name: result.name,
            profileUrl: result.profileUrl,
            profileImage: result.profileImage,
          },
        }
      );

      if (response.status === 409) {
        await ctx.logger.info(`${result.name} is a duplicate, skipping`);
      }
    }
  },
}).listen();
