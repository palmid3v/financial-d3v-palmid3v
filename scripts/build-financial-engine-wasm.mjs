import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptDirectory, "..");
const frontendPublic = join(repositoryRoot, "frontend", "public", "wasm");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: "inherit",
    ...options,
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}`);
  }
  return result;
}

const goRootResult = spawnSync("go", ["env", "GOROOT"], {
  cwd: repositoryRoot,
  encoding: "utf8",
});
if (goRootResult.error || goRootResult.status !== 0) {
  throw new Error("Unable to resolve Go GOROOT. Ensure Go is installed and available on PATH.");
}

const goRoot = goRootResult.stdout.trim();
const wasmExec = join(goRoot, "lib", "wasm", "wasm_exec.js");
mkdirSync(frontendPublic, { recursive: true });
copyFileSync(wasmExec, join(frontendPublic, "wasm_exec.js"));

run("go", ["build", "-trimpath", "-o", join(frontendPublic, "financial-engine.wasm"), "./cmd/financial-engine-wasm"], {
  env: { ...process.env, GOOS: "js", GOARCH: "wasm" },
});

console.log("Financial-D3v Go engine WASM built in frontend/public/wasm");
