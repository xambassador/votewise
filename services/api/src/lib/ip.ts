export function parseIp(ipAddress: string | string[]) {
  let ip;
  if (Array.isArray(ipAddress)) {
    ip = ipAddress[0];
  }

  if (typeof ipAddress === "string") {
    ip = ipAddress;
  }

  return ip;
}
