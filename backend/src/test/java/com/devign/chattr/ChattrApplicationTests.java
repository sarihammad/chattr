package com.devign.chattr;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "jwt.secret=test-secret-key-for-context-loading-test",
    "jwt.expiration=3600000",
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.redis.host=localhost",
    "spring.redis.port=6379"
})
class ChattrApplicationTests {

	@Test
	void contextLoads() {
		// Test passes if context loads successfully
	}

}
