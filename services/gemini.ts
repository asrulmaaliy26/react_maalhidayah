import { GoogleGenAI } from "@google/genai";

const getApiKey = (): string => {
  const key =
    process.env.API_KEY ||
    process.env.GEMINI_API_KEY ||
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (import.meta as any).env?.GEMINI_API_KEY ||
    '';
  return key;
};

const getAiClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const CANDIDATE_MODELS = ['gemini-3.8-flash', 'gemini-3-flash-preview', 'gemini-flash-latest'];

export const MA_AL_HIDAYAH_SYSTEM_INSTRUCTION = `
Anda adalah Asisten Virtual Cerdas resmi MA Al Hidayah & Lembaga Pendidikan Islam (LPI) Al Hidayah Kauman Tulungagung.
Anda bertugas melayani calon wali santri, calon siswa, santri/siswa aktif, wali murid, dan masyarakat umum dengan ramah, santun, solutif, serta bernuansa Islami dan Qurani.

Berikut adalah BASIS DATA & INFORMASI RESMI yang harus Anda kuasai secara komprehensif:

1. PROFIL LEMBAGA:
- Nama Institusi: Madrasah Aliyah (MA) Al Hidayah Kauman Tulungagung.
- Naungan: Lembaga Pendidikan Islam (LPI) Al Hidayah / Yayasan Pendidikan Al Mannan.
- Karakter & Nilai: Islami, Qurani, Unggul dalam IPTEK, Kokoh dalam Karakter Rabbani.
- Jenjang Pendidikan: Tingkat Aliyah / Menengah Atas (setara SMA) berbasis Pesantren terpadu.

2. VISI & MISI:
- Visi: "Terwujudnya sekolah unggul dan rujukan pengemban Al-Qur’an, berakhlakul karimah, cerdas dalam IPTEK dan kuat dalam karakter."
- Misi:
  a. Menyelenggarakan pembiasaan peserta didik menghafal dan mengamalkan Al-Qur'an 30 Juz.
  b. Menjadikan Al-Qur'an sebagai pedoman utama dalam kehidupan sehari-hari.
  c. Membiasakan peserta didik berperilaku terpuji sesuai dengan akhlak Rasulullah SAW.
  d. Mengoptimalkan potensi peserta didik dalam penguasaan sains, teknologi (IPTEK) demi kemaslahatan umat.
  e. Menyelenggarakan lingkungan belajar yang kondusif, aman, dan barakah bagi lahirnya insan cerdas dan saleh.

3. PROGRAM UNGGULAN:
- Program Tahfidz Al-Qur'an (target hingga 30 Juz dengan bimbingan bersanad).
- Kurikulum Terintegrasi: Penggabungan Kurikulum Nasional (Sains/Akademik) dan Kurikulum Kepesantrenan (Turats/Kitab Kuning).
- Pembinaan Karakter Rabbani, Sholat Berjamaah, Qiyamul Lail, dan Dhuha rutin.
- Penguasaan Bahasa Asing (Bahasa Arab dan Bahasa Inggris) aktif.
- Bimbingan Prestasi Akademik, Olimpiade Sains Madrasah (KSM), MTQ/Tilawah, Seni Kaligrafi, dan Pidato/Khitobah.

4. INFORMASI PPDB (PENERIMAAN PESERTA DIDIK BARU):
- Jenjang yang diterima: Lulusan SMP/MTs atau sederajat.
- Jalur Pendaftaran: Jalur Reguler, Jalur Prestasi (Akademik & Non-akademik), dan Jalur Beasiswa Tahfidz Al-Qur'an.
- Prosedur: Konsultasi pendaftaran online & info biaya/jadwal dapat langsung menghubungi WhatsApp resmi atau datang langsung ke sekretariat.

5. ALAMAT & KONTAK RESMI:
- Alamat Kampus: Jl. KH Hasyim Asyari No.27, Kauman, Kec. Kauman, Kabupaten Tulungagung, Jawa Timur 66261.
- Kontak WhatsApp Admin & PPDB: 0815-5986-1036 (Ibu Mei) / https://wa.me/6281559861036
- Email Resmi: lpialhidayahkauman@gmail.com
- Instagram: @lpialhidayahkauman (https://www.instagram.com/lpialhidayahkauman)
- Website Resmi: https://lpialhidayah.or.id

6. KELUARGA BESAR LEMBAGA / JENJANG YAYASAN:
LPI Al Hidayah / Yayasan Al Mannan menaungi jenjang pendidikan terpadu:
- TPQ Al Mannan (Pendidikan Al-Qur'an usia dini)
- MI Al Hidayah (Madrasah Ibtidaiyah / setara SD)
- SMPT Al Mannan (SMP Terpadu / setara MTs)
- MA Al Hidayah (Madrasah Aliyah / setara SMA)
- Madin Al Mannan (Madrasah Diniyah Takmiliyah)
- STAI Al-Mannan (Sekolah Tinggi Agama Islam, prodi IAT S.Ag)

PEDOMAN MENJAWAB:
- Awali selalu dengan sapaan hangat dan Islami (misal: "Assalamu'alaikum Warahmatullahi Wabarakatuh...").
- Gunakan gaya bahasa yang sopan, ramah, meyakinkan, dan bersahabat.
- Bila ada pertanyaan pendaftaran/PPDB, biaya, atau informasi kontak, sertakan nomor WhatsApp Ibu Mei (0815-5986-1036) dan lokasi Jl. KH Hasyim Asyari No.27 Kauman Tulungagung.
- Jika pengguna bertanya tentang jenjang lain (seperti MI, SMPT, TPQ, atau STAI), Anda tetap dapat menjelaskan secara garis besar karena masih dalam satu naungan yayasan.
`;

