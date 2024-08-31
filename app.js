import { supabase } from './supabaseClient.js';

// Handle Sign-Up
document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
    alert('Hello');
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
    });
    
    if (error) {
        alert('Error signing up: ' + error.message);
    } else {
        alert('Sign-up successful! Please check your email to confirm your account.');
    }
});

// Handle Log-In
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });
    
    if (error) {
        alert('Error logging in: ' + error.message);
    } else {
        alert('Login successful!');
        // You can now redirect the user or update the UI as needed
    }
});

// Track User Session
supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
        console.log('User is logged in:', session.user);
        // Update the UI to show logged-in state
    } else {
        console.log('User is logged out');
        // Update the UI to show logged-out state
    }
});

// Handle Log Out
document.getElementById('logout-button')?.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        alert('Error logging out: ' + error.message);
    } else {
        alert('Logged out successfully!');
        // Update the UI to reflect the logged-out state
    }
});
