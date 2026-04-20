/**
 * Normaliza telefone para apenas dígitos.
 * Aceita formatos como "(11) 99999-0000", "+55 11 99999-0000" → "5511999990000".
 */
export function normalizeTelefone(input: string): string {
  return (input || "").replace(/\D/g, "");
}

/**
 * Formata para exibição BR: "(11) 99999-0000" ou "+55 (11) 99999-0000".
 */
export function formatTelefoneBR(input: string): string {
  const d = normalizeTelefone(input);
  if (d.length === 13 && d.startsWith("55")) {
    // 55 11 9XXXX XXXX
    return `+55 (${d.slice(2, 4)}) ${d.slice(4, 9)}-${d.slice(9)}`;
  }
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return input;
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDateTimeBR(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function formatTimeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}
