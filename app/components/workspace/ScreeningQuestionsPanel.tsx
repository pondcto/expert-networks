"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Circle, Dot } from "lucide-react";
import { useCampaign } from "../../lib/campaign-context";

export interface ScreeningQuestion {
  id: string;
  text: string;
  subQuestions?: ScreeningQuestion[];
}

export interface ScreeningQuestionsPanelProps {
  questions?: ScreeningQuestion[];
  onAddQuestion?: (question: ScreeningQuestion) => void;
  onImportQuestions?: () => void;
  onDataChange?: (data: ScreeningQuestion[]) => void;
}

const mockQuestions: ScreeningQuestion[] = [
  {
    id: "1",
    text: "Describe your experience running expert interviews in life sciences (therapeutic areas, geographies, seniority).",
    subQuestions: [
      { id: "1-1", text: "Therapeutic areas covered (e.g., oncology, rare disease, cardiology)" },
      { id: "1-2", text: "Typical respondent profiles (e.g., KOLs, payors, procurement, ex-operators)" },
      { id: "1-3", text: "Regions you’ve sourced in (US/EU/APAC/MEA) and language coverage" },
    ],
  },
  {
    id: "2",
    text: "Sourcing speed and quality control – how do you balance speed vs. vetting?",
    subQuestions: [
      { id: "2-1", text: "Average time to first slate and to full fill for 10+ calls" },
      { id: "2-2", text: "Vetting process and conflict/compliance checks" },
      { id: "2-3", text: "No-show mitigation and rescheduling SLAs" },
    ],
  },
  {
    id: "3",
    text: "What regulatory challenges have you navigated in healthcare research?",
  },
  {
    id: "4",
    text: "Describe your experience with digital transformation in financial services.",
  },
  {
    id: "5",
    text: "How do you approach change management in large organizations?",
  },
  {
    id: "6",
    text: "What fintech trends are you most excited about?",
  },
  {
    id: "7",
    text: "What is your experience with healthcare investment due diligence?",
  },
  {
    id: "8",
    text: "How do you evaluate technology companies for investment?",
  },
  {
    id: "9",
    text: "What sectors are you most bullish on for 2024-2025?",
  },
  {
    id: "10",
    text: "Describe your experience with AI/ML implementation in enterprise environments.",
  },
  {
    id: "11",
    text: "How do you approach cloud architecture for large-scale applications?",
  },
  {
    id: "12",
    text: "What are the biggest challenges in leading technical teams?",
  },
  {
    id: "13",
    text: "What is your experience with omnichannel retail strategies?",
  },
  {
    id: "14",
    text: "How do you approach consumer behavior analysis?",
  },
  {
    id: "15",
    text: "What digital marketing trends are most impactful for CPG brands?",
  },
  {
    id: "16",
    text: "Describe your experience with recommendation systems in e-commerce.",
  },
  {
    id: "17",
    text: "How do you approach A/B testing for ML models?",
  },
  {
    id: "18",
    text: "What are the biggest challenges in production ML systems?",
  },
  {
    id: "19",
    text: "What is your experience with SaaS product launches?",
  },
  {
    id: "20",
    text: "How do you approach B2B sales strategy for enterprise clients?",
  },
  {
    id: "21",
    text: "What partnership strategies work best for SaaS companies?",
  },
  {
    id: "22",
    text: "What is your experience with operational efficiency improvements?",
  },
  {
    id: "23",
    text: "How do you approach process optimization in complex organizations?",
  },
  {
    id: "24",
    text: "What change management methodologies do you use?",
  },
  {
    id: "25",
    text: "Describe your experience with competitive intelligence in consumer goods.",
  },
  {
    id: "26",
    text: "How do you approach consumer insights research?",
  },
  {
    id: "27",
    text: "What retail analytics trends are most important for brands?",
  },
  {
    id: "28",
    text: "What is your experience with technology sector investment analysis?",
  },
  {
    id: "29",
    text: "How do you approach financial modeling for high-growth companies?",
  },
  {
    id: "30",
    text: "What healthcare investment themes are you most excited about?",
  },
  {
    id: "31",
    text: "Describe your experience with supply chain optimization in manufacturing.",
  },
  {
    id: "32",
    text: "How do you approach lean manufacturing implementation?",
  },
  {
    id: "33",
    text: "What digital technologies are transforming manufacturing operations?",
  },
  {
    id: "34",
    text: "What is your experience with credit risk assessment in banking?",
  },
  {
    id: "35",
    text: "How do you approach stress testing for financial institutions?",
  },
  {
    id: "36",
    text: "What are the biggest challenges in regulatory compliance for banks?",
  },
];

