package com.namhatta;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
public class DatabaseConnectivityTest {

    @Autowired
    private DataSource dataSource;

    @Test
    public void testDatabaseConnection() {
        assertNotNull(dataSource, "DataSource should be configured");
        
        try (Connection conn = dataSource.getConnection()) {
            assertNotNull(conn, "Connection should be established");
            assertTrue(conn.isValid(5), "Connection should be valid");
            
            // Test a simple query
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT 1 as test")) {
                assertTrue(rs.next(), "Query should return a result");
                assertEquals(1, rs.getInt("test"), "Query should return 1");
            }
            
            System.out.println("✓ Database connection successful!");
            System.out.println("  URL: " + conn.getMetaData().getURL());
            System.out.println("  Driver: " + conn.getMetaData().getDriverName());
            System.out.println("  Database: " + conn.getCatalog());
            
        } catch (Exception e) {
            fail("Database connection failed: " + e.getMessage());
        }
    }
}
