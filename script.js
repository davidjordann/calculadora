const $ = (id) => document.getElementById(id);

/***********************
 * LÓGICA CALCULADORA
 ***********************/
let expr = "0";
const calcExpr = $("calcExpr");
const calcResult = $("calcResult");
const historyList = $("historyList");

function updateScreen() {
  calcExpr.textContent = expr.replace(/\*/g, "×").replace(/\//g, "÷");
  try {
    const res = eval(expr.replace(/%/g, "/100"));
    calcResult.textContent = Number.isFinite(res) ? res : "0";
  } catch { calcResult.textContent = "..."; }
}

function appendKey(k) {
  if (k === "C") expr = "0";
  else if (k === "⌫") expr = expr.length <= 1 ? "0" : expr.slice(0, -1);
  else if (k === "=") {
    try {
      let r = eval(expr);
      const li = document.createElement("li");
      li.innerHTML = `<span>${expr} = ${r}</span>`;
      historyList.prepend(li);
      expr = String(r);
    } catch { expr = "0"; }
  } else {
    if (expr === "0" && !"+-*/%.".includes(k)) expr = k;
    else expr += k;
  }
  updateScreen();
}

document.querySelectorAll("[data-key]").forEach(b => {
  b.onclick = () => appendKey(b.dataset.key);
});

/***********************
 * LÓGICA CODIFICADOR (REGLAS DE NEGOCIO)
 ***********************/
const SECRET_CODE = "313675@";
const ALPHA_MAP = {
  a:"x", b:"r", c:"m", d:"q", e:"t", f:"z", g:"p", h:"k", i:"n", j:"s",
  k:"d", l:"v", m:"c", n:"f", o:"h", p:"j", q:"l", r:"a", s:"e", t:"i",
  u:"o", v:"u", w:"y", x:"g", y:"b", z:"w"
};
const INV_MAP = Object.fromEntries(Object.entries(ALPHA_MAP).map(([k, v]) => [v, k]));

// Ciclo numérico: n + 7 (1..9)
const shiftNum = (n) => {
  let d = parseInt(n);
  return d >= 1 && d <= 9 ? ((d + 7 - 1) % 9) + 1 : n;
};

// Inversa: n - 7 (es igual a +2 en ciclo 1..9)
const unshiftNum = (n) => {
  let d = parseInt(n);
  return d >= 1 && d <= 9 ? ((d + 2 - 1) % 9) + 1 : n;
};

function encode(text) {
  let res = "";
  for (let char of text) {
    if (/[a-z]/.test(char)) res += ALPHA_MAP[char] || char;
    else if (/[A-Z]/.test(char)) {
      let m = ALPHA_MAP[char.toLowerCase()] || char.toLowerCase();
      res += m + m; // Mayúscula = doble letra
    } else if (/[1-9]/.test(char)) res += shiftNum(char);
    else res += char;
  }
  return res;
}

function decode(text) {
  let res = "";
  for (let i = 0; i < text.length; i++) {
    let c1 = text[i], c2 = text[i+1];
    if (c2 && c1 === c2 && INV_MAP[c1]) {
      res += INV_MAP[c1].toUpperCase();
      i++;
    } else if (INV_MAP[c1]) res += INV_MAP[c1];
    else if (/[1-9]/.test(c1)) res += unshiftNum(c1);
    else res += c1;
  }
  return res;
}

// Interfaz del Panel
$("btnOtherVersion").onclick = () => $("otherPanel").classList.remove("hidden");
$("btnClosePanel").onclick = () => $("otherPanel").classList.add("hidden");

// Teclado de Clave
document.querySelectorAll(".keypadKey").forEach(b => {
  b.onclick = () => $("secretKey").value += b.dataset.k;
});
$("btnKeyBack").onclick = () => $("secretKey").value = $("secretKey").value.slice(0,-1);
$("btnKeyClear").onclick = () => $("secretKey").value = "";

$("btnValidate").onclick = () => {
  if ($("secretKey").value === SECRET_CODE) {
    $("vault").classList.remove("hidden");
    $("vaultStatus").textContent = "✅ Acceso Concedido";
    $("vaultStatus").className = "status unlocked";
  } else {
    alert("ingrese bien los numeros");
  }
};

// Acciones finales
$("btnEncode").onclick = () => $("outputText").value = encode($("inputText").value);
$("btnDecode").onclick = () => $("outputText").value = decode($("inputText").value);
$("btnClear").onclick = () => { $("inputText").value = ""; $("outputText").value = ""; };
$("btnCopy").onclick = () => {
  navigator.clipboard.writeText($("outputText").value);
  $("btnCopy").textContent = "¡Copiado!";
  setTimeout(() => $("btnCopy").textContent = "Copiar", 2000);
};

// Inicializar mapa preview
$("mapPreview").textContent = Object.entries(ALPHA_MAP).map(([k,v]) => `${k}→${v}`).join("  ");
updateScreen();