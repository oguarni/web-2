const axios = require('axios');
const db = require('./config/db_sequelize');
const { connectDB } = require('./config/db_mongoose');
const mongoose = require('mongoose');

// Test configuration
const BASE_URL = 'http://localhost:8081';
const API_URL = `${BASE_URL}/api`;

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
    log(`✓ ${message}`, colors.green);
}

function error(message) {
    log(`✗ ${message}`, colors.red);
}

function info(message) {
    log(`ℹ ${message}`, colors.blue);
}

function warn(message) {
    log(`⚠ ${message}`, colors.yellow);
}

function section(message) {
    log(`\n=== ${message} ===`, colors.cyan);
}

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let testResults = [];

// Auth tokens for different user types
let adminToken = null;
let managerToken = null;
let clientToken = null;

// Test data
let testSpace = null;
let testUser = null;
let testReservation = null;
let testAmenity = null;

// Helper function to make authenticated requests
async function makeRequest(method, endpoint, data = null, token = null) {
    const config = {
        method,
        url: `${API_URL}${endpoint}`,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        ...(data && { data })
    };

    try {
        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (err) {
        return { 
            success: false, 
            error: err.response?.data || err.message, 
            status: err.response?.status || 500 
        };
    }
}

// Test function wrapper
async function runTest(testName, testFunc) {
    totalTests++;
    try {
        const result = await testFunc();
        if (result.success) {
            passedTests++;
            success(`${testName}: ${result.message || 'PASSED'}`);
        } else {
            failedTests++;
            error(`${testName}: ${result.message || 'FAILED'}`);
        }
        testResults.push({ name: testName, passed: result.success, message: result.message });
    } catch (err) {
        failedTests++;
        error(`${testName}: ERROR - ${err.message}`);
        testResults.push({ name: testName, passed: false, message: err.message });
    }
}

// Authentication tests
async function testAuthentication() {
    section('AUTHENTICATION TESTS');

    // Test successful login for admin
    await runTest('Admin Login', async () => {
        const response = await makeRequest('POST', '/auth/login', {
            login: 'admin',
            senha: 'admin123'
        });
        if (response.success && response.data.token) {
            adminToken = response.data.token;
            return { success: true, message: 'Admin login successful' };
        }
        return { success: false, message: 'Admin login failed' };
    });

    // Test successful login for manager
    await runTest('Manager Login', async () => {
        const response = await makeRequest('POST', '/auth/login', {
            login: 'gestor',
            senha: 'gestor123'
        });
        if (response.success && response.data.token) {
            managerToken = response.data.token;
            return { success: true, message: 'Manager login successful' };
        }
        return { success: false, message: 'Manager login failed' };
    });

    // Test successful login for client
    await runTest('Client Login', async () => {
        const response = await makeRequest('POST', '/auth/login', {
            login: 'usuario',
            senha: 'usuario123'
        });
        if (response.success && response.data.token) {
            clientToken = response.data.token;
            return { success: true, message: 'Client login successful' };
        }
        return { success: false, message: 'Client login failed' };
    });

    // Test invalid credentials
    await runTest('Invalid Login', async () => {
        const response = await makeRequest('POST', '/auth/login', {
            login: 'invalid',
            senha: 'invalid'
        });
        if (!response.success && response.status === 401) {
            return { success: true, message: 'Invalid login correctly rejected' };
        }
        return { success: false, message: 'Invalid login should return 401' };
    });

    // Test auth verification
    await runTest('Auth Verification', async () => {
        const response = await makeRequest('GET', '/auth/verify', null, adminToken);
        if (response.success && response.data.user) {
            return { success: true, message: 'Auth verification successful' };
        }
        return { success: false, message: 'Auth verification failed' };
    });

    // Test accessing protected route without token
    await runTest('Unauthorized Access', async () => {
        const response = await makeRequest('GET', '/usuarios');
        if (!response.success && response.status === 401) {
            return { success: true, message: 'Unauthorized access correctly rejected' };
        }
        return { success: false, message: 'Should require authentication' };
    });
}

// User management tests
async function testUserManagement() {
    section('USER MANAGEMENT TESTS');

    // Test get all users (admin)
    await runTest('Get All Users (Admin)', async () => {
        const response = await makeRequest('GET', '/usuarios', null, adminToken);
        if (response.success && Array.isArray(response.data.data)) {
            return { success: true, message: `Found ${response.data.data.length} users` };
        }
        return { success: false, message: 'Failed to get users' };
    });

    // Test get all users (manager)
    await runTest('Get All Users (Manager)', async () => {
        const response = await makeRequest('GET', '/usuarios', null, managerToken);
        if (response.success && Array.isArray(response.data.data)) {
            return { success: true, message: 'Manager can access users' };
        }
        return { success: false, message: 'Manager should access users' };
    });

    // Test get all users (client - should fail)
    await runTest('Get All Users (Client)', async () => {
        const response = await makeRequest('GET', '/usuarios', null, clientToken);
        if (!response.success && response.status === 403) {
            return { success: true, message: 'Client correctly denied access' };
        }
        return { success: false, message: 'Client should be denied access' };
    });

    // Test create user (admin)
    await runTest('Create User (Admin)', async () => {
        const response = await makeRequest('POST', '/usuarios', {
            nome: 'Test User',
            login: 'testuser',
            senha: 'testpass123',
            tipo: 2
        }, adminToken);
        if (response.success && response.data.data) {
            testUser = response.data.data;
            return { success: true, message: 'User created successfully' };
        }
        return { success: false, message: 'Failed to create user' };
    });

    // Test create user with duplicate login
    await runTest('Create Duplicate User', async () => {
        const response = await makeRequest('POST', '/usuarios', {
            nome: 'Duplicate User',
            login: 'testuser',
            senha: 'testpass123',
            tipo: 2
        }, adminToken);
        if (!response.success && response.status === 409) {
            return { success: true, message: 'Duplicate user correctly rejected' };
        }
        return { success: false, message: 'Duplicate user should be rejected' };
    });

    // Test get specific user
    if (testUser) {
        await runTest('Get Specific User', async () => {
            const response = await makeRequest('GET', `/usuarios/${testUser.id}`, null, adminToken);
            if (response.success && response.data.data.id === testUser.id) {
                return { success: true, message: 'User retrieved successfully' };
            }
            return { success: false, message: 'Failed to get specific user' };
        });

        // Test update user
        await runTest('Update User', async () => {
            const response = await makeRequest('PUT', `/usuarios/${testUser.id}`, {
                nome: 'Updated Test User'
            }, adminToken);
            if (response.success && response.data.data.nome === 'Updated Test User') {
                return { success: true, message: 'User updated successfully' };
            }
            return { success: false, message: 'Failed to update user' };
        });
    }

    // Test get non-existent user
    await runTest('Get Non-existent User', async () => {
        const response = await makeRequest('GET', '/usuarios/99999', null, adminToken);
        if (!response.success && response.status === 404) {
            return { success: true, message: 'Non-existent user correctly returns 404' };
        }
        return { success: false, message: 'Non-existent user should return 404' };
    });
}

// Space management tests
async function testSpaceManagement() {
    section('SPACE MANAGEMENT TESTS');

    // Test get all spaces
    await runTest('Get All Spaces', async () => {
        const response = await makeRequest('GET', '/espacos', null, adminToken);
        if (response.success && Array.isArray(response.data.data)) {
            return { success: true, message: `Found ${response.data.data.length} spaces` };
        }
        return { success: false, message: 'Failed to get spaces' };
    });

    // Test create space (admin)
    await runTest('Create Space (Admin)', async () => {
        const uniqueName = `Test Space ${Date.now()}`;
        const response = await makeRequest('POST', '/espacos', {
            nome: uniqueName,
            descricao: 'Test Description',
            capacidade: 50,
            localizacao: 'Test Location',
            equipamentos: 'Test Equipment'
        }, adminToken);
        if (response.success && response.data.data) {
            testSpace = response.data.data;
            return { success: true, message: 'Space created successfully' };
        }
        return { success: false, message: 'Failed to create space' };
    });

    // Test create space (client - should fail)
    await runTest('Create Space (Client)', async () => {
        const response = await makeRequest('POST', '/espacos', {
            nome: 'Client Space',
            descricao: 'Client Description',
            capacidade: 30,
            localizacao: 'Client Location'
        }, clientToken);
        if (!response.success && response.status === 403) {
            return { success: true, message: 'Client correctly denied space creation' };
        }
        return { success: false, message: 'Client should be denied space creation' };
    });

    // Test create space with invalid data
    await runTest('Create Space (Invalid Data)', async () => {
        const response = await makeRequest('POST', '/espacos', {
            nome: 'Invalid Space',
            capacidade: -5, // Invalid capacity
            localizacao: 'Test Location'
        }, adminToken);
        if (!response.success && response.status === 400) {
            return { success: true, message: 'Invalid space data correctly rejected' };
        }
        return { success: false, message: 'Invalid space data should be rejected' };
    });

    // Test get specific space
    if (testSpace) {
        await runTest('Get Specific Space', async () => {
            const response = await makeRequest('GET', `/espacos/${testSpace.id}`, null, adminToken);
            if (response.success && response.data.data.id === testSpace.id) {
                return { success: true, message: 'Space retrieved successfully' };
            }
            return { success: false, message: 'Failed to get specific space' };
        });

        // Test update space
        await runTest('Update Space', async () => {
            const response = await makeRequest('PUT', `/espacos/${testSpace.id}`, {
                nome: 'Updated Test Space',
                capacidade: 75
            }, adminToken);
            if (response.success && response.data.data.nome === 'Updated Test Space') {
                return { success: true, message: 'Space updated successfully' };
            }
            return { success: false, message: 'Failed to update space' };
        });

        // Test check space availability
        await runTest('Check Space Availability', async () => {
            const startDate = new Date();
            const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
            
            const response = await makeRequest('GET', `/espacos/${testSpace.id}/disponibilidade?dataInicio=${startDate.toISOString()}&dataFim=${endDate.toISOString()}`, null, adminToken);
            if (response.success && response.data.data.hasOwnProperty('available')) {
                return { success: true, message: 'Space availability checked successfully' };
            }
            return { success: false, message: 'Failed to check space availability' };
        });
    }

    // Test get filtered spaces
    await runTest('Get Filtered Spaces', async () => {
        const response = await makeRequest('GET', '/espacos?ativo=true', null, adminToken);
        if (response.success && Array.isArray(response.data.data)) {
            return { success: true, message: 'Filtered spaces retrieved successfully' };
        }
        return { success: false, message: 'Failed to get filtered spaces' };
    });
}

// Reservation management tests
async function testReservationManagement() {
    section('RESERVATION MANAGEMENT TESTS');

    // Test get all reservations
    await runTest('Get All Reservations', async () => {
        const response = await makeRequest('GET', '/reservas', null, adminToken);
        if (response.success && Array.isArray(response.data.data)) {
            return { success: true, message: `Found ${response.data.data.length} reservations` };
        }
        return { success: false, message: 'Failed to get reservations' };
    });

    // Test create reservation (client)
    if (testSpace) {
        await runTest('Create Reservation (Client)', async () => {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() + 1); // Tomorrow
            const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
            
            const response = await makeRequest('POST', '/reservas', {
                titulo: 'Test Reservation',
                dataInicio: startDate.toISOString(),
                dataFim: endDate.toISOString(),
                descricao: 'Test Description',
                espacoId: testSpace.id
            }, clientToken);
            
            if (response.success && response.data.data) {
                testReservation = response.data.data;
                return { success: true, message: 'Reservation created successfully' };
            }
            return { success: false, message: 'Failed to create reservation' };
        });
    }

    // Test create conflicting reservation
    if (testSpace && testReservation) {
        await runTest('Create Conflicting Reservation', async () => {
            const response = await makeRequest('POST', '/reservas', {
                titulo: 'Conflicting Reservation',
                dataInicio: testReservation.dataInicio,
                dataFim: testReservation.dataFim,
                descricao: 'Conflicting Description',
                espacoId: testSpace.id
            }, clientToken);
            
            if (!response.success && response.status === 409) {
                return { success: true, message: 'Conflicting reservation correctly rejected' };
            }
            return { success: false, message: 'Conflicting reservation should be rejected' };
        });
    }

    // Test get specific reservation
    if (testReservation) {
        await runTest('Get Specific Reservation', async () => {
            const response = await makeRequest('GET', `/reservas/${testReservation.id}`, null, clientToken);
            if (response.success && response.data.data.id === testReservation.id) {
                return { success: true, message: 'Reservation retrieved successfully' };
            }
            return { success: false, message: 'Failed to get specific reservation' };
        });

        // Test update reservation
        await runTest('Update Reservation', async () => {
            const response = await makeRequest('PUT', `/reservas/${testReservation.id}`, {
                titulo: 'Updated Test Reservation'
            }, clientToken);
            if (response.success && response.data.data.titulo === 'Updated Test Reservation') {
                return { success: true, message: 'Reservation updated successfully' };
            }
            return { success: false, message: 'Failed to update reservation' };
        });

        // Test update reservation status (admin only)
        await runTest('Update Reservation Status (Admin)', async () => {
            const response = await makeRequest('PUT', `/reservas/${testReservation.id}/status`, {
                status: 'confirmada'
            }, adminToken);
            if (response.success && response.data.data.status === 'confirmada') {
                return { success: true, message: 'Reservation status updated successfully' };
            }
            return { success: false, message: 'Failed to update reservation status' };
        });
    }

    // Test create reservation with invalid space
    await runTest('Create Reservation (Invalid Space)', async () => {
        const startDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
        const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
        
        const response = await makeRequest('POST', '/reservas', {
            titulo: 'Invalid Space Reservation',
            dataInicio: startDate.toISOString(),
            dataFim: endDate.toISOString(),
            descricao: 'Invalid Description',
            espacoId: 99999
        }, clientToken);
        
        if (!response.success && response.status === 404) {
            return { success: true, message: 'Invalid space reservation correctly rejected' };
        }
        return { success: false, message: 'Invalid space reservation should be rejected' };
    });
}

