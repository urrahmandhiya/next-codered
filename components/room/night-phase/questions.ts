export interface QuizOption {
  id: "A" | "B" | "C" | "D";
  text: string;
}

export interface Question {
  id: number;
  text: string;
  options: QuizOption[];
  correctAnswer: "A" | "B" | "C" | "D";
}

export const NIGHT_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Apa fungsi utama dari Firewall dalam jaringan komputer?",
    correctAnswer: "A",
    options: [
      { id: "A", text: "Menyaring lalu lintas data" },
      { id: "B", text: "Mempercepat koneksi internet" },
      { id: "C", text: "Menyimpan data cadangan" },
      { id: "D", text: "Menghapus malware otomatis" },
    ],
  },
  {
    id: 2,
    text: "Manakah dari berikut ini yang merupakan protokol transfer data aman (encrypted)?",
    correctAnswer: "C",
    options: [
      { id: "A", text: "HTTP" },
      { id: "B", text: "FTP" },
      { id: "C", text: "HTTPS" },
      { id: "D", text: "Telnet" },
    ],
  },
  {
    id: 3,
    text: "Apa tujuan utama dari serangan DDOS?",
    correctAnswer: "B",
    options: [
      { id: "A", text: "Mencuri data kartu kredit" },
      { id: "B", text: "Membuat layanan/server tidak dapat diakses" },
      { id: "C", text: "Mengubah kata sandi administrator" },
      { id: "D", text: "Menginfeksi komputer dengan virus" },
    ],
  },
  {
    id: 4,
    text: "Metode autentikasi apa yang menggunakan dua faktor pembuktian identitas berbeda?",
    correctAnswer: "D",
    options: [
      { id: "A", text: "Single Sign-On (SSO)" },
      { id: "B", text: "One-Time Password (OTP)" },
      { id: "C", text: "Biometric Authentication" },
      { id: "D", text: "Two-Factor Authentication (2FA)" },
    ],
  },
  {
    id: 5,
    text: "Apa jenis serangan rekayasa sosial (social engineering) untuk memancing data sensitif?",
    correctAnswer: "A",
    options: [
      { id: "A", text: "Phishing" },
      { id: "B", text: "SQL Injection" },
      { id: "C", text: "Man-in-the-Middle" },
      { id: "D", text: "Ransomware" },
    ],
  },
];
