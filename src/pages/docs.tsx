import { useEffect, useState } from "react";
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { Search } from '../components/search';
import { SessionTable } from '../components/sessionTable';
import { BurstTable } from '../components/burstTable';
import dayjs, { Dayjs } from "dayjs";
import Cookies from 'js-cookie';
import axiosInstance from '../utils/axiosInstance';
import { getChannelName, getUserNameById, combineDateAndTime } from '../utils/helpers';
import Long from 'long';
import { Button } from "@nextui-org/react";

export default function DocsPage() {
  const [date, setDate] = useState<string>();
  const [startTime, setStartTime] = useState<string>();
  const [endTime, setEndTime] = useState<string>();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any>();
  const [loading, setLoading] = useState(false);

  // Fetch users when the component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = Cookies.get('token');
        const responseGetUsers = await axiosInstance.get(`/get-users`, {
          headers: {
            Authorization: `Bearer ${token}`, // Add the token to the Authorization header
          },
        });

        // Process the data to convert user_id to string using Long library
        const processedData = responseGetUsers.data.map((user: any) => ({
          ...user,
          user_id: Long.fromBits(user.user_id.low, user.user_id.high, user.user_id.unsigned).toString(),
        }));

        setUsers(processedData);

      } catch (error) {
        console.error('Error fetching users:', error);
        // Handle error (e.g., show an error message to the user)
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchUsers();
  }, [setLoading, setUsers]);

  const handleSearch = async () => {
    try {
      debugger

      // Combine date with start time and end time
      const start = new Date(`${date}T${startTime}`).getTime();
      const end = new Date(`${date}T${endTime}`).getTime();
      const token = Cookies.get('token');
      const response = await axiosInstance.get(`/get-sessions`, {
        params: {
          startTime: start,
          endTime: end,
          userIds: selectedUsers.join(','), // Include selectedUsers in the query parameters
        },
        headers: {
          Authorization: `Bearer ${token}`, // Add the token to the Authorization header
        },
      });

      const data = response.data;

      const updatedSessions = data.map((session: Session, index: number) => {
        const senderName = getUserNameById(users, session.sender_id);
        const receiverName = getUserNameById(users, session.receiver_id);

        return {
          ...session,
          sender_name: senderName,
          receiver_name: receiverName,
          session_name: getChannelName(session.session_name, receiverName, senderName),
          id: index, // Ensure unique IDs by using the current index
        };
      });
      setSessions(updatedSessions);
      //setBursts([]); // Clear the bursts list before fetching new ones
    } catch (error) {
      console.error('Error fetching sessions:', error);
      // Handle error (e.g., show an error message to the user)
    } finally {
      setLoading(false); // Stop loading
    }
  }


  return (
    <DefaultLayout>
      <Search date={date} setDate={setDate} startTime={startTime} setStartTime={setStartTime} endTime={endTime} setEndTime={setEndTime} />
      <div className="flex flex-col gap-4 p-4 max-w-xl mx-auto">
        <Button color="primary" onPress={handleSearch}>
          Search
        </Button>
      </div>
      <SessionTable data={sessions} setSelectedSession={setSelectedSession} />
      {selectedSession && selectedSession.bursts &&
        <BurstTable session={selectedSession} />
      }
    </DefaultLayout>
  );
};
