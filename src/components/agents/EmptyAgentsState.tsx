"use client";

import CreateAgentForm from "./CreateAgentForm";

export default function EmptyAgentsState() {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/50 p-8 md:p-12">
      <CreateAgentForm />
    </div>
  );
}

