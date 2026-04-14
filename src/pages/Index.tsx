import { useState } from "react";
import { StepIndicator } from "@/components/StepIndicator";
import { StepOverview } from "@/components/StepOverview";
import { StepUpload } from "@/components/StepUpload";
import { StepConvert } from "@/components/StepConvert";
import { StepFinish } from "@/components/StepFinish";
import type { ITerm2Profile, ConversionResult } from "@/lib/iterm2-parser";

const STEPS = ["了解方案", "上传配置", "转换预览", "下载 & 操作"];

export default function Index() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<ITerm2Profile | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);

  return (
    <div className="min-h-screen terminal-grid">
      <div className="container max-w-4xl py-12 px-4">
        <StepIndicator steps={STEPS} currentStep={step} />

        {step === 0 && <StepOverview onNext={() => setStep(1)} />}
        {step === 1 && (
          <StepUpload
            onParsed={(p) => {
              setProfile(p);
              setStep(2);
            }}
          />
        )}
        {step === 2 && profile && (
          <StepConvert
            profile={profile}
            onNext={(r) => {
              setResult(r);
              setStep(3);
            }}
          />
        )}
        {step === 3 && result && <StepFinish result={result} />}
      </div>
    </div>
  );
}
