import { extractPdfText } from "../vault/nequiPdf.js";

export const MAX_EMPLOYMENT_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const MAX_DOCX_XML_BYTES = 20 * 1024 * 1024;

export async function readStreamLimited(stream, limitBytes) {
  const reader = stream.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > limitBytes) {
        await reader.cancel("uncompressed document limit exceeded");
        throw new Error("El XML DOCX descomprimido excede el límite admitido.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const output = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { output.set(chunk, offset); offset += chunk.byteLength; }
  return output;
}

async function docxText(file) {
  if (typeof DecompressionStream === "undefined") throw new Error("Este navegador no permite extraer DOCX localmente. Usa PDF, TXT o entrada manual.");
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);
  let end = -1;
  const min = Math.max(0, view.byteLength - 65557);
  for (let offset = view.byteLength - 22; offset >= min; offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50) { end = offset; break; }
  }
  if (end < 0) throw new Error("El DOCX no contiene un directorio ZIP valido.");
  const entries = view.getUint16(end + 10, true);
  let cursor = view.getUint32(end + 16, true);
  const decoder = new TextDecoder();
  for (let index = 0; index < entries; index += 1) {
    if (cursor + 46 > view.byteLength || view.getUint32(cursor, true) !== 0x02014b50) throw new Error("El DOCX contiene una entrada ZIP invalida.");
    const method = view.getUint16(cursor + 10, true);
    const size = view.getUint32(cursor + 24, true);
    const nameLength = view.getUint16(cursor + 28, true);
    const extraLength = view.getUint16(cursor + 30, true);
    const commentLength = view.getUint16(cursor + 32, true);
    const localOffset = view.getUint32(cursor + 42, true);
    const name = decoder.decode(new Uint8Array(buffer, cursor + 46, nameLength));
    if (name === "word/document.xml") {
      if (localOffset + 30 > view.byteLength || view.getUint32(localOffset, true) !== 0x04034b50) throw new Error("El DOCX contiene un encabezado de archivo invalido.");
      const localNameLength = view.getUint16(localOffset + 26, true);
      const localExtraLength = view.getUint16(localOffset + 28, true);
      const contentStart = localOffset + 30 + localNameLength + localExtraLength;
      if (contentStart + size > view.byteLength || size > MAX_EMPLOYMENT_DOCUMENT_BYTES) throw new Error("El contenido principal DOCX excede el limite admitido.");
      const compressed = new Uint8Array(buffer, contentStart, size);
      let xmlBytes;
      if (method === 0) xmlBytes = compressed;
      else if (method === 8) xmlBytes = await readStreamLimited(new Blob([compressed]).stream().pipeThrough(new DecompressionStream("deflate-raw")), MAX_DOCX_XML_BYTES);
      else throw new Error("El metodo de compresion DOCX no esta soportado.");
      if (xmlBytes.byteLength > MAX_DOCX_XML_BYTES) throw new Error("El XML DOCX descomprimido excede el límite admitido.");
      const xml = new DOMParser().parseFromString(decoder.decode(xmlBytes), "application/xml");
      if (xml.querySelector("parsererror")) throw new Error("No se pudo leer el XML del DOCX.");
      return [...xml.getElementsByTagName("w:p")].map((paragraph) => [...paragraph.getElementsByTagName("w:t")].map((node) => node.textContent || "").join("")).filter(Boolean).join("\n");
    }
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  throw new Error("El DOCX no contiene el texto principal del contrato.");
}

export async function extractEmploymentDocument(file) {
  if (!file || file.size <= 0 || file.size > MAX_EMPLOYMENT_DOCUMENT_BYTES) throw new Error("Selecciona un archivo de hasta 10 MiB.");
  const extension = String(file.name || "").split(".").pop().toLowerCase();
  let text;
  if (extension === "txt") text = await file.text();
  else if (extension === "pdf") text = await extractPdfText(file, { maxPages: 50 });
  else if (extension === "docx") text = await docxText(file);
  else throw new Error("Formato no compatible. Usa PDF, DOCX o TXT.");
  if (!String(text).trim()) throw new Error("No se detecto texto. Los PDF escaneados requieren OCR local, que no esta habilitado.");
  return String(text).replace(/\u0000/g, "").slice(0, 1_000_000);
}

