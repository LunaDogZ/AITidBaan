import type { Gpu, MachineAnswers, Ram, Task, Vram } from '../../lib/recommend';

export interface Answers {
  ram?: Ram;
  gpu?: Gpu;
  vram?: Vram;
  tasks: Task[];
}

export function toMachine(a: Answers): MachineAnswers | null {
  if (!a.ram || !a.gpu || (a.gpu === 'nvidia' && !a.vram)) return null;
  return { ram: a.ram, gpu: a.gpu, vram: a.vram };
}
