let enginePromise;

export async function loadGoFinancialEngine() {
  if (enginePromise) return enginePromise;

  enginePromise = (async () => {
    if (globalThis.FinancialEngine?.calculate) return globalThis.FinancialEngine;

    if (!globalThis.Go) {
      await loadScript("/wasm/wasm_exec.js");
    }

    const response = await fetch("/wasm/financial-engine.wasm");
    if (!response.ok) throw new Error("Financial engine WASM is unavailable.");
    const bytes = await response.arrayBuffer();

    const go = new globalThis.Go();
    const result = await WebAssembly.instantiate(bytes, go.importObject);
    go.run(result.instance);
    return globalThis.FinancialEngine;
  })();

  try {
    return await enginePromise;
  } catch (error) {
    enginePromise = undefined;
    throw error;
  }
}

export async function calculateWithGoEngine(request) {
  const engine = await loadGoFinancialEngine();
  const result = engine?.calculate?.(JSON.stringify(request));
  const parsed = typeof result === "string" ? JSON.parse(result) : result;
  if (!parsed || parsed.error) {
    throw new Error(parsed?.error || "Financial engine calculation failed.");
  }
  return parsed;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Unable to load ${src}`));
    document.head.appendChild(script);
  });
}
