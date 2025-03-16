import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ScoreVisualizerProps {
  scores: {
    projectDesign: number;
    functionality: number;
    presentation: number;
    webDesign: number;
    impact: number;
  };
  showAnimation: boolean;
}

export default function ScoreCalculationVisualizer({ scores, showAnimation }: ScoreVisualizerProps) {
  const [showCriteria, setShowCriteria] = useState(false);
  const [showWeights, setShowWeights] = useState(false);
  const [showTotal, setShowTotal] = useState(false);
  
  const weights = {
    projectDesign: 0.25,
    functionality: 0.30,
    presentation: 0.15,
    webDesign: 0.10,
    impact: 0.20
  };
  
  const weightedScores = {
    projectDesign: scores.projectDesign * weights.projectDesign,
    functionality: scores.functionality * weights.functionality,
    presentation: scores.presentation * weights.presentation,
    webDesign: scores.webDesign * weights.webDesign,
    impact: scores.impact * weights.impact
  };
  
  const totalScore = 
    weightedScores.projectDesign + 
    weightedScores.functionality + 
    weightedScores.presentation + 
    weightedScores.webDesign + 
    weightedScores.impact;
  
  useEffect(() => {
    if (showAnimation) {
      // Reset animation states
      setShowCriteria(false);
      setShowWeights(false);
      setShowTotal(false);
      
      // Start animation sequence
      const criteriaTimer = setTimeout(() => setShowCriteria(true), 200);
      const weightsTimer = setTimeout(() => setShowWeights(true), 1200);
      const totalTimer = setTimeout(() => setShowTotal(true), 2200);
      
      return () => {
        clearTimeout(criteriaTimer);
        clearTimeout(weightsTimer);
        clearTimeout(totalTimer);
      };
    }
  }, [showAnimation]);
  
  if (!showAnimation) return null;
  
  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h2 className="text-2xl font-bold text-teal-700 mb-6 text-center">Score Calculation</h2>
        
        {/* Criteria Scores */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Raw Scores</h3>
          <div className="space-y-3">
            {Object.entries(scores).map(([criteria, score], index) => (
              <motion.div 
                key={criteria} 
                className="flex justify-between items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: showCriteria ? 1 : 0, x: showCriteria ? 0 : -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <span className="capitalize">{criteria.replace(/([A-Z])/g, ' $1').trim()}:</span>
                <span className="font-bold">{score}</span>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Weights and Calculation */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Weighted Calculation</h3>
          <div className="space-y-3">
            {Object.entries(weightedScores).map(([criteria, weightedScore], index) => (
              <motion.div 
                key={criteria} 
                className="flex justify-between items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: showWeights ? 1 : 0, x: showWeights ? 0 : -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex flex-1 items-center">
                  <span className="capitalize mr-1">{criteria.replace(/([A-Z])/g, ' $1').trim()}:</span>
                  <span className="text-sm text-gray-500">
                    {scores[criteria as keyof typeof scores]} × {weights[criteria as keyof typeof weights]} =
                  </span>
                </div>
                <span className="font-bold text-teal-600 ml-2">{weightedScore.toFixed(2)}</span>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Total Score */}
        <motion.div 
          className="p-4 bg-teal-50 rounded-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showTotal ? 1 : 0, y: showTotal ? 0 : 20 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">Final Score:</span>
            <motion.span 
              className="text-2xl font-bold text-teal-700"
              initial={{ scale: 0.7 }}
              animate={{ scale: showTotal ? 1.2 : 0.7 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
            >
              {totalScore.toFixed(2)}
            </motion.span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}