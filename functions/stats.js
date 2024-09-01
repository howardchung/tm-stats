export default async (req, context) => {
  const resp = await fetch("http://azure.howardchung.net:8081/api/stats");
  const data = await resp.json();
  return new Response(data);
};
