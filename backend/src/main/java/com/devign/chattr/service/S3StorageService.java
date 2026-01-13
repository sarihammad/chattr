package com.devign.chattr.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class S3StorageService {

    @Autowired
    private AmazonS3 s3Client;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    public String getBucketName() {
        return bucketName;
    }

    public String uploadFile(MultipartFile file) throws IOException {
        if (!isValidFile(file)) {
            throw new IllegalArgumentException("Invalid file");
        }

        String fileName = generateUniqueFileName(file.getOriginalFilename());
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentType(file.getContentType());
        metadata.setContentLength(file.getSize());

        s3Client.putObject(new PutObjectRequest(
                bucketName,
                fileName,
                file.getInputStream(),
                metadata
        ));

        return s3Client.getUrl(bucketName, fileName).toString();
    }

    public void deleteFile(String fileUrl) {
        String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
        s3Client.deleteObject(bucketName, fileName);
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
} 