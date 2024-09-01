import { Config, Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  const resp = await fetch("http://azure.howardchung.net:8081/api/stats");
  const data = await resp.json();
  return new Response(data);
};
