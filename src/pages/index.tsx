import { useState } from "react";
import DefaultLayout from "@/layouts/default";
import { Card, Input, Button, Spinner, Chip } from "@nextui-org/react";
import axiosInstance from '../utils/axiosInstance';
import Cookies from 'js-cookie';
import jwtState from '../utils/jwtState';
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";

export default function IndexPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent | React.KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      debugger

      const response = await axiosInstance.post(`/login`, { username, password });
      if (response.status !== 200) {
        setLoading(false);
        return setError(t('errorDuringLogin'));
      }
      debugger
      const token = response.data.token;
      Cookies.set('token', token, { expires: 1 }); // Save the token in a cookie with 1 day expiration
      jwtState.setExpired(false); // Reset the JWT expiration state

      // Attempt to connect to the archive server
      const archiveResponse = await loginToArchiveServer(username, password);

      if (archiveResponse.status === 200 && archiveResponse.token) {
        Cookies.set('archiveToken', archiveResponse.token, { expires: 1 });
        startTokenRefresh(username, password);
      }

      setLoading(false);
      navigate("/docs");
    } catch (error) {
      setLoading(false);
      setError(t('errorDuringLogin'));
      console.error(error);
    }
  };

  const loginToArchiveServer = async (username: string, password: string) => {
    try {
      const response = await axiosInstance.get(`/archive-login`, {
        params: { username, password },
      });

      if (response.status === 200 && response.data.token) {
        return { status: 200, token: response.data.token };
      } else {
        return { status: 401, error: "Authentication failed or no token received" };
      }
    } catch (error) {
      console.error("Login to archive server error:", error);
      return { status: 500, error: "Connection failed" };
    }
  };

  const startTokenRefresh = (username: string, password: string) => {
    setInterval(async () => {
      try {
        await refreshToken(username, password);
      } catch (error) {
        console.error("Error refreshing token:", error);
      }
    }, 18 * 60 * 1000); // Refresh every 18 minutes
  };

  const refreshToken = async (username: string, password: string) => {
    try {
      const response = await axiosInstance.get(`/archive-login`, {
        params: { username, password },
      });

      if (response.status === 200 && response.data.token) {
        console.log("New token received:", response.data.token);

        // Remove the existing token
        Cookies.remove('archiveToken');
        console.log("Existing token removed");

        // Set the new token
        Cookies.set('archiveToken', response.data.token, { expires: 1 });
        console.log("New token set in cookie");

        // Optionally, verify that the new token was set correctly
        const verifyToken = Cookies.get('archiveToken');
        console.log("Verified token in cookie:", verifyToken);

        if (verifyToken === response.data.token) {
          console.log("Token refresh successful");
        } else {
          console.error("Token refresh failed: new token not set correctly");
        }
      } else {
        console.error("Invalid response from server during token refresh");
      }
    } catch (error) {
      console.error("Refresh token error:", error);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSubmit(event);
    }
  };

  return (
    <DefaultLayout>
      <Card className="max-w-sm mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Log In 👋</h1>

        <form className="space-y-4">
          <Input
            label={t('username')}
            placeholder="Enter your username"
            type="email"
            variant="bordered"
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <Input
            label={t('password')}
            placeholder="Enter your password"
            type="password"
            variant="bordered"
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <Button
            color="primary"
            fullWidth
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <Spinner color="current" size="sm" /> : t('logIn')}
          </Button>
          {error && (
            <Chip
              color="danger"
              variant="flat"
              className="mt-4 w-full justify-center"
            >
              {error}
            </Chip>
          )}
        </form>
      </Card>
    </DefaultLayout>
  );
}