// Amenity management tests
async function testAmenityManagement() {
    section('AMENITY MANAGEMENT TESTS');

    // Test get all amenities
    await runTest('Get All Amenities', async () => {
        const response = await makeRequest('GET', '/amenities', null, adminToken);
        if (response.success && Array.isArray(response.data.data)) {
            return { success: true, message: `Found ${response.data.data.length} amenities` };
        }
        return { success: false, message: 'Failed to get amenities' };
    });

    // Test create amenity (admin)
    await runTest('Create Amenity (Admin)', async () => {
        const response = await makeRequest('POST', '/amenities', {
            nome: 'Test Amenity',
            descricao: 'Test Amenity Description'
        }, adminToken);
        if (response.success && response.data.data) {
            testAmenity = response.data.data;
            return { success: true, message: 'Amenity created successfully' };
        }
        return { success: false, message: 'Failed to create amenity' };
    });

    // Test create amenity (client - should fail)
    await runTest('Create Amenity (Client)', async () => {
        const response = await makeRequest('POST', '/amenities', {
            nome: 'Client Amenity',
            descricao: 'Client Amenity Description'
        }, clientToken);
        if (!response.success && response.status === 403) {
            return { success: true, message: 'Client correctly denied amenity creation' };
        }
        return { success: false, message: 'Client should be denied amenity creation' };
    });

    // Test get specific amenity
    if (testAmenity) {
        await runTest('Get Specific Amenity', async () => {
            const response = await makeRequest('GET', `/amenities/${testAmenity.id}`, null, adminToken);
            if (response.success && response.data.data.id === testAmenity.id) {
                return { success: true, message: 'Amenity retrieved successfully' };
            }
            return { success: false, message: 'Failed to get specific amenity' };
        });

        // Test update amenity
        await runTest('Update Amenity', async () => {
            const response = await makeRequest('PUT', `/amenities/${testAmenity.id}`, {
                nome: 'Updated Test Amenity'
            }, adminToken);
            if (response.success && response.data.data.nome === 'Updated Test Amenity') {
                return { success: true, message: 'Amenity updated successfully' };
            }
            return { success: false, message: 'Failed to update amenity' };
        });

        // Test associate amenity with space
        if (testSpace) {
            await runTest('Associate Amenity with Space', async () => {
                const response = await makeRequest('POST', `/espacos/${testSpace.id}/amenities`, {
                    amenityId: testAmenity.id
                }, adminToken);
                if (response.success) {
                    return { success: true, message: 'Amenity associated with space successfully' };
                }
                return { success: false, message: 'Failed to associate amenity with space' };
            });

            // Test remove amenity from space
            await runTest('Remove Amenity from Space', async () => {
                const response = await makeRequest('DELETE', `/espacos/${testSpace.id}/amenities/${testAmenity.id}`, null, adminToken);
                if (response.success) {
                    return { success: true, message: 'Amenity removed from space successfully' };
                }
                return { success: false, message: 'Failed to remove amenity from space' };
            });
        }
    }
}

