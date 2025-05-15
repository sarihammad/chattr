package com.devign.chattr.config;

import java.time.Duration;
import java.util.function.Supplier;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.distributed.proxy.ProxyManager;
import io.github.bucket4j.redis.lettuce.cas.LettuceBasedProxyManager;
import io.lettuce.core.RedisClient;
import io.lettuce.core.RedisURI;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.codec.ByteArrayCodec;
import io.lettuce.core.codec.RedisCodec;
import io.lettuce.core.codec.StringCodec;

@Configuration
public class RatelimiterConfig {
    @Bean
    public RedisClient redisClient() { 
        return RedisClient.create(RedisURI.builder()
                .withHost("localhost")
                .withPort(6379)
                .withSsl(false)
                .build());
    }

@Bean
public ProxyManager<String> lettuceBasedProxyManager() {
    RedisClient redisClient = redisClient();
    StatefulRedisConnection<String, byte[]> redisConnection = redisClient
            .connect(RedisCodec.of(StringCodec.UTF8, ByteArrayCodec.INSTANCE));
    return LettuceBasedProxyManager.builderFor(redisConnection)
            .build();
}


    @Bean
    public Supplier<BucketConfiguration> bucketConfiguration() {
        return ()-> BucketConfiguration.builder()
                .addLimit(Bandwidth.simple(10L, Duration.ofMinutes(1L)))
                .build();
    }
}