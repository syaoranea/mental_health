import { getFetchUserAttr } from "@/lib/amplify-utils/runWithAmplifyServerContext";

export async function GET(request: Request) {
  try {
    const user = await getFetchUserAttr();
    return Response.json({ user });
  } catch (_) {
    return Response.json({ user: null }, { status: 401 });
  }
}