// Log management tests
async function testLogManagement() {
    section('LOG MANAGEMENT TESTS');

    // Test get all logs (admin only)
    await runTest('Get All Logs (Admin)', async () => {
        const response = await makeRequest('GET', '/logs', null, adminToken);
        if (response.success && Array.isArray(response.data.data)) {
            return { success: true, message: `Found ${response.data.data.length} logs` };
        }
        return { success: false, message: 'Failed to get logs' };
    });

    // Test get logs (client - should fail)
    await runTest('Get Logs (Client)', async () => {
        const response = await makeRequest('GET', '/logs', null, clientToken);
        if (!response.success && response.status === 403) {
            return { success: true, message: 'Client correctly denied log access' };
        }
        return { success: false, message: 'Client should be denied log access' };
    });

    // Test create log (admin)
    await runTest('Create Log (Admin)', async () => {
        const uniqueTimestamp = new Date().toISOString();
        const logData = {
            usuarioId: 1, // Use the guaranteed admin user ID
            acao: `test_action_${uniqueTimestamp}`,
            level: 'info',
            message: `Test log message created at ${uniqueTimestamp}`
        };
        
        const response = await makeRequest('POST', '/logs', logData, adminToken);
        if (response.success && response.data.http_code === 201) {
            return { success: true, message: 'Log created successfully' };
        }
        return { success: false, message: 'Failed to create log' };
    });

    // Test get log stats
    await runTest('Get Log Stats', async () => {
        const response = await makeRequest('GET', '/logs/stats', null, adminToken);
        if (response.success && response.data.data) {
            return { success: true, message: 'Log stats retrieved successfully' };
        }
        return { success: false, message: 'Failed to get log stats' };
    });
}

