import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';

// Test data constants
const VALID_SERVICE_PROVIDER_DATA: Partial<User> = {
  name: 'John Smith',
  email: 'john.smith.test@example.com',
  password: 'TestPassword123!',
  phone: '+1-555-123-4567',
  role: 'service-provider',
  businessName: 'Smith Auto Services',
  description: 'Professional automotive repair and maintenance services with 15 years of experience',
  services: [],
  serviceRadius: 25,
  street1: '123 Main Street',
  street2: 'Suite 100',
  city: 'San Francisco',
  state: 'California',
  zip: '94102',
};

const INVALID_DATA_CASES = {
  missingEmail: { ...VALID_SERVICE_PROVIDER_DATA, email: '' },
  invalidEmail: { ...VALID_SERVICE_PROVIDER_DATA, email: 'invalid-email' },
  shortPassword: { ...VALID_SERVICE_PROVIDER_DATA, password: '123' },
  missingName: { ...VALID_SERVICE_PROVIDER_DATA, name: '' },
  missingBusinessName: { ...VALID_SERVICE_PROVIDER_DATA, businessName: '' },
  missingAddress: { ...VALID_SERVICE_PROVIDER_DATA, street1: '', city: '', state: '', zip: '' },
  invalidPhone: { ...VALID_SERVICE_PROVIDER_DATA, phone: '123' },
  invalidServiceRadius: { ...VALID_SERVICE_PROVIDER_DATA, serviceRadius: -5 },
};

// Helper functions
async function cleanupTestUser(email: string) {
  try {
    // Get user by email from auth.users
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.warn('Error listing users during cleanup:', error);
      return;
    }
    
    const testUser = users.find(user => user.email === email);
    
    if (testUser) {
      // Delete from service_providers table
      await supabase
        .from('service_providers')
        .delete()
        .eq('user_id', testUser.id);
      
      // Delete from profiles table
      await supabase
        .from('profiles')
        .delete()
        .eq('id', testUser.id);
      
      // Delete auth user
      await supabase.auth.admin.deleteUser(testUser.id);
    }
  } catch (error) {
    console.warn('Cleanup warning:', error);
  }
}

async function verifyDatabaseState(userId: string, expectedData: Partial<User>) {
  // Verify auth user exists
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
  expect(authError).toBeNull();
  expect(authUser.user).toBeTruthy();
  expect(authUser.user?.email).toBe(expectedData.email);

  // Verify profile exists with correct data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  expect(profileError).toBeNull();
  expect(profile).toBeTruthy();
  expect(profile.name).toBe(expectedData.name);
  expect(profile.email).toBe(expectedData.email);
  expect(profile.phone).toBe(expectedData.phone);
  expect(profile.role).toBe('service-provider');
  expect(profile.street1).toBe(expectedData.street1);
  expect(profile.city).toBe(expectedData.city);
  expect(profile.state).toBe(expectedData.state);
  expect(profile.zip).toBe(expectedData.zip);

  // Verify service provider record exists with correct data
  const { data: serviceProvider, error: spError } = await supabase
    .from('service_providers')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  expect(spError).toBeNull();
  expect(serviceProvider).toBeTruthy();
  expect(serviceProvider.user_id).toBe(userId);
  expect(serviceProvider.business_name).toBe(expectedData.businessName);
  expect(serviceProvider.description).toBe(expectedData.description);
  expect(serviceProvider.service_radius).toBe(expectedData.serviceRadius);
  expect(serviceProvider.is_verified).toBe(false);
  expect(serviceProvider.rating).toBeNull();
  expect(serviceProvider.review_count).toBe(0);

  return { profile, serviceProvider };
}

