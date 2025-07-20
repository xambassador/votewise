export function qs(url: string, props?: Record<string, string | number | undefined | null>) {
  const searchParams = new URLSearchParams();
  Object.entries(props || {}).forEach(([key, value]) => {
    if (value) {
      searchParams.append(key, value.toString());
    }
  });
  const qs = searchParams.toString();
  return qs ? `${url}?${qs}` : url;
}
