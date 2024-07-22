import Long from 'long';
import { Dayjs } from 'dayjs';

const USER_NOT_FOUND = "User Not Found";

export function getChannelName(sessionName: string, receiverName: string, senderName: string): string {
  if (receiverName === USER_NOT_FOUND || senderName === USER_NOT_FOUND) {
    return sessionName;
  }
  return `${receiverName} - ${senderName}`;
}

export function getUserNameById(users: any, userId: { low: number; high: number; unsigned: boolean } | string): string {
  const userIdStr = typeof userId === 'string' ? userId : convertUserId(userId);
  const user = users.find((user: any) => user.user_id.toString() === userIdStr);
  return user ? user.user_name : "User Not Found";
}

function convertUserId(userId: { low: number; high: number; unsigned: boolean }): string {
  return new Long(userId.low, userId.high, userId.unsigned).toString();
}

export function combineDateAndTime(date: Dayjs, time: Dayjs): Dayjs {
  return date.hour(time.hour()).minute(time.minute()).second(0);
}