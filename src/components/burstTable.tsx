import { Table, User, Tooltip, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip } from "@nextui-org/react";

interface BurstTableProps {
    session: any;
}
export function BurstTable({ session }: BurstTableProps) {
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
                                <TableRow key={index}>
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
                                        <Tooltip content="View Details">
                                            <button className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                                {/* <EyeIcon /> */}
                                            </button>
                                        </Tooltip>
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