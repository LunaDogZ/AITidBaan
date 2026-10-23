export type Ram = 4 | 8 | 16 | 32 | 'unsure';
// 'nvidia' = การ์ดจอแยก NVIDIA หรือ AMD Radeon (ชื่อเดิมคงไว้ เพราะคำตอบที่บันทึกในเครื่องผู้ใช้ใช้ค่านี้)
export type Gpu = 'nvidia' | 'none' | 'unsure';
export type Vram = 4 | 6 | 8 | 12 | 'unsure';

export interface MachineAnswers {
  ram: Ram;
  gpu: Gpu;
  vram?: Vram;
}

export type Tier = 'notEnough' | 'small' | 'medium' | 'strong';

// "ไม่แน่ใจ" = เลือกค่าต่ำสุดของข้อนั้นที่ยังไม่เป็นทางตัน (RAM → 8GB, การ์ดจอ → ไม่มี)
export function machineTier(a: MachineAnswers): Tier {
  if (a.ram === 4) return 'notEnough';
  if (a.gpu === 'nvidia' && (a.vram === 8 || a.vram === 12)) return 'strong';
  if (a.ram === 16 || a.ram === 32) return 'medium';
  return 'small';
}

const TIER_RANK: Record<Tier, number> = { notEnough: 0, small: 1, medium: 2, strong: 3 };

// ข้อที่ตอบ "ไม่แน่ใจ" แล้วถ้ารู้ค่าจริง ระดับเครื่องอาจสูงขึ้นได้ (ใช้บอกผู้ใช้ว่าควรกลับไปเช็กข้อไหน)
export function unsureUpgrades(a: MachineAnswers): ('ram' | 'gpu')[] {
  const now = TIER_RANK[machineTier(a)];
  const better = (b: MachineAnswers) => TIER_RANK[machineTier(b)] > now;
  const out: ('ram' | 'gpu')[] = [];
  if (a.ram === 'unsure' && better({ ...a, ram: 32 })) out.push('ram');
  if ((a.gpu === 'unsure' || (a.gpu === 'nvidia' && a.vram === 'unsure')) && better({ ...a, gpu: 'nvidia', vram: 12 }))
    out.push('gpu');
  return out;
}

export type Task = 'summary' | 'formal' | 'spelling' | 'extraction' | 'translation' | 'minutes';

export interface RatingCount {
  good: number;
  minor: number;
  bad: number;
}

export interface RatedModel {
  id: string;
  tier: Tier;
  fileGB: number;
  ratings: Partial<Record<Task, RatingCount>>;
}

export function goodCount(m: RatedModel, tasks: readonly Task[]): number {
  return tasks.reduce((sum, t) => sum + (m.ratings[t]?.good ?? 0), 0);
}

// 🟢 = 2 แต้ม 🟡 = 1 🔴 = 0 คิดเป็นสัดส่วนของแต้มเต็มในแต่ละงานแล้วเฉลี่ย งานที่มีจำนวนข้อต่างกันจึงมีน้ำหนักเท่ากัน
export function score(m: RatedModel, tasks: readonly Task[]): number {
  if (tasks.length === 0) return 0;
  return (
    tasks.reduce((sum, t) => {
      const r = m.ratings[t];
      const n = r ? r.good + r.minor + r.bad : 0;
      return sum + (n ? (2 * r!.good + r!.minor) / (2 * n) : 0);
    }, 0) / tasks.length
  );
}

export function recommend<M extends RatedModel>(
  machine: MachineAnswers,
  tasks: readonly Task[],
  models: readonly M[],
): M | null {
  const rank = TIER_RANK[machineTier(machine)];
  let best: M | null = null;
  for (const m of models) {
    if (m.tier === 'notEnough' || TIER_RANK[m.tier] > rank) continue;
    if (best === null) {
      best = m;
      continue;
    }
    const diff = score(m, tasks) - score(best, tasks);
    // เสมอกัน เลือกตัวที่ไฟล์เล็กกว่าเพราะเร็วกว่า
    if (diff > 0 || (diff === 0 && m.fileGB < best.fileGB)) best = m;
  }
  return best;
}
