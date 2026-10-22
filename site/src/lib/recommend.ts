export type Ram = 4 | 8 | 16 | 32 | 'unsure';
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

export type Task = 'summary' | 'formal' | 'spelling' | 'extraction' | 'translation' | 'minutes';

export interface RatingCount {
  good: number;
  minor: number;
  bad: number;
}

export interface RatedModel {
  id: string;
  tier: Tier;
  ratings: Partial<Record<Task, RatingCount>>;
}

export function goodCount(m: RatedModel, tasks: readonly Task[]): number {
  return tasks.reduce((sum, t) => sum + (m.ratings[t]?.good ?? 0), 0);
}

export function recommend<M extends RatedModel>(
  machine: MachineAnswers,
  tasks: readonly Task[],
  models: readonly M[],
): M | null {
  const tier = machineTier(machine);
  let best: M | null = null;
  for (const m of models) {
    if (m.tier === tier && (best === null || goodCount(m, tasks) > goodCount(best, tasks))) best = m;
  }
  return best;
}
