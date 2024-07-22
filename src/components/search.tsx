
import { Input, Button, Select, SelectItem } from "@nextui-org/react";
import dayjs, { Dayjs } from "dayjs";

interface SearchProps {
    date: string | undefined;
    setDate: (value: string) => void;
    startTime: string | undefined;
    setStartTime: (value: string) => void;
    endTime: string | undefined;
    setEndTime: (value: string) => void;
}

export function Search({ date, setDate, startTime, endTime, setStartTime, setEndTime }: SearchProps) {

    const handleSearch = () => {

    };

    return (
        <div className="flex flex-col gap-4 p-4 max-w-xl mx-auto">
            <Input
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
            />
            <div className="flex gap-4">
                <Input
                    label="Start Time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                />
                <Input
                    label="End Time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                />
            </div>
            {/* <Select
                label="Select User"
                placeholder="Choose a user"
                onChange={(e) => setSelectedUser(e.target.value)}
            >
                {users.map((user) => (
                    <SelectItem key={user} value={user}>
                        {user}
                    </SelectItem>
                ))}
            </Select> */}
        </div>
    );
}