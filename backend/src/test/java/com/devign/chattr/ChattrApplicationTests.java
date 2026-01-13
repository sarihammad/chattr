package com.devign.chattr;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
    "jwt.secret=test-secret-key-for-context-loading-test",
    "jwt.expiration=3600000",
    "spring.datasource.url=jdbc:h2:mem:testdb;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.show-sql=false",
    "spring.redis.host=localhost",
    "spring.redis.port=6379",
    "spring.redis.timeout=2000ms",
    "spring.data.redis.repositories.enabled=false",
    "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.data.redis.RedisRepositoriesAutoConfiguration"
})
class ChattrApplicationTests {

	@Test
	void contextLoads() {
		// Test passes if context loads successfully
	}

}
