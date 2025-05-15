package com.devign.chattr.aspect;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.distributed.proxy.ProxyManager;
import com.devign.chattr.config.RatelimiterConfig;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Component
@Aspect
public class RatelimiterAspect {
    private final RatelimiterConfig ratelimiterConfig;
    private final ProxyManager<String> proxyManager;

    public RatelimiterAspect(RatelimiterConfig ratelimiterConfig, ProxyManager<String> proxyManager) {
        this.ratelimiterConfig = ratelimiterConfig;
        this.proxyManager = proxyManager;
    }

    @Around("@annotation(com.devign.chattr.aspect.Ratelimited)")
    public Object ratelimit(ProceedingJoinPoint joinPoint) throws Throwable {
        HttpServletRequest request = ((ServletRequestAttributes) 
            RequestContextHolder.getRequestAttributes()).getRequest();
        HttpServletResponse response = ((ServletRequestAttributes) 
            RequestContextHolder.getRequestAttributes()).getResponse();
        
        String clientKey = request.getHeader("clientId");
        if (clientKey == null) {
            clientKey = request.getRemoteAddr() != null ? request.getRemoteAddr() : UUID.randomUUID().toString();
        }
        
        Bucket bucket = getOrCreateBucket(clientKey);

        if (bucket.tryConsume(1)) {
            return joinPoint.proceed();
        } else {
            if (response != null) {
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Rate limit exceeded. Try again later.\"}");
                response.getWriter().flush();
                response.getWriter().close();
            }
            return null; // Prevents further processing
        }
    }

    private Bucket getOrCreateBucket(String clientKey) {
        return proxyManager.builder()
                .build(clientKey, ratelimiterConfig.bucketConfiguration());
    }
}