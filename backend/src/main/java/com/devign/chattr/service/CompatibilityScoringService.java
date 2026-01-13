package com.devign.chattr.service;

import com.devign.chattr.model.QuestionnaireAnswer;
import com.devign.chattr.model.QuestionnaireQuestion;
import com.devign.chattr.model.User;
import com.devign.chattr.repository.QuestionnaireAnswerRepository;
import com.devign.chattr.repository.PromptRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class CompatibilityScoringService {

    @Autowired
    private QuestionnaireAnswerRepository answerRepository;

    @Autowired
    private PromptRepository promptRepository;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Compute compatibility score between two users based on questionnaire answers.
     * Returns score between 0.0 and 1.0.
     */
    public double computeCompatibilityScore(User user1, User user2) {
        List<QuestionnaireAnswer> answers1 = answerRepository.findByUser(user1);
        List<QuestionnaireAnswer> answers2 = answerRepository.findByUser(user2);

        if (answers1.isEmpty() || answers2.isEmpty()) {
            return 0.0;
        }

        // Build map of questionId -> answer for user2
        Map<Long, QuestionnaireAnswer> answerMap2 = answers2.stream()
                .collect(Collectors.toMap(
                        a -> a.getQuestion().getId(),
                        a -> a
                ));

        double totalWeight = 0.0;
        double weightedScore = 0.0;

        for (QuestionnaireAnswer answer1 : answers1) {
            QuestionnaireAnswer answer2 = answerMap2.get(answer1.getQuestion().getId());
            if (answer2 == null) {
                continue; // Skip if user2 hasn't answered this question
            }

            QuestionnaireQuestion question = answer1.getQuestion();
            double weight = question.getWeight() != null ? question.getWeight() : 1.0;
            double questionScore = computeQuestionScore(answer1, answer2, question);

            totalWeight += weight;
            weightedScore += weight * questionScore;
        }

        if (totalWeight == 0.0) {
            return 0.0;
        }

        return weightedScore / totalWeight;
    }

    /**
     * Compute match reasons (top contributing factors) for display to user.
     */
    public Map<String, Object> computeMatchReasons(User user1, User user2) {
        List<QuestionnaireAnswer> answers1 = answerRepository.findByUser(user1);
        List<QuestionnaireAnswer> answers2 = answerRepository.findByUser(user2);

        if (answers1.isEmpty() || answers2.isEmpty()) {
            return Map.of(
                    "signals", List.of(),
                    "reasons", List.of("Complete your questionnaire to get better matches")
            );
        }

        Map<Long, QuestionnaireAnswer> answerMap2 = answers2.stream()
                .collect(Collectors.toMap(
                        a -> a.getQuestion().getId(),
                        a -> a
                ));

        List<Map<String, Object>> contributingFactors = new ArrayList<>();

        for (QuestionnaireAnswer answer1 : answers1) {
            QuestionnaireAnswer answer2 = answerMap2.get(answer1.getQuestion().getId());
            if (answer2 == null) continue;

            QuestionnaireQuestion question = answer1.getQuestion();
            double questionScore = computeQuestionScore(answer1, answer2, question);
            double weight = question.getWeight() != null ? question.getWeight() : 1.0;

            if (questionScore >= 0.7) { // Only include strong matches
                contributingFactors.add(Map.of(
                        "question", question.getText(),
                        "alignment", questionScore,
                        "weight", weight
                ));
            }
        }

        // Sort by (score * weight) descending
        contributingFactors.sort((a, b) -> {
            double scoreA = (double) a.get("alignment") * (double) a.get("weight");
            double scoreB = (double) b.get("alignment") * (double) b.get("weight");
            return Double.compare(scoreB, scoreA);
        });

        // Get top 3 signals
        List<String> topSignals = contributingFactors.stream()
                .limit(3)
                .map(f -> (String) f.get("question"))
                .collect(Collectors.toList());

        // Generate human-readable reasons
        List<String> reasons = new ArrayList<>();
        if (!topSignals.isEmpty()) {
            reasons.add("Shared values: " + String.join(", ", topSignals));
        }
        if (contributingFactors.size() >= 3) {
            reasons.add("Strong compatibility across multiple areas");
        }

        // Get shared interests from prompts (simple text matching)
        List<String> sharedInterests = findSharedInterests(user1, user2);
        if (!sharedInterests.isEmpty()) {
            reasons.add("Common interests: " + String.join(", ", sharedInterests));
        }

        if (reasons.isEmpty()) {
            reasons.add("Potential match based on compatibility");
        }

        try {
            return Map.of(
                    "signals", topSignals,
                    "reasons", reasons,
                    "contributingFactors", contributingFactors.size()
            );
        } catch (Exception e) {
            log.error("Error building match reasons", e);
            return Map.of(
                    "signals", topSignals,
                    "reasons", reasons
            );
        }
    }

    private double computeQuestionScore(QuestionnaireAnswer answer1, QuestionnaireAnswer answer2, QuestionnaireQuestion question) {
        String type = question.getType();
        
        try {
            if ("MULTIPLE_CHOICE".equals(type) || "SCALE".equals(type)) {
                // For multiple choice or scale, exact match = 1.0, partial = 0.5, different = 0.0
                String value1 = answer1.getAnswerValue();
                String value2 = answer2.getAnswerValue();
                
                if (value1.equals(value2)) {
                    return 1.0;
                }
                
                // For scales, compute proximity (e.g., "7" vs "8" is close)
                if ("SCALE".equals(type)) {
                    try {
                        int v1 = Integer.parseInt(value1);
                        int v2 = Integer.parseInt(value2);
                        int diff = Math.abs(v1 - v2);
                        // Assume 10-point scale, 0 difference = 1.0, 10 difference = 0.0
                        return Math.max(0.0, 1.0 - (diff / 10.0));
                    } catch (NumberFormatException e) {
                        return value1.equals(value2) ? 1.0 : 0.0;
                    }
                }
                
                return 0.0;
            } else if ("TEXT".equals(type)) {
                // For text, simple keyword matching (basic implementation)
                String text1 = answer1.getAnswerValue().toLowerCase();
                String text2 = answer2.getAnswerValue().toLowerCase();
                
                // Simple word overlap
                Set<String> words1 = new HashSet<>(Arrays.asList(text1.split("\\s+")));
                Set<String> words2 = new HashSet<>(Arrays.asList(text2.split("\\s+")));
                
                words1.retainAll(words2); // Intersection
                int commonWords = words1.size();
                int totalWords = Math.max(
                        text1.split("\\s+").length,
                        text2.split("\\s+").length
                );
                
                return totalWords > 0 ? Math.min(1.0, commonWords / (double) totalWords) : 0.0;
            }
        } catch (Exception e) {
            log.warn("Error computing question score", e);
        }
        
        return 0.0;
    }

    private List<String> findSharedInterests(User user1, User user2) {
        // Simple implementation: extract keywords from prompts and bio
        Set<String> interests1 = extractKeywords(user1);
        Set<String> interests2 = extractKeywords(user2);
        
        interests1.retainAll(interests2); // Intersection
        return new ArrayList<>(interests1);
    }

    private Set<String> extractKeywords(User user) {
        Set<String> keywords = new HashSet<>();
        
        if (user.getBio() != null && !user.getBio().isEmpty()) {
            // Simple: extract common interest words
            String[] commonInterests = {"music", "coding", "travel", "coffee", "gym", "reading", "gaming", 
                                       "cooking", "hiking", "photography", "art", "movies", "books"};
            String bioLower = user.getBio().toLowerCase();
            for (String interest : commonInterests) {
                if (bioLower.contains(interest)) {
                    keywords.add(interest);
                }
            }
        }
        
        // Extract from prompts
        promptRepository.findByUser(user).forEach(prompt -> {
            if (prompt.getText() != null) {
                String textLower = prompt.getText().toLowerCase();
                String[] commonInterests = {"music", "coding", "travel", "coffee", "gym", "reading", "gaming",
                                           "cooking", "hiking", "photography", "art", "movies", "books"};
                for (String interest : commonInterests) {
                    if (textLower.contains(interest)) {
                        keywords.add(interest);
                    }
                }
            }
        });
        
        return keywords;
    }
}