export default function ScreeningQuestionsPanel({
  questions = mockQuestions,
  onAddQuestion,
  onImportQuestions,
  onDataChange,
}: ScreeningQuestionsPanelProps) {
  const { campaignData, saveCampaign, isNewCampaign } = useCampaign();
  const [currentQuestions, setCurrentQuestions] = useState<ScreeningQuestion[]>(questions);
  const [newQuestionText, setNewQuestionText] = useState("");
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [hoveredQuestionId, setHoveredQuestionId] = useState<string | null>(null);
  const [addingSubQuestionTo, setAddingSubQuestionTo] = useState<string | null>(null);
  const [newSubQuestionText, setNewSubQuestionText] = useState("");

  // Load campaign data when it becomes available (but not while editing a question)
  useEffect(() => {
    if (campaignData && campaignData.screeningQuestions && !editingQuestionId) {
      setCurrentQuestions(campaignData.screeningQuestions as ScreeningQuestion[]);
    }
  }, [campaignData, editingQuestionId]);

  // Auto-save helper for existing campaigns
  const autoSave = async (newQuestions: ScreeningQuestion[]) => {
    if (!isNewCampaign && campaignData?.id) {
      try {
        console.log('Auto-saving campaign after screening questions change...');
        await saveCampaign({ screeningQuestions: newQuestions });
      } catch (error) {
        console.error('Failed to auto-save campaign:', error);
      }
    }
  };

  const handleAddQuestion = async () => {
    if (newQuestionText.trim()) {
      const newQuestion: ScreeningQuestion = {
        id: Date.now().toString(),
        text: newQuestionText.trim(),
      };
      const newQuestions = [...currentQuestions, newQuestion];
      console.log('ScreeningQuestions data change (add):', newQuestions);
      setCurrentQuestions(newQuestions);
      setNewQuestionText("");
      onAddQuestion?.(newQuestion);
      onDataChange?.(newQuestions);
      await autoSave(newQuestions);
    }
  };

  const _handleImportQuestions = () => {
    onImportQuestions?.();
  };

  const handleEditQuestion = (questionId: string) => {
    const question = currentQuestions.find(q => q.id === questionId);
    if (question) {
      setEditingQuestionId(questionId);
      setEditingText(question.text);
    }
  };

  const handleSaveEdit = async () => {
    if (editingQuestionId && editingText.trim()) {
      const newQuestions = currentQuestions.map(q => 
        q.id === editingQuestionId 
          ? { ...q, text: editingText.trim() }
          : q
      );
      setCurrentQuestions(newQuestions);
      setEditingQuestionId(null);
      setEditingText("");
      onDataChange?.(newQuestions);
      await autoSave(newQuestions);
    }
  };

  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setEditingText("");
  };

  const handleDeleteQuestion = async (questionId: string) => {
    const newQuestions = currentQuestions.filter(q => q.id !== questionId);
    setCurrentQuestions(newQuestions);
    onDataChange?.(newQuestions);
    await autoSave(newQuestions);
  };

  // Sub-question handlers
  const handleAddSubQuestion = async (parentId: string) => {
    if (newSubQuestionText.trim()) {
      const newSubQuestion: ScreeningQuestion = {
        id: Date.now().toString(),
        text: newSubQuestionText.trim(),
        subQuestions: []
      };
      
      const newQuestions = currentQuestions.map(q => {
        if (q.id === parentId) {
          return {
            ...q,
            subQuestions: [...(q.subQuestions || []), newSubQuestion]
          };
        }
        return q;
      });
      
      setCurrentQuestions(newQuestions);
      setNewSubQuestionText("");
      setAddingSubQuestionTo(null);
      onDataChange?.(newQuestions);
      await autoSave(newQuestions);
    }
  };

  const handleEditSubQuestionStart = (parentId: string, subQuestionId: string) => {
    // Find the parent question
    const parentQuestion = currentQuestions.find(q => q.id === parentId);
    if (parentQuestion) {
      // Find the sub-question within the parent
      const subQuestion = parentQuestion.subQuestions?.find(sq => sq.id === subQuestionId);
      if (subQuestion) {
        setEditingQuestionId(subQuestionId);
        setEditingText(subQuestion.text);
      }
    }
  };

  const handleEditSubQuestion = async (parentId: string, subQuestionId: string, newText: string) => {
    const newQuestions = currentQuestions.map(q => {
      if (q.id === parentId) {
        return {
          ...q,
          subQuestions: (q.subQuestions || []).map(sq => 
            sq.id === subQuestionId ? { ...sq, text: newText } : sq
          )
        };
      }
      return q;
    });
    
    setCurrentQuestions(newQuestions);
    onDataChange?.(newQuestions);
    await autoSave(newQuestions);
  };

  const handleDeleteSubQuestion = async (parentId: string, subQuestionId: string) => {
    const newQuestions = currentQuestions.map(q => {
      if (q.id === parentId) {
        return {
          ...q,
          subQuestions: (q.subQuestions || []).filter(sq => sq.id !== subQuestionId)
        };
      }
      return q;
    });
    
    setCurrentQuestions(newQuestions);
    onDataChange?.(newQuestions);
    await autoSave(newQuestions);
  };

  return (
    <div className="card h-full w-full flex flex-col overflow-hidden pb-0 px-3 pt-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-title font-semibold text-light-text dark:text-dark-text">
          Screening questions
        </h3>
      </div>

      <div className="flex-1 min-h-0 overflow-auto px-1 p-1">
        {/* Add Question Input */}
        <div className="flex justify-between gap-2 mb-2">
          <input
            type="text"
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            placeholder="Enter your question..."
            className="w-full px-2 py-1 text-body  dark:bg-dark-background-secondary border border-light-border dark:border-dark-border rounded-md text-light-text dark:text-dark-text placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleAddQuestion();
              }
            }}
          />
          
          {/* Add another question button */}
          <button
            onClick={handleAddQuestion}
            disabled={!newQuestionText.trim()}
            className="flex items-center gap-2 px-3 py-2 border border-light-border dark:border-dark-border bg-primary-500 hover:bg-primary-600 text-white text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          {/* Existing Questions */}
          {currentQuestions.map((question) => (
            <div 
              key={question.id} 
              className="group relative space-y-2"
              onMouseEnter={() => setHoveredQuestionId(question.id)}
              onMouseLeave={() => setHoveredQuestionId(null)}
            >
              <div>
                {editingQuestionId === question.id ? (
                  // Edit mode
                  <div className="p-1 dark:bg-dark-background-secondary rounded-md dark:border-dark-border">
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      className="w-full px-2 py-1 text-body  dark:bg-dark-background-secondary border border-light-border dark:border-dark-border rounded-md text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleSaveEdit();
                        } else if (e.key === "Escape") {
                          handleCancelEdit();
                        }
                      }}
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleSaveEdit}
                        className="px-2 py-1 bg-primary-500 hover:bg-primary-600 text-white text-xs rounded transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display mode
                  <div className="p-1 rounded-md dark:border-dark-border group/parent relative">
                    <div className="flex items-start gap-2">
                      <Circle className="w-3.5 h-3.5 mt-1 text-primary-500 flex-shrink-0" />
                      <p className="text-body-md text-light-text dark:text-dark-text">
                        {question.text}
                      </p>
                    </div>
                    {/* Hover buttons - only when hovering parent question area */}
                    <div className="absolute top-1 right-1 opacity-0 group-hover/parent:opacity-100 transition-opacity duration-200 flex gap-1">
                      <button
                        onClick={() => handleEditQuestion(question.id)}
                        className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                        title="Edit question"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                        title="Delete question"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    
                    {/* Add Sub-Question Button moved below sub-questions for top-to-bottom flow */}
                  </div>
                )}
              </div>

              {/* Sub-Questions */}
              {question.subQuestions && question.subQuestions.length > 0 && (
                <div className="ml-4 border-l-2 border-light-border dark:border-dark-border pl-3">
                  {question.subQuestions.map((subQuestion) => (
                    <div key={subQuestion.id} className="group/subq relative">
                      {editingQuestionId === subQuestion.id ? (
                        // Edit mode for sub-question
                        <div className="p-1 rounded-md">
                          <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full px-2 py-1 text-body-sm dark:bg-dark-background-secondary border border-light-border dark:border-dark-border rounded-md text-light-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                handleEditSubQuestion(question.id, subQuestion.id, editingText);
                                setEditingQuestionId(null);
                                setEditingText("");
                              } else if (e.key === "Escape") {
                                handleCancelEdit();
                              }
                            }}
                            autoFocus
                          />
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => {
                                handleEditSubQuestion(question.id, subQuestion.id, editingText);
                                setEditingQuestionId(null);
                                setEditingText("");
                              }}
                              className="px-2 py-1 bg-primary-500 hover:bg-primary-600 text-white text-xs rounded transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // Display mode for sub-question
                        <div className="p-1 rounded-md relative">
                          <div className="flex items-start gap-2">
                            <Dot className="w-4 h-4 mt-0.5 text-primary-400 flex-shrink-0" />
                            <p className="text-body-sm text-light-text-secondary dark:text-dark-text-secondary">
                              {subQuestion.text}
                            </p>
                          </div>
                          {/* Hover buttons for sub-questions - only when hovering sub-question line */}
                          <div className="absolute top-1 right-1 opacity-0 group-hover/subq:opacity-100 transition-opacity duration-200 flex gap-1">
                            <button
                              onClick={() => handleEditSubQuestionStart(question.id, subQuestion.id)}
                              className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                              title="Edit sub-question"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubQuestion(question.id, subQuestion.id)}
                              className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                              title="Delete sub-question"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add Sub-Question Button placed below the list (visible on hover across the whole block) */}
              {hoveredQuestionId === question.id && addingSubQuestionTo !== question.id && (
                <div className="ml-6 pl-3 mt-1">
                  <button
                    onClick={() => setAddingSubQuestionTo(question.id)}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-primary-500 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Add Sub-Question
                  </button>
                </div>
              )}

              {/* Add Sub-Question Input */}
              {addingSubQuestionTo === question.id && (
                <div className="ml-6 border-l-2 border-light-border dark:border-dark-border pl-3">
                  <div className="space-y-2 p-2 rounded-md">
                    <input
                      type="text"
                      value={newSubQuestionText}
                      onChange={(e) => setNewSubQuestionText(e.target.value)}
                      placeholder="Enter sub-question..."
                      className="w-full px-2 py-1 text-body-sm dark:bg-dark-background-secondary border border-light-border dark:border-dark-border rounded-md text-light-text dark:text-dark-text placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleAddSubQuestion(question.id);
                        } else if (e.key === "Escape") {
                          setAddingSubQuestionTo(null);
                          setNewSubQuestionText("");
                        }
                      }}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddSubQuestion(question.id)}
                        disabled={!newSubQuestionText.trim()}
                        className="px-2 py-1 bg-primary-500 hover:bg-primary-600 text-white text-xs rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setAddingSubQuestionTo(null);
                          setNewSubQuestionText("");
                        }}
                        className="px-2 py-1 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