export const getSchoolAssistantResponse = async (
  userPrompt: string,
  history: Array<{ role: 'user' | 'bot'; text: string }> = []
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Maaf, asisten AI sedang tidak tersedia (API Key missing).";

  const contents: any[] = [];
  const recentHistory = history.slice(-6);
  for (const msg of recentHistory) {
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    });
  }
  contents.push({
    role: 'user',
    parts: [{ text: userPrompt }]
  });

  let lastError: any = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: contents,
        config: {
          systemInstruction: MA_AL_HIDAYAH_SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      if (response.text) {
        return response.text;
      }
    } catch (error: any) {
      lastError = error;
      console.warn(`Model ${model} failed, trying next fallback model...`, error?.message);
    }
  }

  console.error("All Gemini models failed:", lastError);
  return "Maaf, terjadi kendala koneksi pada layanan AI saat ini. Silakan coba kembali beberapa saat lagi atau hubungi WhatsApp kami di 0815-5986-1036 (Ibu Mei).";
};

export interface NewsPromptContext {
  briefDescription?: string;
  title?: string;
  category?: string;
  excerpt?: string;
  jenjang?: string;
  fakultas?: string;
  jurusan?: string;
  images?: (File | Blob | null | undefined)[];
}

// Convert File/Blob to Gemini inlineData base64 part
export const fileToGenerativePart = async (file: File | Blob): Promise<{ inlineData: { data: string; mimeType: string } } | null> => {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultStr = reader.result as string;
        if (resultStr && resultStr.includes(',')) {
          const base64Data = resultStr.split(',')[1];
          resolve({
            inlineData: {
              data: base64Data,
              mimeType: file.type || 'image/jpeg'
            }
          });
        } else {
          resolve(null);
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    } catch {
      resolve(null);
    }
  });
};

