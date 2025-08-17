import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StreamingText } from './StreamingText';
import { Square } from 'lucide-react-native';
import { useHapticSettings } from '@/hooks/useHapticSettings';

interface StreamingGuidanceProps {
  guidance: {
    intro?: string;
    practicalSteps?: string;
    reflection?: string;
    scripture?: {
      text: string;
      source: string;
      explanation: string;
    };
    outro?: string;
  };
  speed: number;
  onRetry?: () => void;
  isCancelled?: boolean;
}

export const StreamingGuidance: React.FC<StreamingGuidanceProps> = ({
  guidance,
  speed,
  onRetry,
  isCancelled = false,
}) => {
  const [currentSection, setCurrentSection] = useState<'intro' | 'steps' | 'reflection' | 'scripture' | 'explanation' | 'complete'>(isCancelled ? 'complete' : 'intro');
  const [isStreamingCancelled, setIsStreamingCancelled] = useState(isCancelled);
  const [showStopButton, setShowStopButton] = useState(true);
  const { isEnabled: hapticsEnabled } = useHapticSettings();

  // Debug logging
  console.log('StreamingGuidance render:', {
    speed,
    speedType: typeof speed,
    currentSection,
    isCancelled,
    isStreamingCancelled,
    hasIntro: !!guidance.intro,
    hasPracticalSteps: !!guidance.practicalSteps,
    hasReflection: !!guidance.reflection,
    hasScripture: !!guidance.scripture,
    hasOutro: !!guidance.outro,
    practicalStepsLength: guidance.practicalSteps?.length || 0,
  });

  const handleSectionComplete = () => {
    if (isStreamingCancelled) return;

    console.log('Section complete, transitioning from:', currentSection);

    switch (currentSection) {
      case 'intro':
        console.log('Transitioning from intro to steps');
        setCurrentSection('steps');
        break;
      case 'steps':
        console.log('Transitioning from steps to reflection');
        setCurrentSection('reflection');
        break;
      case 'reflection':
        console.log('Transitioning from reflection to scripture');
        setCurrentSection('scripture');
        break;
      case 'scripture':
        console.log('Transitioning from scripture to explanation');
        setCurrentSection('explanation');
        break;
      case 'explanation':
        console.log('Transitioning from explanation to outro');
        setCurrentSection('outro');
        break;
      case 'outro':
        console.log('Transitioning from outro to complete');
        setCurrentSection('complete');
        setShowStopButton(false);
        break;
    }
  };

  const handleStop = () => {
    setIsStreamingCancelled(true);
    setShowStopButton(false);
  };

  const renderSteps = () => {
    if (!guidance.practicalSteps) return null;
    
    const steps = guidance.practicalSteps
      .split(/[•\n]/)
      .filter(step => step.trim().length > 0);

    return (
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step.trim()}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Intro Section */}
      {guidance.intro && (
        <StreamingText
          text={guidance.intro}
          speed={speed}
          onComplete={handleSectionComplete}
          isCancelled={isStreamingCancelled}
          hapticsEnabled={hapticsEnabled}
          style={styles.introText}
        />
      )}

                    {/* Practical Steps Section */}
       {(() => {
         const shouldShow = guidance.practicalSteps && (currentSection === 'steps' || currentSection === 'reflection' || currentSection === 'scripture' || currentSection === 'explanation' || currentSection === 'outro' || currentSection === 'complete' || isCancelled || isStreamingCancelled);
         console.log('Practical steps condition:', {
           hasPracticalSteps: !!guidance.practicalSteps,
           currentSection,
           isCancelled,
           isStreamingCancelled,
           shouldShow,
         });
         return shouldShow;
       })() && (
         <View style={styles.practicalStepsCard}>
           <Text style={styles.sectionTitle}>Practical Steps</Text>
           {currentSection === 'steps' && !isCancelled ? (
             <View style={styles.stepsContainer}>
               <StreamingText
                 text={guidance.practicalSteps}
                 speed={speed}
                 onComplete={handleSectionComplete}
                 isCancelled={isStreamingCancelled}
                 hapticsEnabled={hapticsEnabled}
                 style={styles.stepsText}
               />
             </View>
           ) : (
             renderSteps()
           )}
         </View>
       )}

      {/* Reflection Section */}
      {guidance.reflection && (currentSection === 'reflection' || currentSection === 'scripture' || currentSection === 'explanation' || currentSection === 'complete' || isCancelled) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reflection</Text>
          {currentSection === 'reflection' && !isStreamingCancelled ? (
            <StreamingText
              text={guidance.reflection}
              speed={speed}
              onComplete={handleSectionComplete}
              isCancelled={isStreamingCancelled}
              hapticsEnabled={hapticsEnabled}
              style={styles.sectionText}
            />
          ) : (
            <Text style={styles.sectionText}>{guidance.reflection}</Text>
          )}
        </View>
      )}

      {/* Scripture Section */}
      {guidance.scripture && (currentSection === 'scripture' || currentSection === 'explanation' || currentSection === 'complete' || isStreamingCancelled) && (
        <View style={styles.scriptureSection}>
          <Text style={styles.sectionTitle}>Buddhist Teaching</Text>
          {currentSection === 'scripture' && !isStreamingCancelled ? (
            <StreamingText
              text={`"${guidance.scripture.text}"\n\n— ${guidance.scripture.source}`}
              speed={speed}
              onComplete={handleSectionComplete}
              isCancelled={isStreamingCancelled}
              hapticsEnabled={hapticsEnabled}
              style={styles.scriptureText}
            />
          ) : (
            <>
              <Text style={styles.scriptureText}>"{guidance.scripture.text}"</Text>
              <Text style={styles.scriptureSource}>— {guidance.scripture.source}</Text>
            </>
          )}
        </View>
      )}

      {/* Explanation Section */}
      {guidance.scripture && (currentSection === 'explanation' || currentSection === 'outro' || currentSection === 'complete' || isStreamingCancelled) && (
        <View style={styles.explanationSection}>
          <Text style={styles.explanationTitle}>Understanding the Teaching</Text>
          {currentSection === 'explanation' && !isStreamingCancelled ? (
            <StreamingText
              text={guidance.scripture.explanation}
              speed={speed}
              onComplete={handleSectionComplete}
              isCancelled={isStreamingCancelled}
              hapticsEnabled={hapticsEnabled}
              style={styles.explanationText}
            />
          ) : (
            <Text style={styles.explanationText}>{guidance.scripture.explanation}</Text>
          )}
        </View>
      )}

      {/* Outro Section */}
      {(currentSection === 'outro' || currentSection === 'complete' || isStreamingCancelled) && guidance.outro && (
        <View style={styles.outroContainer}>
          {currentSection === 'outro' && !isStreamingCancelled ? (
            <StreamingText
              text={guidance.outro}
              speed={speed}
              onComplete={handleSectionComplete}
              isCancelled={isStreamingCancelled}
              hapticsEnabled={hapticsEnabled}
              style={styles.outroText}
            />
          ) : (
            <Text style={styles.outroText}>{guidance.outro}</Text>
          )}
        </View>
      )}

      {/* Outro Section */}

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        {showStopButton && (
          <TouchableOpacity
            style={styles.stopButton}
            onPress={handleStop}
            activeOpacity={0.7}
          >
            <Square size={16} color="#FFFFFF" strokeWidth={2} />
            <Text style={styles.stopButtonText}>Show</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  introText: {
    fontSize: 16,
    color: '#2C2C2C',
    lineHeight: 24,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4AF37',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  sectionText: {
    fontSize: 15,
    color: '#2C2C2C',
    lineHeight: 24,
  },
  practicalStepsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stepsText: {
    fontSize: 15,
    color: '#2C2C2C',
    lineHeight: 22,
  },
  stepsContainer: {
    marginTop: 4,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D4AF37',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stepText: {
    fontSize: 15,
    color: '#2C2C2C',
    lineHeight: 22,
    flex: 1,
  },
  scriptureSection: {
    backgroundColor: '#F9F7F4',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37',
    marginBottom: 16,
  },
  scriptureText: {
    fontSize: 15,
    color: '#2C2C2C',
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  scriptureSource: {
    fontSize: 13,
    color: '#D4AF37',
    fontWeight: '600',
  },
  explanationSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  explanationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#5A5A5A',
    lineHeight: 20,
  },
  outroContainer: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  outroText: {
    fontSize: 16,
    color: '#2C2C2C',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 8,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#D4AF37',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
     stopButtonText: {
     color: '#FFFFFF',
     fontSize: 12,
     fontWeight: '600',
     marginLeft: 4,
   },
 });