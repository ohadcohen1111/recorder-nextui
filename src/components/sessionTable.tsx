import React, { useState, useMemo } from 'react';
import { Table, User, Tooltip, TableHeader, TableColumn, TableBody, TableRow, TableCell, Input, Button, DropdownTrigger, Dropdown, DropdownMenu, DropdownItem, Chip, Pagination, Card, CardBody } from "@nextui-org/react";
import { SearchIcon } from "@nextui-org/shared-icons";
interface SessionTableProps {
    data: any[];
    setSelectedSession: (session: any) => void;
}

export function SessionTable({ data, setSelectedSession }: SessionTableProps) {
    const [filterValue, setFilterValue] = useState("");
    const [selectedPriority, setSelectedPriority] = useState("all");
    const [page, setPage] = useState(1);
    const rowsPerPage = 10;

    const columns = [
        { name: "CHANNEL", uid: "session_name", sortable: true },
        { name: "PRIORITY", uid: "session_priority", sortable: true },
        { name: "TYPE", uid: "session_type_formatted", sortable: true },
        { name: "START TIME", uid: "time_start", sortable: true },
    ];

    const filteredItems = useMemo(() => {
        let filteredData = [...data];

        if (filterValue) {
            filteredData = filteredData.filter(item =>
                item.session_name.toLowerCase().includes(filterValue.toLowerCase())
            );
        }

        if (selectedPriority !== "all") {
            filteredData = filteredData.filter(item =>
                item.session_priority.toLowerCase() === selectedPriority.toLowerCase()
            );
        }

        return filteredData;
    }, [data, filterValue, selectedPriority]);

    const pages = Math.ceil(filteredItems.length / rowsPerPage);

    const items = useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return filteredItems.slice(start, end);
    }, [page, filteredItems]);

    const renderCell = (item: any, columnKey: React.Key) => {
        const cellValue = item[columnKey as keyof typeof item];

        switch (columnKey) {
            case "session_priority":
                return (
                    <Chip color={cellValue === "High" ? "danger" : cellValue === "Medium" ? "warning" : "success"} variant="flat">
                        {cellValue}
                    </Chip>
                );
            case "time_start":
                return new Date(cellValue).toLocaleString();
            default:
                return cellValue;
        }
    };

    const onSearchChange = (value?: string) => {
        if (value) {
            setFilterValue(value);
            setPage(1);
        } else {
            setFilterValue("");
        }
    };

    const onClear = () => {
        setFilterValue("");
        setPage(1);
    };


    const handleRowClick = (item: any) => {
        setSelectedSession(item);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-3">
                <Input
                    isClearable
                    className="w-full sm:max-w-[44%]"
                    placeholder="Search by channel..."
                    startContent={<SearchIcon />}
                    value={filterValue}
                    onClear={onClear}
                    onValueChange={onSearchChange}
                />
                <Dropdown>
                    <DropdownTrigger>
                        <Button variant="flat">
                            Priority: {selectedPriority === "all" ? "All" : selectedPriority}
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        aria-label="Priority selection"
                        onAction={(key) => setSelectedPriority(key as string)}
                    >
                        <DropdownItem key="all">All</DropdownItem>
                        <DropdownItem key="High">High</DropdownItem>
                        <DropdownItem key="Medium">Medium</DropdownItem>
                        <DropdownItem key="Low">Low</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
            <Table
                aria-label="Enhanced table with sorting and filtering"
                bottomContent={
                    <div className="flex w-full justify-center">
                        <Pagination
                            isCompact
                            showControls
                            showShadow
                            color="primary"
                            page={page}
                            total={pages}
                            onChange={(page) => setPage(page)}
                        />
                    </div>
                }
                selectionMode="single"
                onRowAction={(key) => handleRowClick(data[key])}
            >
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn key={column.uid} allowsSorting={column.sortable}>
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody items={items}>
                    {(item) => (
                        <TableRow key={item.id}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

