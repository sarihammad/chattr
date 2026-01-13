package com.devign.chattr.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    public String storeFile(MultipartFile file) throws IOException {
        if (!isValidFile(file)) {
            throw new IllegalArgumentException("Invalid file");
        }

        String fileName = generateUniqueFileName(file.getOriginalFilename());
        Path filePath = Paths.get(uploadDir, fileName);
        Files.createDirectories(filePath.getParent());
        Files.copy(file.getInputStream(), filePath);

        return fileName;
    }

    public void deleteFile(String fileName) throws IOException {
        Path filePath = Paths.get(uploadDir, fileName);
        Files.deleteIfExists(filePath);
    }

    private String generateUniqueFileName(String originalFileName) {
        String extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        return UUID.randomUUID().toString() + extension;
    }

    private boolean isValidFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return false;
        }
        return file.getSize() <= 10 * 1024 * 1024;
    }

    public boolean isValidFileType(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && (
            contentType.startsWith("image/") ||
            contentType.startsWith("video/") ||
            contentType.startsWith("audio/") ||
            contentType.equals("application/pdf")
        );
    }

    public boolean isValidFileSize(MultipartFile file) {
        return file.getSize() <= 10 * 1024 * 1024; // 10MB limit
    }
} 