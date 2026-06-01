"use client";

import { CheckCircle, Circle, Loader } from "lucide-react";

export type StepStatus = "pending" | "loading" | "done" | "error";

export interface Step {
  label: string;
  sub?: string;
  status: StepStatus;
}

interface Props {
  steps: Step[];
}

export function TxSteps({ steps }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {steps.map(({ label, sub, status }, i) => {
        const color =
          status === "done" ? "var(--green)"
          : status === "error" ? "var(--red)"
          : status === "loading" ? "var(--amber)"
          : "var(--text-muted)";

        return (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <div style={{ marginTop: 1, flexShrink: 0 }}>
              {status === "done" ? (
                <CheckCircle size={15} color="var(--green)" />
              ) : status === "loading" ? (
                <Loader size={15} color="var(--amber)" style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <Circle size={15} color="var(--text-muted)" />
              )}
            </div>
            <div>
              <div style={{ fontSize: 13, color: status === "pending" ? "var(--text-muted)" : "var(--text-primary)", fontWeight: status === "loading" ? 500 : 400 }}>
                {label}
              </div>
              {sub && status === "loading" && (
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{sub}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
