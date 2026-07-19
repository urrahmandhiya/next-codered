export interface Option {
  id: "A" | "B" | "C" | "D";
  text: string;
}

export interface Question {
  id: number;
  text: string;
  options: Option[];
}

export const DOWNTIME_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "System Alert: Anomalous data packet intercepted. Which action minimizes signal exposure?",
    options: [
      { id: "A", text: "Reroute through redundant nodes" },
      { id: "B", text: "Purge local cache immediately" },
      { id: "C", text: "Encrypt channel with fallback key" },
      { id: "D", text: "Isolate network segment" },
    ],
  },
  {
    id: 2,
    text: "Unscheduled node ping detected from unassigned address. Protocol response?",
    options: [
      { id: "A", text: "Acknowledge and request handshake" },
      { id: "B", text: "Silently log and quarantine port" },
      { id: "C", text: "Broadcast system-wide warning" },
      { id: "D", text: "Initiate emergency diagnostic" },
    ],
  },
  {
    id: 3,
    text: "Memory leak identified in core subsystem. Immediate mitigation step?",
    options: [
      { id: "A", text: "Allocate secondary buffer" },
      { id: "B", text: "Force garbage collection sweep" },
      { id: "C", text: "Throttle input stream rate" },
      { id: "D", text: "Restart affected thread worker" },
    ],
  },
  {
    id: 4,
    text: "Encryption key checksum mismatch on inbound payload. Standard procedure?",
    options: [
      { id: "A", text: "Request key re-transmission" },
      { id: "B", text: "Drop packet and flag origin" },
      { id: "C", text: "Attempt legacy key decryption" },
      { id: "D", text: "Bypass verification check" },
    ],
  },
];