export const generateNewsArticle = async (
  contextOrDescription: string | NewsPromptContext
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Gagal generate berita: API Key tidak ditemukan.";

  const ctx: NewsPromptContext = typeof contextOrDescription === 'string'
    ? { briefDescription: contextOrDescription }
    : (contextOrDescription || {});

  // 1. Convert all valid images to base64 inlineData
  const imageParts: { inlineData: { data: string; mimeType: string } }[] = [];
  if (ctx.images && Array.isArray(ctx.images)) {
    for (const img of ctx.images) {
      if (img && (img instanceof File || img instanceof Blob)) {
        const part = await fileToGenerativePart(img);
        if (part) {
          imageParts.push(part);
        }
      }
    }
  }

  // 2. Build structured base prompt from form metadata
  const promptParts: string[] = [];
  promptParts.push(`Anda adalah jurnalis dan humas profesional untuk Madrasah Aliyah (MA) Al Hidayah. Tugas Anda adalah menyusun artikel berita kegiatan yang lengkap, menarik, mendalam, dan bernuansa sekolah Islam unggul.`);

  if (imageParts.length > 0) {
    promptParts.push(`\n[ANALISIS FOTO DOKUMENTASI]:\nAda ${imageParts.length} foto kegiatan asli yang dilampirkan. Cermati detail visual di foto-foto tersebut (suasana kegiatan, orang/santri/tokoh/pembicara yang hadir, ekspresi wajah, spanduk/backdrop, plakat/trofi, dekorasi, dan aktivitas yang sedang berlangsung). Integrasikan detail nyata dari foto ini ke dalam narasi artikel berita agar terasa hidup, faktual, dan otentik.`);
  }

  const baseItems: string[] = [];
  if (ctx.title && ctx.title.trim() && ctx.title !== 'Judul Baru') {
    baseItems.push(`- Judul / Topik Berita: "${ctx.title.trim()}"`);
  }
  if (ctx.category && ctx.category.trim()) {
    baseItems.push(`- Kategori Kegiatan: ${ctx.category.trim()}`);
  }
  if (ctx.jenjang && ctx.jenjang.trim()) {
    baseItems.push(`- Jenjang: ${ctx.jenjang.trim()}`);
  }
  if (ctx.fakultas || ctx.jurusan) {
    baseItems.push(`- Fakultas/Jurusan: ${(ctx.fakultas || '')} ${(ctx.jurusan || '')}`);
  }
  if (ctx.excerpt && ctx.excerpt.trim()) {
    baseItems.push(`- Ringkasan / Poin Awal: "${ctx.excerpt.trim()}"`);
  }

  if (baseItems.length > 0) {
    promptParts.push(`\n[DATA & KONTEKS DASAR (BASE PROMPT)]:\n${baseItems.join('\n')}`);
  }

  if (ctx.briefDescription && ctx.briefDescription.trim()) {
    promptParts.push(`\n[POIN TAMBAHAN / INSTRUKSI KHUSUS DARI ADMIN]:\n"${ctx.briefDescription.trim()}"`);
  } else if (baseItems.length === 0 && imageParts.length === 0) {
    promptParts.push('\nBuatkan artikel berita kegiatan terkini yang menginspirasi.');
  }

  promptParts.push(`\n[KETENTUAN FORMAT OUTPUT]:
1. Awali dengan judul berita yang menarik dan relevan di dalam tag <h3>Judul Berita</h3>.
2. Tulis isi berita minimal 3-5 paragraf yang mengalir rapi dengan tag <p>.
3. Gunakan tag <strong> untuk nama orang, prestasi, atau poin penting, serta <em> jika ada kutipan/sambutan.
4. JANGAN sertakan tag <html>, <head>, atau <body>. Jangan gunakan wrapper markdown seperti \`\`\`html.
5. Gunakan bahasa jurnalistik formal, santun, inspiratif, dan edukatif.`);

  const promptText = promptParts.join('\n');
  const contentsPayload: any[] = [...imageParts, { text: promptText }];

  let lastError: any = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: contentsPayload.length === 1 && typeof contentsPayload[0].text === 'string'
          ? contentsPayload[0].text
          : contentsPayload,
        config: {
          temperature: 0.7,
        },
      });

      let text = response.text || "";
      text = text.replace(/^\`\`\`html\s*/i, '').replace(/\`\`\`\s*$/i, '').trim();
      if (text) {
        return text;
      }
    } catch (error: any) {
      lastError = error;
      console.warn(`Model ${model} failed for multimodal news generation, trying fallback...`, error?.message);
    }
  }

  console.error("Gemini News Generation Error:", lastError);
  throw new Error(lastError?.message || "Gagal memproses AI");
};