// Edge case tests
async function testEdgeCases() {
    section('EDGE CASE TESTS');

    // Test malformed JSON
    await runTest('Malformed JSON', async () => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, 'invalid json', {
                headers: { 'Content-Type': 'application/json' }
            });
            return { success: false, message: 'Malformed JSON should be rejected' };
        } catch (err) {
            if (err.response?.status === 400) {
                return { success: true, message: 'Malformed JSON correctly rejected' };
            }
            return { success: false, message: 'Unexpected error handling malformed JSON' };
        }
    });

    // Test empty request body
    await runTest('Empty Request Body', async () => {
        const response = await makeRequest('POST', '/auth/login', {});
        if (!response.success && response.status === 400) {
            return { success: true, message: 'Empty request body correctly rejected' };
        }
        return { success: false, message: 'Empty request body should be rejected' };
    });

    // Test invalid route
    await runTest('Invalid Route', async () => {
        const response = await makeRequest('GET', '/invalid-route', null, adminToken);
        if (!response.success && response.status === 404) {
            return { success: true, message: 'Invalid route correctly returns 404' };
        }
        return { success: false, message: 'Invalid route should return 404' };
    });

    // Test SQL injection attempt
    await runTest('SQL Injection Attempt', async () => {
        const response = await makeRequest('GET', '/usuarios/1; DROP TABLE usuarios;--', null, adminToken);
        if (!response.success && response.status === 400) {
            return { success: true, message: 'SQL injection attempt correctly rejected' };
        }
        return { success: false, message: 'SQL injection attempt should be rejected' };
    });

    // Test XSS attempt
    await runTest('XSS Attempt on User Creation and Retrieval', async () => {
        // Stage 1: Create a NEW user with a malicious payload
        const maliciousName = 'XSS User <script>alert("pwned")</script>';
        const uniqueLogin = `xss_test_user_${Date.now()}`; // Unique and valid login

        const createUserResponse = await makeRequest('POST', '/usuarios', {
            nome: maliciousName,
            login: uniqueLogin,
            senha: 'ValidPassword123!',
            tipo: 2 // Assuming '2' is a standard user type
        }, adminToken);

        if (!createUserResponse.success || createUserResponse.data.http_code !== 201) {
            // This will give a clear error if the user creation fails
            return { success: false, message: `Failed to create user for XSS test. Reason: ${JSON.stringify(createUserResponse.error)}` };
        }

        const newUserId = createUserResponse.data.data.id;

        // Stage 2: Retrieve the newly created user and verify sanitization
        const getUserResponse = await makeRequest('GET', `/usuarios/${newUserId}`, null, adminToken);

        // Cleanup: Always attempt to delete the user, even if assertion fails
        await makeRequest('DELETE', `/usuarios/${newUserId}`, null, adminToken);

        if (!getUserResponse.success) {
            return { success: false, message: 'Failed to retrieve user for XSS verification.' };
        }

        const retrievedName = getUserResponse.data.data.nome;
        const expectedSanitizedName = 'XSS User &lt;script&gt;alert("pwned")&lt;/script&gt;';

        // The core assertion: check if the name was properly escaped
        if (retrievedName === expectedSanitizedName) {
            return { success: true, message: 'XSS attempt was correctly sanitized.' };
        }
        
        return { success: false, message: `XSS sanitization failed. Expected: ${expectedSanitizedName}, but got: ${retrievedName}` };
    });
}

