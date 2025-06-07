import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface GenerationProgressProps {
  packId: number;
  characters: string[];
  onComplete: () => void;
}

interface ProgressState {
  stage: string;
  percentage: number;
  completedCharacters: string[];
  currentCharacter?: string;
}

export default function GenerationProgress({ 
  packId, 
  characters, 
  onComplete 
}: GenerationProgressProps) {
  const [progress, setProgress] = useState<ProgressState>({
    stage: 'Enhancing prompts with Gemini AI...',
    percentage: 0,
    completedCharacters: [],
  });

  useEffect(() => {
    // Simulate realistic progress
    const stages = [
      { stage: 'Enhancing prompts with Gemini AI...', duration: 2000, percentage: 15 },
      { stage: 'Connecting to Runware API...', duration: 1000, percentage: 25 },
      { stage: 'Generating character variations...', duration: 5000, percentage: 90 },
      { stage: 'Finalizing character pack...', duration: 1000, percentage: 100 },
    ];

    let currentStageIndex = 0;
    let completedChars: string[] = [];

    const runStage = () => {
      if (currentStageIndex >= stages.length) {
        onComplete();
        return;
      }

      const stage = stages[currentStageIndex];
      setProgress(prev => ({
        ...prev,
        stage: stage.stage,
        percentage: stage.percentage,
      }));

      // Simulate character completion during generation stage
      if (stage.stage.includes('Generating')) {
        const charInterval = setInterval(() => {
          if (completedChars.length < characters.length) {
            completedChars = [...completedChars, characters[completedChars.length]];
            setProgress(prev => ({
              ...prev,
              completedCharacters: completedChars,
              currentCharacter: characters[completedChars.length],
              percentage: 25 + (completedChars.length / characters.length) * 65,
            }));
          } else {
            clearInterval(charInterval);
          }
        }, stage.duration / characters.length);
      }

      setTimeout(() => {
        currentStageIndex++;
        runStage();
      }, stage.duration);
    };

    runStage();
  }, [packId, characters, onComplete]);

  return (
    <Card className="bg-slate-800 border-slate-700 mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">Generating Character Pack</h3>
            <p className="text-slate-400">Creating {characters.length * 4} unique character variations...</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{Math.round(progress.percentage)}%</div>
            <div className="text-sm text-slate-400">
              {progress.completedCharacters.length * 4} of {characters.length * 4} images
            </div>
          </div>
        </div>

        <div className="bg-slate-700 rounded-full h-2 mb-6">
          <div 
            className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          ></div>
        </div>

        <div className="mb-4">
          <p className="text-slate-300 mb-2">{progress.stage}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {characters.map((characterId, index) => {
            const isCompleted = progress.completedCharacters.includes(characterId);
            const isCurrent = progress.currentCharacter === characterId;
            
            return (
              <Card key={characterId} className="bg-slate-700 border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-emerald-500' : 
                      isCurrent ? 'bg-primary' : 'bg-slate-600'
                    }`}>
                      {isCompleted ? (
                        <i className="fas fa-check text-white text-sm"></i>
                      ) : isCurrent ? (
                        <i className="fas fa-spinner fa-spin text-white text-sm"></i>
                      ) : (
                        <i className="fas fa-clock text-slate-400 text-sm"></i>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-white capitalize">{characterId}</h4>
                      <p className="text-sm text-slate-400">
                        {isCompleted ? '4/4 completed' : 
                         isCurrent ? '2/4 generating...' : '0/4 queued'}
                      </p>
                    </div>
                  </div>
                  <div className="bg-slate-600 rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full ${
                        isCompleted ? 'bg-emerald-500 w-full' :
                        isCurrent ? 'bg-primary w-1/2' : 'w-0'
                      }`}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