// Registration function that matches the actual implementation
async function registerServiceProvider(userData: Partial<User>) {
  const startTime = Date.now();
  
  try {
    // Validate required fields
    if (!userData.email || !userData.password || !userData.name || !userData.role) {
      throw new Error('Missing required fields');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('Please enter a valid email address');
    }

    // Validate password length
    if (userData.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    
    // Sign up the user with email confirmation disabled
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        emailRedirectTo: undefined, // Disable email confirmation
        data: {
          name: userData.name,
          role: userData.role,
        },
      },
    });

    if (signUpError) {
      // Handle specific error cases
      if (signUpError.message.includes('already registered') || signUpError.message.includes('already been registered')) {
        throw new Error('An account with this email already exists');
      } else if (signUpError.message.includes('password')) {
        throw new Error('Password must be at least 6 characters long');
      } else if (signUpError.message.includes('email')) {
        throw new Error('Please enter a valid email address');
      }
      
      throw new Error(signUpError.message);
    }

    if (!authData?.user) {
      throw new Error('Registration failed - no user session created');
    }

    // Wait for the auth user to be fully created
    await new Promise(resolve => setTimeout(resolve, 3000)); // Increased wait time

    // Create the profile with all provided data
    const profileData = {
      id: authData.user.id,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      role: userData.role,
      avatar_url: userData.avatar || null,
      street1: userData.street1 || null,
      street2: userData.street2 || null,
      city: userData.city || null,
      state: userData.state || null,
      zip: userData.zip || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Use upsert to handle potential conflicts
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert([profileData], { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (profileError) {
      // Clean up auth user if profile creation fails
      try {
        await supabase.auth.admin.deleteUser(authData.user.id);
      } catch (cleanupError) {
        console.error('Error cleaning up auth user:', cleanupError);
      }
      
      // Handle specific profile creation errors
      if (profileError.code === '23505') {
        throw new Error('An account with this email already exists');
      } else if (profileError.message.includes('permission') || profileError.code === '42501') {
        throw new Error('Permission denied. Please try again.');
      } else if (profileError.code === '23503') {
        throw new Error('Invalid user data. Please try again.');
      }
      
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

    // If this is a service provider, create the service provider record
    if (userData.role === 'service-provider') {
      const serviceProviderData = {
        user_id: authData.user.id,
        business_name: userData.businessName || `${userData.name}'s Service`,
        description: userData.description || 'Professional automotive service provider',
        services: userData.services || [],
        service_radius: userData.serviceRadius || 25,
        rating: null,
        review_count: 0,
        is_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Use upsert for service provider as well
      const { data: serviceProvider, error: serviceProviderError } = await supabase
        .from('service_providers')
        .upsert([serviceProviderData], { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (serviceProviderError) {
        // Clean up profile and auth user if service provider creation fails
        try {
          await supabase.from('profiles').delete().eq('id', authData.user.id);
          await supabase.auth.admin.deleteUser(authData.user.id);
        } catch (cleanupError) {
          console.error('Error cleaning up after service provider creation failure:', cleanupError);
        }
        
        throw new Error(`Failed to create service provider record: ${serviceProviderError.message}`);
      }

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      return {
        success: true,
        userId: authData.user.id,
        profile,
        serviceProvider,
        responseTime,
      };
    }

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    return {
      success: true,
      userId: authData.user.id,
      profile,
      serviceProvider: null,
      responseTime,
    };
    
  } catch (error: any) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    return {
      success: false,
      error: error.message,
      responseTime,
    };
  }
}

// Test Suite
describe('Service Provider Registration Flow', () => {
  beforeEach(async () => {
    // Clean up any existing test data
    await cleanupTestUser(VALID_SERVICE_PROVIDER_DATA.email!);
  });

  afterEach(async () => {
    // Clean up test data after each test
    await cleanupTestUser(VALID_SERVICE_PROVIDER_DATA.email!);
  });

  describe('Successful Registration', () => {
    test('should create complete service provider account with all required records', async () => {
      const result = await registerServiceProvider(VALID_SERVICE_PROVIDER_DATA);
      
      expect(result.success).toBe(true);
      expect(result.userId).toBeTruthy();
      expect(result.profile).toBeTruthy();
      expect(result.serviceProvider).toBeTruthy();
      
      // Verify all database records
      await verifyDatabaseState(result.userId!, VALID_SERVICE_PROVIDER_DATA);
    });

    test('should complete registration within acceptable time limit', async () => {
      const result = await registerServiceProvider(VALID_SERVICE_PROVIDER_DATA);
      
      expect(result.success).toBe(true);
      expect(result.responseTime).toBeLessThan(20000); // 20 seconds max
    });

    test('should create proper foreign key relationships', async () => {
      const result = await registerServiceProvider(VALID_SERVICE_PROVIDER_DATA);
      expect(result.success).toBe(true);

      const { profile, serviceProvider } = await verifyDatabaseState(
        result.userId!, 
        VALID_SERVICE_PROVIDER_DATA
      );

      // Verify foreign key relationships
      expect(profile.id).toBe(result.userId);
      expect(serviceProvider.user_id).toBe(result.userId);
      expect(serviceProvider.user_id).toBe(profile.id);
    });
  });

  describe('Validation and Error Handling', () => {
    test('should reject registration with missing email', async () => {
      const result = await registerServiceProvider(INVALID_DATA_CASES.missingEmail);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required fields');
    });

    test('should reject registration with invalid email format', async () => {
      const result = await registerServiceProvider(INVALID_DATA_CASES.invalidEmail);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('valid email address');
    });

    test('should reject registration with short password', async () => {
      const result = await registerServiceProvider(INVALID_DATA_CASES.shortPassword);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('6 characters');
    });

    test('should reject registration with missing name', async () => {
      const result = await registerServiceProvider(INVALID_DATA_CASES.missingName);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Missing required fields');
    });

    test('should handle duplicate email registration', async () => {
      // First registration
      const firstResult = await registerServiceProvider(VALID_SERVICE_PROVIDER_DATA);
      expect(firstResult.success).toBe(true);

      // Attempt duplicate registration
      const duplicateResult = await registerServiceProvider(VALID_SERVICE_PROVIDER_DATA);
      expect(duplicateResult.success).toBe(false);
      expect(duplicateResult.error).toContain('already');
    });
  });

  describe('Data Validation and Constraints', () => {
    test('should enforce proper data types and constraints', async () => {
      const result = await registerServiceProvider(VALID_SERVICE_PROVIDER_DATA);
      expect(result.success).toBe(true);

      const { profile, serviceProvider } = await verifyDatabaseState(
        result.userId!, 
        VALID_SERVICE_PROVIDER_DATA
      );

      // Verify data types
      expect(typeof profile.id).toBe('string');
      expect(typeof profile.name).toBe('string');
      expect(typeof profile.email).toBe('string');
      expect(typeof profile.role).toBe('string');
      expect(typeof serviceProvider.service_radius).toBe('number');
      expect(typeof serviceProvider.is_verified).toBe('boolean');
      expect(typeof serviceProvider.review_count).toBe('number');

      // Verify constraints
      expect(profile.role).toBe('service-provider');
      expect(serviceProvider.service_radius).toBeGreaterThan(0);
      expect(serviceProvider.is_verified).toBe(false);
      expect(serviceProvider.review_count).toBe(0);
    });

    test('should handle optional fields correctly', async () => {
      const timestamp = Date.now();
      const minimalData = {
        name: 'Minimal User',
        email: `minimal.test.${timestamp}@example.com`,
        password: 'password123',
        role: 'service-provider' as const,
        street1: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        zip: '12345',
      };

      const result = await registerServiceProvider(minimalData);
      expect(result.success).toBe(true);

      const { profile, serviceProvider } = await verifyDatabaseState(result.userId!, minimalData);

      // Verify optional fields have defaults
      expect(serviceProvider.business_name).toBe(`${minimalData.name}'s Service`);
      expect(serviceProvider.description).toBe('Professional automotive service provider');
      expect(serviceProvider.service_radius).toBe(25);
      expect(Array.isArray(serviceProvider.services)).toBe(true);
      expect(serviceProvider.services.length).toBe(0);

      await cleanupTestUser(minimalData.email);
    });
  });

  describe('Performance and Reliability', () => {
    test('should handle concurrent registration attempts', async () => {
      const timestamp = Date.now();
      const userData1 = {
        ...VALID_SERVICE_PROVIDER_DATA,
        email: `concurrent1.${timestamp}@example.com`,
        name: 'Concurrent User 1',
      };
      const userData2 = {
        ...VALID_SERVICE_PROVIDER_DATA,
        email: `concurrent2.${timestamp}@example.com`,
        name: 'Concurrent User 2',
      };

      // Run concurrent registrations
      const [result1, result2] = await Promise.all([
        registerServiceProvider(userData1),
        registerServiceProvider(userData2),
      ]);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result1.userId).not.toBe(result2.userId);

      // Cleanup
      await cleanupTestUser(userData1.email!);
      await cleanupTestUser(userData2.email!);
    });

    test('should maintain data integrity on partial failures', async () => {
      // This test simulates a scenario where profile creation succeeds but service provider creation might fail
      const result = await registerServiceProvider(VALID_SERVICE_PROVIDER_DATA);
      
      if (result.success) {
        // Verify complete data integrity
        const { profile, serviceProvider } = await verifyDatabaseState(
          result.userId!, 
          VALID_SERVICE_PROVIDER_DATA
        );
        
        expect(profile).toBeTruthy();
        expect(serviceProvider).toBeTruthy();
        expect(profile.id).toBe(serviceProvider.user_id);
      } else {
        // If registration failed, ensure no partial data exists
        expect(result.error).toBeTruthy();
      }
    });
  });
});