// Cleanup test data
async function cleanupTestData() {
    section('CLEANUP TEST DATA');

    // Delete test reservation
    if (testReservation) {
        await runTest('Delete Test Reservation', async () => {
            const response = await makeRequest('DELETE', `/reservas/${testReservation.id}`, null, adminToken);
            if (response.success) {
                return { success: true, message: 'Test reservation deleted successfully' };
            }
            return { success: false, message: 'Failed to delete test reservation' };
        });
    }

    // Delete test amenity
    if (testAmenity) {
        await runTest('Delete Test Amenity', async () => {
            const response = await makeRequest('DELETE', `/amenities/${testAmenity.id}`, null, adminToken);
            if (response.success) {
                return { success: true, message: 'Test amenity deleted successfully' };
            }
            return { success: false, message: 'Failed to delete test amenity' };
        });
    }

    // Delete test space
    if (testSpace) {
        await runTest('Delete Test Space', async () => {
            const response = await makeRequest('DELETE', `/espacos/${testSpace.id}`, null, adminToken);
            if (response.success) {
                return { success: true, message: 'Test space deleted successfully' };
            }
            return { success: false, message: 'Failed to delete test space' };
        });
    }

    // Delete test user
    if (testUser) {
        await runTest('Delete Test User', async () => {
            const response = await makeRequest('DELETE', `/usuarios/${testUser.id}`, null, adminToken);
            if (response.success) {
                return { success: true, message: 'Test user deleted successfully' };
            }
            return { success: false, message: 'Failed to delete test user' };
        });
    }
}

