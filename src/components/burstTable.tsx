import React, { useState } from 'react';
import { Table, User, Tooltip, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Button, Spinner } from "@nextui-org/react";
import ReactPlayer from 'react-player';
import Cookies from 'js-cookie';
import axiosInstance from '../utils/axiosInstance'; // Make sure to import your axiosInstance

interface BurstTableProps {
    session: any;
    transcriptEnabled: boolean;
}

export function BurstTable({ session, transcriptEnabled }: BurstTableProps) {
    const [loading, setLoading] = useState<{ [key: number]: boolean }>({});
    const [transcript, setTranscript] = useState<string>("");

    const handleClick = async (burst: any, index: number) => {
        if (burst.audioUrl || loading[index]) {
            return;
        }
        setLoading(prev => ({ ...prev, [index]: true }));

        const token = Cookies.get('token');

        try {
            const response = await axiosInstance.post(`/get-audio`, {
                burst: burst,
                isTranscriptEnabled: transcriptEnabled,
                filename: session?.filename,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const bufferData = response.data.buffer;
            const buffer = new Uint8Array(bufferData.data);
            const blob = new Blob([buffer], { type: "audio/wav" });
            const url = URL.createObjectURL(blob);
            burst.audioUrl = url;

            if (response.data.transcriptResult) {
                setTranscript(response.data.transcriptResult.text);
            } else if (response.data.transcriptError) {
                console.warn(response.data.transcriptError);
            }
            console.log("Audio URL set:", url);
        } catch (error) {
            console.error("Error fetching audio:", error);
        } finally {
            setLoading(prev => ({ ...prev, [index]: false }));
        }
    };

    return (
        <>
            {session && session.bursts && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4">Bursts for Session: {session.session_name}</h3>
                    <Table
                        aria-label="Bursts table"
                        css={{
                            height: "auto",
                            minWidth: "100%",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        }}
                        selectionMode="none"
                    >
                        <TableHeader>
                            <TableColumn>TALKER</TableColumn>
                            <TableColumn>START TIME</TableColumn>
                            <TableColumn>DURATION</TableColumn>
                            <TableColumn>ACTIONS</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {session.bursts.map((burst: any, index: number) => (
                                <TableRow key={index} onClick={() => handleClick(burst, index)}>
                                    <TableCell>
                                        <User
                                            name={burst.talker_name}
                                            avatarProps={{
                                                src: `https://i.pravatar.cc/150?u=${burst.talker_name}`,
                                                size: "sm"
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip content={new Date(burst.time_start).toLocaleString()}>
                                            {burst.time_start_formatted}
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell>
                                        <Chip color="primary" variant="flat">
                                            {burst.duration}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        {loading[index] ? (
                                            <Spinner size="sm" />
                                        ) : burst.audioUrl ? (
                                            <ReactPlayer
                                                key={burst.sequence_id}
                                                url={burst.audioUrl}
                                                controls
                                                height="50px"
                                                width="200px"
                                            />
                                        ) : (
                                            <Button size="sm" onClick={() => handleClick(burst, index)}>
                                                Play Audio
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </>
    );
}