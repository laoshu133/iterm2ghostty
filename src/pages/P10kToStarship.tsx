import { useState } from "react";
import { StepIndicator } from "@/components/StepIndicator";
import { StepUpload } from "@/components/StepUpload";
import { StepConvertP10k } from "@/components/StepConvertP10k";
import { StepFinish } from "@/components/StepFinish";
import type { P10kConfig, StarshipConversionResult } from "@/lib/p10k-parser";

const STEPS = ["上传配置", "转换预览", "下载 & 操作"];

export default function P10kToStarship() {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<P10kConfig | null>(null);
  const [result, setResult] = useState<StarshipConversionResult | null>(null);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <StepIndicator steps={STEPS} currentStep={step} />

      {step === 0 && (
        <StepUpload
          mode="p10k"
          p10kConfig={config}
          onParsedP10k={(c) => setConfig(c)}
          onNext={() => setStep(1)}
        />
      )}
      {step === 1 && config && (
        <StepConvertP10k
          config={config}
          onNext={(r) => { setResult(r); setStep(2); }}
        />
      )}
      {step === 2 && result && (
        <StepFinish itermResult={null} p10kResult={result} mode="p10k" />
      )}
    </div>
  );
}
