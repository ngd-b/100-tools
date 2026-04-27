"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) return NaN;
  if (n > 170) return Infinity;
  if (n <= 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

export function ScientificCalculator() {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [isNewNumber, setIsNewNumber] = useState(true);

  function inputDigit(d: string) {
    if (isNewNumber) {
      setDisplay(d);
      setIsNewNumber(false);
    } else {
      setDisplay(display === "0" ? d : display + d);
    }
  }

  function inputDecimal() {
    if (isNewNumber) {
      setDisplay("0.");
      setIsNewNumber(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  }

  function inputOperator(op: string) {
    const n = parseFloat(display);
    if (expression && !isNewNumber) {
      try {
        // eslint-disable-next-line no-new-func
        const result = new Function(`"use strict"; return (${expression}${n})`)();
        setExpression(`${result}${op}`);
        setDisplay(String(result));
      } catch {
        setExpression(`${n}${op}`);
      }
    } else {
      setExpression(`${n}${op}`);
    }
    setIsNewNumber(true);
  }

  function handleEquals() {
    if (!expression) return;
    const n = parseFloat(display);
    try {
      // eslint-disable-next-line no-new-func
      const result = new Function(`"use strict"; return (${expression}${n})`)();
      setDisplay(String(parseFloat(result.toFixed(10))));
      setExpression("");
    } catch {
      setDisplay("Error");
    }
    setIsNewNumber(true);
  }

  function clear() {
    setDisplay("0");
    setExpression("");
    setIsNewNumber(true);
  }

  function backspace() {
    if (isNewNumber || display === "Error") {
      clear();
      return;
    }
    setDisplay(display.length > 1 ? display.slice(0, -1) : "0");
  }

  function applyFunction(fn: string) {
    const n = parseFloat(display);
    let result: number;
    switch (fn) {
      case "sin": result = Math.sin(n * Math.PI / 180); break;
      case "cos": result = Math.cos(n * Math.PI / 180); break;
      case "tan": result = Math.tan(n * Math.PI / 180); break;
      case "ln": result = Math.log(n); break;
      case "log": result = Math.log10(n); break;
      case "√": result = Math.sqrt(n); break;
      case "x²": result = n * n; break;
      case "%": result = n / 100; break;
      case "±": result = -n; break;
      case "x!": result = factorial(n); break;
      default: return;
    }
    setDisplay(String(parseFloat(result.toFixed(10))));
    setIsNewNumber(true);
  }

  function inputConstant(c: string) {
    switch (c) {
      case "π": setDisplay(String(Math.PI)); break;
      case "e": setDisplay(String(Math.E)); break;
    }
    setIsNewNumber(true);
  }

  const btns = [
    { label: "sin", type: "fn" as const, fn: "sin" },
    { label: "cos", type: "fn" as const, fn: "cos" },
    { label: "tan", type: "fn" as const, fn: "tan" },
    { label: "÷", type: "op" as const, op: "/" },

    { label: "x²", type: "fn" as const, fn: "x²" },
    { label: "√", type: "fn" as const, fn: "√" },
    { label: "ln", type: "fn" as const, fn: "ln" },
    { label: "−", type: "op" as const, op: "-" },

    { label: "7", type: "digit" as const },
    { label: "8", type: "digit" as const },
    { label: "9", type: "digit" as const },
    { label: "×", type: "op" as const, op: "*" },

    { label: "4", type: "digit" as const },
    { label: "5", type: "digit" as const },
    { label: "6", type: "digit" as const },
    { label: "+", type: "op" as const },

    { label: "1", type: "digit" as const },
    { label: "2", type: "digit" as const },
    { label: "3", type: "digit" as const },
    { label: "=", type: "equals" as const },

    { label: "0", type: "digit" as const, span: 2 },
    { label: ".", type: "decimal" as const },
    { label: "C", type: "clear" as const },
  ];

  return (
    <div>
      {/* Display */}
      <div className="glass-card mb-6">
        <div className="text-right text-sm text-gray-400 font-mono h-6 overflow-hidden truncate">
          {expression || ""}
        </div>
        <div className="text-right text-3xl font-bold font-mono mt-1 overflow-hidden">
          {display}
        </div>
        <Button variant="ghost" size="sm" className="mt-2 w-full text-gray-400" onClick={backspace}>
          ← 退格
        </Button>
      </div>

      {/* Buttons Grid */}
      <div className="grid grid-cols-4 gap-2">
        {btns.map((btn, i) => {
          let variant: "default" | "secondary" | "outline" | "gradient" | "ghost" = "outline";
          if (btn.type === "equals") variant = "gradient";
          else if (btn.type === "op") variant = "secondary";
          else if (btn.type === "clear") variant = "outline";

          return (
            <Button
              key={i}
              variant={variant}
              className={btn.span === 2 ? "col-span-2" : ""}
              onClick={() => {
                if (btn.type === "digit") inputDigit(btn.label);
                else if (btn.type === "decimal") inputDecimal();
                else if (btn.type === "op") inputOperator(btn.op!);
                else if (btn.type === "equals") handleEquals();
                else if (btn.type === "clear") clear();
                else if (btn.type === "fn") applyFunction(btn.fn!);
              }}
            >
              {btn.label}
            </Button>
          );
        })}
      </div>

      {/* Extra functions row */}
      <div className="grid grid-cols-5 gap-2 mt-2">
        {[
          { label: "log", fn: "log" },
          { label: "x!", fn: "x!" },
          { label: "%", fn: "%" },
          { label: "±", fn: "±" },
          { label: "π", type: "const" as const },
        ].map((b, i) => (
          <Button key={i} variant="outline" onClick={() => {
            if (b.type === "const") inputConstant("π");
            else applyFunction(b.fn!);
          }}>
            {b.label}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <Button variant="outline" onClick={() => inputConstant("e")}>e</Button>
        <Button variant="outline" onClick={() => { setExpression(`(${parseFloat(display)})`); setIsNewNumber(true); }}>( )</Button>
      </div>
    </div>
  );
}
