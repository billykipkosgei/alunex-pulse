const bcrypt = require('bcryptjs');

const generateHash = async () => {
    const password = 'admin123'; // Change this if you want a different password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('\n================================');
    console.log('Password:', password);
    console.log('Hashed Password:', hashedPassword);
    console.log('================================\n');

    console.log('Copy the document below and insert it into MongoDB:\n');

    const userDocument = {
        name: "Admin User",
        email: "admin@alunex.in",
        password: hashedPassword,
        role: "admin",
        isActive: true,
        preferences: {
            theme: "light",
            notifications: {
                email: true,
                push: true
            }
        },
        avatar: "",
        phone: "",
        timezone: "UTC",
        country: "",
        createdAt: new Date(),
        updatedAt: new Date()
    };

    console.log(JSON.stringify(userDocument, null, 2));
};

generateHash();
