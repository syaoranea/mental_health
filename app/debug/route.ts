// app/api/debug/route.ts
import outputs from "@/amplify_outputs.json";

export async function GET() {
  console.log("Amplify OAuth Config:", outputs.auth?.oauth);

  return Response.json({
    oauth: outputs.auth?.oauth ?? null,
  });
}
