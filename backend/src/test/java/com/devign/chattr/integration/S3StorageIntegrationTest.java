package com.devign.chattr.integration;

import com.devign.chattr.service.S3StorageService;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Tag("integration")
public class S3StorageIntegrationTest {

    @Autowired
    private S3StorageService s3StorageService;

    @Test
    public void testFileUploadAndDelete() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
            "test.jpg",
            "test.jpg",
            "image/jpeg",
            "test image content".getBytes()
        );

        String fileUrl = s3StorageService.uploadFile(file);
        assertNotNull(fileUrl);
        assertTrue(fileUrl.contains(s3StorageService.getBucketName()));

        s3StorageService.deleteFile(fileUrl);
    }

    @Test
    public void testInvalidFileType() {
        MockMultipartFile file = new MockMultipartFile(
            "test.exe",
            "test.exe",
            "application/x-msdownload",
            "test content".getBytes()
        );

        assertThrows(IllegalArgumentException.class, () -> {
            s3StorageService.uploadFile(file);
        });
    }

    @Test
    public void testFileSizeLimit() {
        byte[] largeContent = new byte[11 * 1024 * 1024]; // 11MB
        MockMultipartFile file = new MockMultipartFile(
            "large.jpg",
            "large.jpg",
            "image/jpeg",
            largeContent
        );

        assertThrows(IllegalArgumentException.class, () -> {
            s3StorageService.uploadFile(file);
        });
    }
} 
