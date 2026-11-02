/** Evaluate a small diagnostic expression in the local Edge room tab. */
const expression = process.argv.slice(2).join(" ");
if (!expression) throw new Error("Pass a JavaScript expression");
const port = Number(process.env.STUDY_CDP_PORT || 9224);
const pages = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
const page = pages.find((item) => item.type === "page");
if (!page) throw new Error("No page target");
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id !== 1) return;
  process.stdout.write(JSON.stringify(message.result ?? message.error, null, 2) + "\n");
  socket.close();
});
socket.send(JSON.stringify({
  id: 1,
  method: "Runtime.evaluate",
  params: { expression, awaitPromise: true, returnByValue: true },
}));
