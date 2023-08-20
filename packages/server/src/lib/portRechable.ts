import net from "net";

async function portRechable(port: number, host = "localhost") {
  const timout = 1000;

  const promise = new Promise<{
    port: number;
    host: string;
  }>((resolve, reject) => {
    const socket = new net.Socket();

    const onError = () => {
      socket.destroy();
      reject();
    };

    socket.setTimeout(timout);
    socket.once("error", onError);
    socket.once("timeout", onError);

    socket.connect(port, host, () => {
      socket.end();
      resolve({ port, host });
    });
  });

  try {
    await promise;
    return true;
  } catch (err) {
    return false;
  }
}

export default portRechable;
