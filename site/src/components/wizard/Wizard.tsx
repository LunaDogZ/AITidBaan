import { useEffect, useState } from 'react';
import { toMachine, type Answers } from './answers';
import { Progress } from './Progress';
import { CheckMachine } from './CheckMachine';
import { Recommendation } from './Recommendation';
import { InstallApp } from './InstallApp';
import { LoadModel } from './LoadModel';
import { TryIt } from './TryIt';
import { GoOffline } from './GoOffline';
import { recommend } from '../../lib/recommend';
import { MODELS } from '../../data/models';

// ขั้นอยู่ใน URL hash (#step-1) เพื่อให้ปุ่ม back ของเบราว์เซอร์ใช้ได้
function stepFromHash(): number {
  const n = Number(location.hash.match(/^#step-(\d)$/)?.[1]);
  return n >= 1 && n <= 6 ? n : 1;
}

export default function Wizard() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({ tasks: [] });
  const [question, setQuestion] = useState(0);

  useEffect(() => {
    const sync = () => setStep(stepFromHash());
    sync();
    addEventListener('hashchange', sync);
    return () => removeEventListener('hashchange', sync);
  }, []);

  const machine = toMachine(answers);
  const ready = machine !== null && answers.tasks.length > 0;
  // เข้า #step-2 ตรงๆ โดยยังไม่ได้ตอบ ให้กลับไปขั้นแรก ทั้งหน้าจอและ URL
  // (ถ้าแก้แค่หน้าจอ พอตอบครบจะกระโดดไปขั้น 2 เองโดยไม่ได้กดไปต่อ)
  // ขั้น ③-⑥ ต้องมีโมเดลที่แนะนำ ถ้าไม่มี (RAM 4GB) ให้อยู่ที่หน้าผลแนะนำ
  const model = machine ? recommend(machine, answers.tasks, MODELS) : null;
  const allowed = !ready ? 1 : !model ? 2 : 6;
  useEffect(() => {
    if (step > allowed) {
      history.replaceState(null, '', `#step-${allowed}`);
      setStep(allowed);
    }
  }, [step, allowed]);
  const shown = Math.min(step, allowed);
  const go = (n: number) => {
    location.hash = `step-${n}`;
    scrollTo({ top: 0 });
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pt-[5.25rem] pb-20">
      <Progress current={shown} />
      <div key={shown} className="fade-in mt-6">
        {shown === 1 && (
          <CheckMachine
            answers={answers}
            onChange={setAnswers}
            question={question}
            onQuestion={setQuestion}
            onDone={() => go(2)}
          />
        )}
        {shown === 2 && machine && (
          <Recommendation machine={machine} tasks={answers.tasks} onEdit={() => go(1)} onNext={() => go(3)} />
        )}
        {shown === 3 && model && <InstallApp model={model} onBack={() => go(2)} onNext={() => go(4)} />}
        {shown === 4 && model && <LoadModel model={model} onBack={() => go(3)} onNext={() => go(5)} />}
        {shown === 5 && model && (
          <TryIt model={model} tasks={answers.tasks} onBack={() => go(4)} onNext={() => go(6)} />
        )}
        {shown === 6 && model && <GoOffline onBack={() => go(5)} />}
      </div>
    </div>
  );
}
