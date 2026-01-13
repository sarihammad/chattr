'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { getApiUrl, getAuthHeaders } from '@/lib/api';

interface ProfileData {
  name: string;
  age: number | null;
  gender: string;
  orientation: string;
  seeking: string;
  city: string;
  country: string;
}

export default function Onboarding() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    age: null,
    gender: '',
    orientation: '',
    seeking: '',
    city: '',
    country: '',
  });

  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<number, string>>({});
  const [prompts, setPrompts] = useState<Record<string, string>>({
    prompt1: '',
    prompt2: '',
    prompt3: '',
  });

  interface Question {
    id: number;
    text: string;
    type: string;
    options: string[];
    weight: number;
    displayOrder: number;
  }

  const [questions, setQuestions] = useState<Question[]>([]);

  // Fetch questions on step 3
  useEffect(() => {
    if (step === 3 && questions.length === 0) {
      fetch(`${getApiUrl()}/api/v1/questionnaire`, {
        headers: getAuthHeaders(),
      })
        .then(res => res.json())
        .then(data => setQuestions(data))
        .catch(console.error);
    }
  }, [step, questions.length]);

  const handleNext = async () => {
    if (step === 1) {
      // Validate profile basics
      if (!profile.name || !profile.age || !profile.gender || !profile.orientation || !profile.seeking) {
        alert('Please fill in all required fields');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // Save profile
      setLoading(true);
      try {
        const response = await fetch(`${getApiUrl()}/api/v1/user/me`, {
          method: 'PUT',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: session?.user?.name || profile.name,
            age: profile.age,
            gender: profile.gender,
            orientation: profile.orientation,
            seeking: profile.seeking,
            city: profile.city,
            country: profile.country,
          }),
        });
        if (response.ok) {
          setStep(3);
        }
      } catch (error) {
        console.error('Error saving profile:', error);
      } finally {
        setLoading(false);
      }
    } else if (step === 3) {
      // Validate questionnaire
      if (Object.keys(questionnaireAnswers).length < questions.length) {
        alert('Please answer all questions');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      // Complete onboarding
      setLoading(true);
      try {
        // Submit questionnaire answers
        await fetch(`${getApiUrl()}/api/v1/questionnaire/answers`, {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            answers: Object.entries(questionnaireAnswers).map(([questionId, answerValue]) => ({
              questionId: parseInt(questionId),
              answerValue,
            })),
          }),
        });

        // Submit prompts
        await fetch(`${getApiUrl()}/api/v1/prompts`, {
          method: 'PUT',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompts: Object.entries(prompts).map(([promptKey, text]) => ({
              promptKey,
              text,
            })),
          }),
        });

        router.push('/introductions');
      } catch (error) {
        console.error('Error completing onboarding:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step {step} of 4</span>
            <span className="text-sm text-gray-500">{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-rose-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Let&apos;s get started</h2>
                <p className="text-gray-600">Tell us a bit about yourself</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  value={profile.age || ''}
                  onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Your age"
                  min="18"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="M">Man</option>
                  <option value="F">Woman</option>
                  <option value="NB">Non-binary</option>
                  <option value="O">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orientation *
                </label>
                <select
                  value={profile.orientation}
                  onChange={(e) => setProfile({ ...profile, orientation: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="STRAIGHT">Straight</option>
                  <option value="GAY">Gay</option>
                  <option value="BISEXUAL">Bisexual</option>
                  <option value="PANSEXUAL">Pansexual</option>
                  <option value="ASEXUAL">Asexual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seeking *
                </label>
                <select
                  value={profile.seeking}
                  onChange={(e) => setProfile({ ...profile, seeking: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                >
                  <option value="">Select...</option>
                  <option value="MEN">Men</option>
                  <option value="WOMEN">Women</option>
                  <option value="EVERYONE">Everyone</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={profile.country}
                    onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Values & lifestyle</h2>
                <p className="text-gray-600">Help us understand what matters to you</p>
              </div>
              <div className="text-center py-8">
                <p className="text-gray-500">Profile saved. Moving to questionnaire...</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Values questionnaire</h2>
                <p className="text-gray-600">Answer these questions to help us find better matches</p>
              </div>

              <div className="space-y-8 max-h-[500px] overflow-y-auto">
                {questions.map((question) => (
                  <div key={question.id}>
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      {question.text}
                    </label>
                    {question.type === 'MULTIPLE_CHOICE' && (
                      <div className="space-y-2">
                        {question.options.map((option: string, idx: number) => (
                          <label key={idx} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              value={option}
                              checked={questionnaireAnswers[question.id] === option}
                              onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, [question.id]: e.target.value })}
                              className="text-rose-500"
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    {question.type === 'SCALE' && (
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">1</span>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={questionnaireAnswers[question.id] || '5'}
                          onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, [question.id]: e.target.value })}
                          className="flex-1"
                        />
                        <span className="text-sm text-gray-500">10</span>
                        <span className="text-sm font-medium text-gray-700 w-8 text-center">
                          {questionnaireAnswers[question.id] || '5'}
                        </span>
                      </div>
                    )}
                    {question.type === 'TEXT' && (
                      <textarea
                        value={questionnaireAnswers[question.id] || ''}
                        onChange={(e) => setQuestionnaireAnswers({ ...questionnaireAnswers, [question.id]: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        rows={3}
                        placeholder="Your answer..."
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Your prompts</h2>
                <p className="text-gray-600">Share a bit more about yourself (optional)</p>
              </div>

              <div className="space-y-4">
                {['prompt1', 'prompt2', 'prompt3'].map((key) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prompt {key.slice(-1)}
                    </label>
                    <textarea
                      value={prompts[key]}
                      onChange={(e) => setPrompts({ ...prompts, [key]: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      rows={3}
                      placeholder="Tell us something about yourself..."
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{step === 4 ? 'Complete' : 'Next'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {step === 4 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            <CheckCircle2 className="h-5 w-5 text-green-500 inline-block mr-2" />
            You&apos;ll receive 1–3 introductions per day
          </div>
        )}
      </div>
    </div>
  );
}

