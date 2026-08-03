const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/jwt");


const AppError = require("../utils/AppError");

const userModel = require("../models/userModel");
const roleModel = require("../models/roleModel");


const registerUser = async (userData) => {

    console.log("2. Service Started");

    const {
        fullName,
        email,
        password,
        phone,
    } = userData;

    console.log("3. Before findUserByEmail");

    const existingUser = await userModel.findUserByEmail(email);

    console.log("4. After findUserByEmail");

    const role = await roleModel.findRoleByName("employee");

    console.log("5. After findRoleByName");

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("6. Password Hashed");

    const user = await userModel.createUser({
        roleId: role.role_id,
        fullName,
        email,
        password: hashedPassword,
        phone,
    });

    console.log("7. User Created");

    return user;
};

const loginUser = async ({ email, password }) => {

    // Find User
    const user = await userModel.findUserByEmail(email);

    if (!user) {
        throw new AppError("Invalid email or password.", 401);
    }

    // Check Account Status
    if (!user.is_active) {
        throw new AppError("Your account has been deactivated.", 403);
    }

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new AppError("Invalid email or password.", 401);
    }

    // Generate JWT
    const token = generateToken({
    userId: user.user_id,
    roleId: user.role_id,
    role: user.role_name,
});
    //update last login
    await userModel.updateLastLogin(user.user_id);
    // Remove Password
    const { password: _, ...safeUser } = user;

    return {
        token,
        user: safeUser,
    };
};
module.exports = {
    registerUser,
    loginUser,
};