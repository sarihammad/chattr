package com.devign.chattr.service;

import com.devign.chattr.model.Report;
import com.devign.chattr.model.User;
import com.devign.chattr.repository.ReportRepository;
import com.devign.chattr.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@Slf4j
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void reportUser(String reporterUsername, String reportedUsername, String reason) {
        User reporter = userRepository.findByUsername(reporterUsername)
                .orElseThrow(() -> new RuntimeException("User not found: " + reporterUsername));
        User reported = userRepository.findByUsername(reportedUsername)
                .orElseThrow(() -> new RuntimeException("User not found: " + reportedUsername));

        Report report = Report.builder()
                .reporter(reporter)
                .reported(reported)
                .reason(reason)
                .build();
        reportRepository.save(report);
    }
}


