export async function parseJsonResponse(
  response: Response,
  errorMessage: string,
): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new Error(errorMessage);
  }
}
