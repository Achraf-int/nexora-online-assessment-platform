package com.nexora.assessment.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "exam_attempts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String examId;

    @Column(nullable = false)
    private String examTitle;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String userName;

    @Column(nullable = false)
    private String userEmail;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @Column(nullable = false)
    private Integer timeSpentSeconds;

    @Column(columnDefinition = "TEXT")
    private String answersJson; // questionId -> optionId

    @Column(nullable = false)
    private Integer score;

    @Column(nullable = false)
    private Integer maxScore;

    @Column(nullable = false)
    private Double percentage;

    @Column(nullable = false)
    private Boolean passed;

    @Column(nullable = false)
    private Integer passingScorePercentage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    public enum Status {
        IN_PROGRESS, SUBMITTED, EXPIRED
    }
}
