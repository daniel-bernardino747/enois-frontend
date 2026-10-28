// PROTÓTIPO (spike/feed-mobile-ux): sobe o backend falso e o app num comando só.
//   npm run prototype:feed  →  abra http://localhost:5199/feed?variant=A no celular (390px)
// Antes de abrir, rode no console do navegador: localStorage.setItem("session_active", "1")
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const mock = spawn(
  process.execPath,
  [fileURLToPath(new URL("./feed-mobile-mock.mjs", import.meta.url))],
  {
    stdio: "inherit",
  },
);
const app = spawn("npx", ["vite", "dev", "--port", "5199", "--strictPort"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, BACKEND_TARGET: "http://localhost:8099" },
});
const stop = () => {
  mock.kill();
  app.kill();
  process.exit();
};
process.on("SIGINT", stop);
app.on("exit", stop);
