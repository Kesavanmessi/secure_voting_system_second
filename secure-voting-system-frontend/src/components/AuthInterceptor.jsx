import { useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const AuthInterceptor = () => {
    const navigate = useNavigate();
    const { logoutAdmin, logoutVoter, admin, voter } = useContext(AuthContext);

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    // Check if it's a token expiry message
                    // Assuming backend sends 401 for expiry

                    if (admin) {
                        logoutAdmin();
                        navigate('/admin-login');
                    } else if (voter) {
                        logoutVoter();
                        navigate('/voter-login');
                    } else {
                        // Default fallback
                        logoutAdmin();
                        logoutVoter();
                        navigate('/');
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, [navigate, logoutAdmin, logoutVoter, admin, voter]);

    return null;
};

export default AuthInterceptor;