const field = (text, expressions) => {
  for (const expression of expressions) {
    const match = text.match(expression);
    if (match?.[1]) return { value: match[1].trim(), confidence: 0.75, source: { line: text.slice(0, match.index).split(/\r?\n/).length } };
  }
  return { value: "", confidence: 0, source: null };
};

export function extractContractFields(text) {
  const source = String(text || "").slice(0, 1_000_000);
  const employee = field(source, [/(?:trabajador|empleado|nombre del empleado)\s*[:\-]\s*([^\n,;]{3,100})/i]);
  const allowance = field(source, [/(?:auxilio de transporte|subsidio de transporte)[^\d$]{0,40}\$?\s*([\d.,]+)/i]);
  const hours = field(source, [/(?:horas semanales|jornada semanal)[^\d]{0,20}(\d{1,3})\s*(?:horas|hrs?)/i]);
  const frequencyMatch = source.match(/(?:frecuencia|periodicidad|pago)\s*(?:de pago)?\s*[:\-]?\s*(semanal|quincenal|mensual)/i);
  const frequency = frequencyMatch ? { value: ({ semanal: "weekly", quincenal: "biweekly", mensual: "monthly" })[frequencyMatch[1].toLocaleLowerCase("es-CO")], confidence: 0.65, source: { line: source.slice(0, frequencyMatch.index).split(/\r?\n/).length } } : { value: "", confidence: 0, source: null };
  const salary = field(source, [/(?:salario\s+(?:basico|b[aá]sico|mensual)|remuneraci[oó]n)[^\d$]{0,40}\$?\s*([\d.,]+)/i]);
  const employer = field(source, [/(?:empleador|empresa)\s*[:\-]\s*([^\n,;]{3,100})/i]);
  const start = field(source, [/(?:inicio|iniciaci[oó]n|desde|fecha de ingreso)[^\d]{0,30}(\d{4}-\d{2}-\d{2}|\d{1,2}[/-]\d{1,2}[/-]\d{4})/i]);
  const matchType = source.match(/t[eé]rmino\s+indefinido/i);
  const contractType = matchType ? { value: "indefinite", confidence: 0.85, source: { line: source.slice(0, matchType.index).split(/\r?\n/).length } } : { value: "", confidence: 0, source: null };
  return Object.fromEntries(Object.entries({ employeeName: employee, salaryCOP: salary, transportAllowanceCOP: allowance, employerName: employer, startDate: start, payFrequency: frequency, weeklyHours: hours, contractType }).map(([key, item]) => [key, { ...item, confirmed: false, validationStatus: item.value ? "needs-user-review" : "missing" }]));
}

export function extractPayslipFields(text) {
  const source = String(text || "").slice(0, 1_000_000);
  const amount = (expression) => {
    const match = source.match(expression);
    return match?.[1]
      ? { value: match[1].trim(), confidence: 0.7, source: { line: source.slice(0, match.index).split(/\r?\n/).length }, confirmed: false, validationStatus: "needs-user-review" }
      : { value: "", confidence: 0, source: null, confirmed: false, validationStatus: "missing" };
  };
  const periodMatch = source.match(/(?:periodo|per[iÃ­]odo)\s*(?:liquidado)?\s*[:\-]?\s*(\d{4}-\d{2}-\d{2}|\d{1,2}[/-]\d{1,2}[/-]\d{4})\s+(?:a|al|hasta)\s+(\d{4}-\d{2}-\d{2}|\d{1,2}[/-]\d{1,2}[/-]\d{4})/i);
  const period = periodMatch
    ? { value: `${periodMatch[1]} a ${periodMatch[2]}`, confidence: 0.65, source: { line: source.slice(0, periodMatch.index).split(/\r?\n/).length }, confirmed: false, validationStatus: "needs-user-review" }
    : { value: "", confidence: 0, source: null, confirmed: false, validationStatus: "missing" };
  return {
    grossCOP: amount(/(?:total\s+devengado|devengado\s+total|total\s+ingresos)[^\d$]{0,40}\$?\s*([\d.,]+)/i),
    deductionsCOP: amount(/(?:total\s+deducciones|deducciones\s+totales|descuentos\s+totales)[^\d$]{0,40}\$?\s*([\d.,]+)/i),
    netCOP: amount(/(?:neto\s+a\s+pagar|total\s+a\s+pagar|neto\s+pagado)[^\d$]{0,40}\$?\s*([\d.,]+)/i),
    period,
  };
}
