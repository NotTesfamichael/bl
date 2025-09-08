#!/bin/bash

echo "Creating a new user..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "ERROR: .env file not found. Please run setup-production.sh first"
    exit 1
fi

# Function to prompt for user details
prompt_user_details() {
    echo ""
    echo "Please provide user details:"
    echo ""
    
    # User email
    read -p "User email: " USER_EMAIL
    while [ -z "$USER_EMAIL" ]; do
        echo "ERROR: User email is required"
        read -p "User email: " USER_EMAIL
    done
    
    # User password
    read -s -p "User password: " USER_PASSWORD
    while [ -z "$USER_PASSWORD" ]; do
        echo ""
        echo "ERROR: User password is required"
        read -s -p "User password: " USER_PASSWORD
    done
    echo ""
    
    # User name
    read -p "User name (default: User): " USER_NAME
    USER_NAME=${USER_NAME:-User}
    
    # User role
    echo "Select user role:"
    echo "1) AUTHOR"
    echo "2) ADMIN"
    read -p "Enter choice (1-2): " ROLE_CHOICE
    
    case $ROLE_CHOICE in
        1) USER_ROLE="AUTHOR" ;;
        2) USER_ROLE="ADMIN" ;;
        *) echo "ERROR: Invalid choice, defaulting to AUTHOR"; USER_ROLE="AUTHOR" ;;
    esac
    
    echo "User details collected"
}

# Function to create user in database
create_user() {
    echo "Creating user in database..."
    
    # Create a temporary .env file with user credentials
    cat > .env.user << EOF
# User creation credentials (temporary - will be removed after creation)
SEED_USER_EMAIL=${USER_EMAIL}
SEED_USER_PASSWORD=${USER_PASSWORD}
SEED_USER_NAME=${USER_NAME}
SEED_USER_ROLE=${USER_ROLE}
EOF
    
    # Run the user creation script
    docker exec -e SEED_USER_EMAIL="${USER_EMAIL}" \
                -e SEED_USER_PASSWORD="${USER_PASSWORD}" \
                -e SEED_USER_NAME="${USER_NAME}" \
                -e SEED_USER_ROLE="${USER_ROLE}" \
                notes-blog-backend node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUser() {
  try {
    const email = process.env.SEED_USER_EMAIL;
    const password = process.env.SEED_USER_PASSWORD;
    const name = process.env.SEED_USER_NAME;
    const role = process.env.SEED_USER_ROLE;

    if (!email || !password) {
      console.error('ERROR: Email and password are required');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.error('ERROR: User with this email already exists');
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role
      }
    });

    console.log('User created successfully:');
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  Role:', user.role);
    console.log('  ID:', user.id);
  } catch (error) {
    console.error('ERROR: Error creating user:', error.message);
    process.exit(1);
  } finally {
    await prisma.\$disconnect();
  }
}

createUser();
"
    
    # Cleanup
    rm -f .env.user
    echo "User creation completed"
}

# Main execution
main() {
    prompt_user_details
    create_user
    
    echo ""
    echo "User creation completed successfully!"
    echo ""
    echo "User Details:"
    echo "  Email: ${USER_EMAIL}"
    echo "  Name: ${USER_NAME}"
    echo "  Role: ${USER_ROLE}"
    echo ""
    echo "Login at: http://localhost:3000/login"
}

# Run main function
main