// Main test runner
async function runAllTests() {
    log('\n🧪 COMPREHENSIVE API ROUTE TESTING', colors.cyan);
    log('='.repeat(50), colors.cyan);

    try {
        // Initialize database connections
        await db.sequelize.authenticate();
        await connectDB();
        info('Database connections established');

        // Wait for server to be ready
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Run all test suites
        await testAuthentication();
        await testUserManagement();
        await testSpaceManagement();
        await testReservationManagement();
        await testAmenityManagement();
        await testLogManagement();
        await testEdgeCases();
        await cleanupTestData();

        // Print summary
        section('TEST SUMMARY');
        log(`Total Tests: ${totalTests}`, colors.blue);
        log(`Passed: ${passedTests}`, colors.green);
        log(`Failed: ${failedTests}`, colors.red);
        log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`, colors.cyan);

        if (failedTests > 0) {
            log('\n❌ FAILED TESTS:', colors.red);
            testResults.filter(r => !r.passed).forEach(test => {
                log(`  • ${test.name}: ${test.message}`, colors.red);
            });
        }

        if (passedTests === totalTests) {
            log('\n🎉 ALL TESTS PASSED! 🎉', colors.green);
        } else if (passedTests >= totalTests * 0.8) {
            log('\n⚠️  MOST TESTS PASSED ⚠️', colors.yellow);
        } else {
            log('\n❌ MANY TESTS FAILED ❌', colors.red);
        }

    } catch (error) {
        error(`Test suite error: ${error.message}`);
    } finally {
        // Close database connections
        try {
            await db.sequelize.close();
            await mongoose.connection.close();
            process.exit(0);
        } catch (err) {
            console.error('Error closing connections:', err);
            process.exit(1);
        }
    }
}

// Check if server is running
async function checkServerStatus() {
    try {
        await axios.get(`${BASE_URL}/api-docs`);
        return true;
    } catch (error) {
        return false;
    }
}

// Start tests
(async () => {
    const isServerRunning = await checkServerStatus();
    if (!isServerRunning) {
        error('Server is not running. Please start the server first with "npm start"');
        process.exit(1);
    }
    
    await runAllTests();
})();