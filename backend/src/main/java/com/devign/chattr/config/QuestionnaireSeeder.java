package com.devign.chattr.config;

import com.devign.chattr.model.QuestionnaireQuestion;
import com.devign.chattr.repository.QuestionnaireQuestionRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import java.util.Arrays;
import java.util.List;

@Configuration
@Slf4j
public class QuestionnaireSeeder {

    @Bean
    @Order(1)
    public CommandLineRunner seedQuestionnaire(QuestionnaireQuestionRepository repository, ObjectMapper objectMapper) {
        return args -> {
            if (repository.count() > 0) {
                log.info("Questionnaire questions already exist, skipping seed");
                return;
            }

            log.info("Seeding questionnaire questions...");

            List<QuestionnaireQuestion> questions = Arrays.asList(
                // Values & Lifestyle
                createMultipleChoice(
                    1, "What matters most to you in a relationship?", 1.5,
                    Arrays.asList("Trust and honesty", "Shared interests", "Emotional connection", "Independence", "Growth together")
                ),
                createMultipleChoice(
                    2, "How do you prefer to spend your weekends?", 1.0,
                    Arrays.asList("Outdoors and adventure", "Relaxing at home", "Socializing with friends", "Exploring new places", "Pursuing hobbies")
                ),
                createScale(
                    3, "How important is it that your partner shares your political views?", 1.2,
                    1, 10
                ),
                createMultipleChoice(
                    4, "What's your ideal date night?", 1.0,
                    Arrays.asList("Dinner and conversation", "Active adventure", "Cultural event", "Cozy night in", "Something spontaneous")
                ),
                createScale(
                    5, "How important is religion or spirituality in your life?", 1.0,
                    1, 10
                ),

                // Communication & Conflict
                createMultipleChoice(
                    6, "How do you handle disagreements?", 1.3,
                    Arrays.asList("Talk it out immediately", "Need time to process first", "Prefer to avoid conflict", "Find a compromise quickly", "Seek outside perspective")
                ),
                createScale(
                    7, "How often do you need alone time?", 1.0,
                    1, 10
                ),
                createMultipleChoice(
                    8, "What's your communication style?", 1.2,
                    Arrays.asList("Direct and straightforward", "Thoughtful and careful", "Expressive and emotional", "Reserved and private", "Adaptive to the situation")
                ),

                // Lifestyle & Habits
                createMultipleChoice(
                    9, "How do you feel about pets?", 1.0,
                    Arrays.asList("Love them, have/want pets", "Like them but don't have any", "Neutral", "Prefer no pets", "Allergic")
                ),
                createScale(
                    10, "How important is fitness and health to you?", 1.0,
                    1, 10
                ),
                createMultipleChoice(
                    11, "What's your relationship with social media?", 1.0,
                    Arrays.asList("Very active", "Moderately active", "Rarely use it", "Don't use it", "It's complicated")
                ),
                createScale(
                    12, "How important is work-life balance?", 1.2,
                    1, 10
                ),

                // Future & Goals
                createMultipleChoice(
                    13, "Where do you see yourself in 5 years?", 1.3,
                    Arrays.asList("Same city, established career", "Traveling or exploring", "Starting a family", "Pursuing new opportunities", "Living more simply")
                ),
                createMultipleChoice(
                    14, "How do you feel about long-term commitment?", 1.5,
                    Arrays.asList("Ready and looking for it", "Open to it with the right person", "Not sure yet", "Prefer to take things slow", "Not interested right now")
                ),
                createScale(
                    15, "How important is financial stability?", 1.2,
                    1, 10
                ),

                // Interests & Hobbies
                createText(
                    16, "What's a hobby or interest you're passionate about?", 1.0
                ),
                createMultipleChoice(
                    17, "How do you prefer to travel?", 1.0,
                    Arrays.asList("Planned itineraries", "Spontaneous adventures", "Luxury and comfort", "Budget and backpacking", "Don't travel much")
                ),
                createMultipleChoice(
                    18, "What's your ideal social setting?", 1.0,
                    Arrays.asList("Large groups and parties", "Small intimate gatherings", "One-on-one conversations", "Mix of both", "Prefer solitude")
                ),

                // Personality & Values
                createScale(
                    19, "How important is it that your partner has similar values?", 1.5,
                    1, 10
                ),
                createMultipleChoice(
                    20, "What energizes you most?", 1.0,
                    Arrays.asList("Social interactions", "Quiet reflection", "Creative projects", "Physical activity", "Learning new things")
                ),
                createText(
                    21, "What's something you value in yourself that you'd want a partner to appreciate?", 1.2
                ),
                createScale(
                    22, "How important is it to share similar life goals?", 1.3,
                    1, 10
                ),

                // Relationship Style
                createMultipleChoice(
                    23, "How do you express affection?", 1.0,
                    Arrays.asList("Words of affirmation", "Physical touch", "Quality time", "Acts of service", "Gifts")
                ),
                createMultipleChoice(
                    24, "What's your ideal relationship dynamic?", 1.2,
                    Arrays.asList("Very close, do everything together", "Independent but connected", "Partners in adventure", "Supportive but separate lives", "Still figuring it out")
                ),
                createText(
                    25, "What makes you feel most loved and appreciated?", 1.0
                )
            );

            repository.saveAll(questions);
            log.info("Seeded {} questionnaire questions", questions.size());
        };
    }

    private QuestionnaireQuestion createMultipleChoice(int order, String text, double weight, List<String> options) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            String optionsJson = mapper.writeValueAsString(options);
            
            return QuestionnaireQuestion.builder()
                    .text(text)
                    .type("MULTIPLE_CHOICE")
                    .options(optionsJson)
                    .weight(weight)
                    .displayOrder(order)
                    .build();
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error creating question", e);
        }
    }

    private QuestionnaireQuestion createScale(int order, String text, double weight, int min, int max) {
        return QuestionnaireQuestion.builder()
                .text(text)
                .type("SCALE")
                .weight(weight)
                .displayOrder(order)
                .build();
    }

    private QuestionnaireQuestion createText(int order, String text, double weight) {
        return QuestionnaireQuestion.builder()
                .text(text)
                .type("TEXT")
                .weight(weight)
                .displayOrder(order)
                .build();
    }
}

