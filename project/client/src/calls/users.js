const { axiosInstance } = require('./index');

// Register new User
export const RegisterUser = async (value) => {
    try {
        const response = await axiosInstance.post("api/users/register", value);
        return response.data;
    } catch (error) {
        console.error('RegisterUser Error:', error);
        throw error; // Re-throwing the error to handle it at a higher level
    }
}

// Login user
export const LoginUser = async (value) => {
    try {
        const response = await axiosInstance.post("api/users/login", value);
        return response.data;
    } catch (error) {
        console.error('LoginUser Error:', error);
        throw error; // Re-throwing the error to handle it at a higher level
    }
}

// Get current user from the frontend
export const GetCurrentUser = async () => {
    try {
        const response = await axiosInstance.get('api/users/get-current-user');
        return response.data;
    } catch (error) {
        console.error('GetCurrentUser Error:', error);
        throw error; // Re-throwing the error to handle it at a higher level
    }
}

// Forget and Reset Password
export const ForgetPassword = async (value) => {
    try {
        const response = await axiosInstance.patch("api/users/forgetpassword", value);
        return response.data;
    } catch (error) {
        console.error('ForgetPassword Error:', error);
        throw error; // Re-throwing the error to handle it at a higher level
    }
}

export const ResetPassword = async (value) => {
    try {
        const response = await axiosInstance.patch("api/users/resetpassword", value);
        return response.data;
    } catch (error) {
        console.error('ResetPassword Error:', error);
        throw error; // Re-throwing the error to handle it at a higher level
    }
}
