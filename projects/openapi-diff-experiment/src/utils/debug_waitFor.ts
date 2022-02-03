export async function waitFor(millis: number) {
  return await new Promise((resolve) => {
    setTimeout(resolve, millis);
  });
}

export function copyObject<G>(before: any): G {
  return JSON.parse(JSON.stringify(before));
}
