import { useState } from "react";
import { StepIndicator } from "@/components/StepIndicator";
import { StepUpload } from "@/components/StepUpload";
import { StepConvert } from "@/components/StepConvert";
import { StepFinish } from "@/components/StepFinish";
import type { ITerm2Profile, ConversionResult } from "@/lib/iterm2-parser";

const STEPS = ["上传配置", "转换预览", "下载 & 操作"];

export default function ITerm2ToGhostty() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<ITerm2Profile | null>(null);
  const [result, setResult] = useState<ConversionResult | null>(null);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <StepIndicator steps={STEPS} currentStep={step} />

      {step === 0 && (
        <StepUpload
          mode="iterm2"
          itermProfile={profile}
          onParsedITerm2={(p) => setProfile(p)}
          onNext={() => setStep(1)}
        />
      )}
      {step === 1 && profile && (
        <StepConvert
          profile={profile}
          onNext={(r) => { setResult(r); setStep(2); }}
        />
      )}
      {step === 2 && result && (
        <StepFinish itermResult={result} p10kResult={null} mode="iterm2" />
      )}
    </div>
  );
}
