package com.devign.chattr;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

/**
 * Context loading test is disabled as it requires full infrastructure setup.
 * Integration tests in the integration package provide better coverage.
 */
@Disabled("Requires full infrastructure - use integration tests instead")
class ChattrApplicationTests {

	@Test
	void contextLoads() {
		// Test passes if context loads successfully
		// Disabled - use integration tests for full context validation
	}

}
