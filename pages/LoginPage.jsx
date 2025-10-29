import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const auth = getAuth();

    const validateWiscEmail = (email) => {
        return email.toLowerCase().endsWith('@wisc.edu');
    };

    const handleLogin = async () => {
        if (!validateWiscEmail(email)) {
            Alert.alert('Error', 'Please use a valid @wisc.edu email');
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Navigation will be handled by Firebase Auth state listener
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    const handleSignup = async () => {
        if (!validateWiscEmail(email)) {
            Alert.alert('Error', 'Please use a valid @wisc.edu email');
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            // Navigation will be handled by Firebase Auth state listener
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>BadgerSwap</Text>
            
            <TextInput
                style={styles.input}
                placeholder="Email (@wisc.edu)"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleSignup}>
                <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 30,
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#c5050c',
        padding: 15,
        borderRadius: 5,
        marginBottom: 10,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

export default LoginPage;